import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/auth.guards';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @ApiOperation({ summary: 'Descarga el reporte de inventario en PDF' })
  @UseGuards(JwtAuthGuard)
  @Get('productos-pdf')
  async productosPdf(@Res() res: Response) {
    const buffer = await this.reportesService.generarReporteProductos();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-productos.pdf"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Stock total agrupado por categoría (para el gráfico)' })
  @UseGuards(JwtAuthGuard)
  @Get('stock-por-categoria')
  stockPorCategoria() {
    return this.reportesService.stockPorCategoria();
  }
}