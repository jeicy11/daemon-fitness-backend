import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @Length(4, 20)
  usuarioUsuario: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @Length(7, 100)
  clave: string;

  @ApiProperty({ description: 'Token generado por el widget de reCAPTCHA' })
  @IsString()
  captchaToken: string;
}