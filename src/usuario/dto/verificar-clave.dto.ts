import { IsString, Length } from 'class-validator';

export class VerificarClaveDto {
  @IsString()
  @Length(1, 100)
  clave: string;
}