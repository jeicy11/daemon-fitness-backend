import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export type UsuarioRol = 'Administrador' | 'Supervisor' | 'Técnico de Mantenimiento';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'usuario_nombre', length: 40 })
  usuarioNombre: string;

  @Column({ name: 'usuario_apellido', length: 40 })
  usuarioApellido: string;

  @Column({ name: 'usuario_usuario', length: 20, unique: true })
  usuarioUsuario: string;

  @Exclude()
  @Column({ name: 'usuario_clave', length: 100 })
  usuarioClave: string;

  @Column({ name: 'usuario_email', length: 70, nullable: true })
  usuarioEmail: string;

  @Column({
    name: 'usuario_rol',
    type: 'enum',
    enum: ['Administrador', 'Supervisor', 'Técnico de Mantenimiento'],
    default: 'Técnico de Mantenimiento',
  })
  usuarioRol: UsuarioRol;

  @Column({ default: true })
  activo: boolean;

  // Punto 11: bloqueo tras 3 intentos fallidos
  @Exclude()
  @Column({ name: 'intentos_fallidos', type: 'int', default: 0 })
  intentosFallidos: number;

  @Exclude()
  @Column({ name: 'bloqueado_hasta', type: 'datetime', nullable: true })
  bloqueadoHasta: Date | null;

  // Punto 12: recuperación de contraseña
  @Exclude()
    @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  resetToken: string | null;

  @Exclude()
  @Column({ name: 'reset_token_expira', type: 'datetime', nullable: true })
  resetTokenExpira: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}