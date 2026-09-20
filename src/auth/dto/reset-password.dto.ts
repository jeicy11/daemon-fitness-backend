import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @Length(7, 100)
  claveNueva: string;
}