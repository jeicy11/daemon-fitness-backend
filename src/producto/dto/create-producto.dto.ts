import {
  IsString,
  Length,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ example: 'CAR-001' })
  @IsString()
  @Length(2, 70)
  productoCodigo: string;

  @ApiProperty({ example: 'Cinta de correr Life Fitness T3' })
  @IsString()
  @Length(2, 70)
  productoNombre: string;

  @ApiProperty({ example: 18500.0, description: 'Valor de adquisición' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  productoPrecio: number;

  @ApiProperty({ example: 4, description: 'Cantidad de unidades' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  productoStock: number;

  @ApiProperty({
    example: 5,
    description: '0=Dar de baja, 1=Pésimo, 2=Malo, 3=Regular, 4=Bueno, 5=Excelente',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  estadoConservacion: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productoFoto?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  categoriaId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  usuarioId: number;
}