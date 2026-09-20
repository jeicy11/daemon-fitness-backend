import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './auth.guards';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Inicia sesión (usuario, clave y token de reCAPTCHA)' })
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'desconocida';
    const navegador = req.headers['user-agent'] ?? 'desconocido';
    return this.authService.login(dto, ip, navegador);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cierra sesión y registra el evento en la bitácora' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request & { user: { usuarioId: number } }) {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'desconocida';
    const navegador = req.headers['user-agent'] ?? 'desconocido';
    return this.authService.logout(req.user.usuarioId, ip, navegador);
  }

  @ApiOperation({ summary: 'Solicita el envío de un enlace de recuperación de contraseña' })
  @Post('olvide-clave')
  olvideClave(@Body() dto: ForgotPasswordDto) {
    return this.authService.solicitarRecuperacion(dto);
  }

  @ApiOperation({ summary: 'Establece una nueva contraseña usando el token recibido por correo' })
  @Post('restablecer-clave')
  restablecerClave(@Body() dto: ResetPasswordDto) {
    return this.authService.restablecerClave(dto);
  }
}