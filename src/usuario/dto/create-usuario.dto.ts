import {
  IsString,
  Length,
  Matches,
  IsOptional,
  IsEmail,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Sofía' })
  @IsString()
  @Length(3, 40)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, {
    message: 'usuarioNombre solo puede contener letras y espacios',
  })
  usuarioNombre: string;

  @ApiProperty({ example: 'Gutiérrez' })
  @IsString()
  @Length(3, 40)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, {
    message: 'usuarioApellido solo puede contener letras y espacios',
  })
  usuarioApellido: string;

  @ApiProperty({ example: 'sgutierrez' })
  @IsString()
  @Length(4, 20)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'usuarioUsuario solo puede contener letras y números',
  })
  usuarioUsuario: string;

  @ApiProperty({ example: 'Supervisor2026!' })
  @IsString()
  @Length(7, 100)
  clave: string;

  @ApiPropertyOptional({ example: 'sofia@daemonfitness.com' })
  @IsOptional()
  @IsEmail()
  usuarioEmail?: string;

  @ApiProperty({
    example: 'Supervisor',
    enum: ['Administrador', 'Supervisor', 'Técnico de Mantenimiento'],
  })
  @IsIn(['Administrador', 'Supervisor', 'Técnico de Mantenimiento'])
  usuarioRol: 'Administrador' | 'Supervisor' | 'Técnico de Mantenimiento';
}