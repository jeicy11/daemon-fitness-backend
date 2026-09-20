import { IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Cardio' })
  @IsString()
  @Length(2, 50)
  categoriaNombre: string;

  @ApiPropertyOptional({ example: 'Zona A - Planta baja' })
  @IsOptional()
  @IsString()
  @Length(0, 150)
  categoriaUbicacion?: string;
}