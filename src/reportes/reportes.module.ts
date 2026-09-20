import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Producto } from '../producto/entities/producto.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}