import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsuarioService } from '../usuario/usuario.service';
import { LogAccesoService } from '../log-acceso/log-acceso.service';
import { CaptchaService } from './captcha.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { evaluarFortalezaClave } from '../common/password-strength.util';

const MAX_INTENTOS = 3;
const MINUTOS_BLOQUEO = 5;
const HORAS_VIGENCIA_RESET = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly logAccesoService: LogAccesoService,
    private readonly captchaService: CaptchaService,
    private readonly mailService: MailService,
  ) {}

  async login(dto: LoginDto, ip: string, navegador: string) {
    // Punto 10: CAPTCHA verificado antes que cualquier otra cosa
    await this.captchaService.verificar(dto.captchaToken);

    const usuario = await this.usuarioService.findByUsuarioUsuario(dto.usuarioUsuario);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Punto 11: si está bloqueado, ni siquiera se compara la contraseña
    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta.getTime() > Date.now()) {
      const minutosRestantes = Math.ceil((usuario.bloqueadoHasta.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
      );
    }

    const claveValida = await bcrypt.compare(dto.clave, usuario.usuarioClave);

    if (!claveValida) {
      usuario.intentosFallidos += 1;

      if (usuario.intentosFallidos >= MAX_INTENTOS) {
        usuario.bloqueadoHasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60000);
        usuario.intentosFallidos = 0;
        await this.usuarioService.save(usuario);
        throw new UnauthorizedException(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${MINUTOS_BLOQUEO} minutos.`,
        );
      }

      await this.usuarioService.save(usuario);
      const restantes = MAX_INTENTOS - usuario.intentosFallidos;
      throw new UnauthorizedException(
        `Usuario o contraseña incorrectos. Te quedan ${restantes} intento(s) antes del bloqueo.`,
      );
    }

    // Login correcto: se limpia el contador de intentos fallidos
    if (usuario.intentosFallidos > 0 || usuario.bloqueadoHasta) {
      usuario.intentosFallidos = 0;
      usuario.bloqueadoHasta = null;
      await this.usuarioService.save(usuario);
    }

    await this.logAccesoService.registrar(usuario.usuarioId, ip, 'ingreso', navegador);

    const payload = {
      sub: usuario.usuarioId,
      usuarioUsuario: usuario.usuarioUsuario,
      rol: usuario.usuarioRol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.usuarioId,
        nombre: usuario.usuarioNombre,
        apellido: usuario.usuarioApellido,
        rol: usuario.usuarioRol,
      },
    };
  }

  async logout(usuarioId: number, ip: string, navegador: string) {
    await this.logAccesoService.registrar(usuarioId, ip, 'salida', navegador);
    return { message: 'Sesión cerrada' };
  }

  // ============================================================
  // Punto 12: recuperación de contraseña
  // ============================================================

  async solicitarRecuperacion(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const usuario = await this.usuarioService.findByEmail(dto.email);

    // Mismo mensaje exista o no el correo -- no revela si un email
    // está registrado en el sistema.
    const mensaje = 'Si el correo está registrado, se envió un enlace de recuperación.';
    if (!usuario) return { message: mensaje };

    const tokenPlano = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');

    usuario.resetToken = tokenHash;
    usuario.resetTokenExpira = new Date(Date.now() + HORAS_VIGENCIA_RESET * 3600000);
    await this.usuarioService.save(usuario);

    const urlReset = `http://localhost:5173/restablecer-clave?token=${tokenPlano}`;
    await this.mailService.enviarCorreoRecuperacion(dto.email, urlReset);

    return { message: mensaje };
  }

  async restablecerClave(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const usuario = await this.usuarioService.findByResetToken(tokenHash);

    if (!usuario || !usuario.resetTokenExpira || usuario.resetTokenExpira.getTime() < Date.now()) {
      throw new BadRequestException('El enlace de recuperación no es válido o ha expirado.');
    }

    const fortaleza = evaluarFortalezaClave(dto.claveNueva);
    if (fortaleza === 'debil') {
      throw new BadRequestException('La contraseña nueva es demasiado débil.');
    }

    usuario.usuarioClave = await bcrypt.hash(dto.claveNueva, 10);
    usuario.resetToken = null;
    usuario.resetTokenExpira = null;
    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;
    await this.usuarioService.save(usuario);

    return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
  }
}