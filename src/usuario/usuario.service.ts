import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { evaluarFortalezaClave } from '../common/password-strength.util';

const SALT_ROUNDS = 10;

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existe = await this.usuarioRepo.findOne({
      where: { usuarioUsuario: dto.usuarioUsuario },
    });
    if (existe) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    const fortaleza = evaluarFortalezaClave(dto.clave);
    if (fortaleza === 'debil') {
      throw new BadRequestException(
        'La contraseña es demasiado débil. Usa al menos 8 caracteres combinando mayúsculas, minúsculas, números y símbolos.',
      );
    }

    const claveHasheada = await bcrypt.hash(dto.clave, SALT_ROUNDS);

    const nuevo = this.usuarioRepo.create({
      usuarioNombre: dto.usuarioNombre,
      usuarioApellido: dto.usuarioApellido,
      usuarioUsuario: dto.usuarioUsuario,
      usuarioClave: claveHasheada,
      usuarioEmail: dto.usuarioEmail,
      usuarioRol: dto.usuarioRol,
    });

    return this.usuarioRepo.save(nuevo);
  }

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find({ where: { activo: true } });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { usuarioId: id, activo: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return usuario;
  }

  findByUsuarioUsuario(usuarioUsuario: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({ where: { usuarioUsuario } });
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({ where: { usuarioEmail: email, activo: true } });
  }

  findByResetToken(tokenHash: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({ where: { resetToken: tokenHash } });
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    return this.usuarioRepo.save(usuario);
  }

  async cambiarClave(id: number, claveNueva: string): Promise<void> {
    const fortaleza = evaluarFortalezaClave(claveNueva);
    if (fortaleza === 'debil') {
      throw new BadRequestException('La contraseña nueva es demasiado débil.');
    }
    const usuario = await this.findOne(id);
    usuario.usuarioClave = await bcrypt.hash(claveNueva, SALT_ROUNDS);
    await this.usuarioRepo.save(usuario);
  }

  // Usado por el flujo de login/bloqueo y por el de recuperación de clave.
  // No pasa por findOne() porque ahí también necesitamos actualizar
  // usuarios que técnicamente podrían no estar "activos".
  save(usuario: Usuario): Promise<Usuario> {
    return this.usuarioRepo.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.usuarioRepo.save(usuario);
  }
}