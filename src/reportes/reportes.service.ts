import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Producto } from '../producto/entities/producto.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async generarReporteProductos(): Promise<Buffer> {
    const productos = await this.productoRepo.find({
      where: { activo: true },
      relations: { categoria: true },
      order: { productoNombre: 'ASC' },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Panadería El Croissant', { align: 'center' });
      doc.fontSize(12).text('Reporte de inventario', { align: 'center' });
      doc.moveDown();
      doc.fontSize(9).text(`Generado: ${new Date().toLocaleString('es-BO')}`, {
        align: 'right',
      });
      doc.moveDown(1.5);

      const startX = 40;
      let y = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Código', startX, y);
      doc.text('Producto', startX + 70, y);
      doc.text('Categoría', startX + 260, y);
      doc.text('Precio', startX + 380, y);
      doc.text('Stock', startX + 450, y);
      y += 16;
      doc.moveTo(startX, y).lineTo(555, y).stroke();
      y += 6;

      doc.font('Helvetica').fontSize(9);
      let valorTotalInventario = 0;

      for (const p of productos) {
        if (y > 760) {
          doc.addPage();
          y = 40;
        }
        const precio = Number(p.productoPrecio);
        valorTotalInventario += precio * p.productoStock;

        doc.text(p.productoCodigo, startX, y, { width: 65 });
        doc.text(p.productoNombre, startX + 70, y, { width: 185 });
        doc.text(p.categoria?.categoriaNombre ?? '-', startX + 260, y, { width: 115 });
        doc.text(`Bs ${precio.toFixed(2)}`, startX + 380, y, { width: 65 });
        doc.text(String(p.productoStock), startX + 450, y);
        y += 18;
      }

      y += 10;
      doc.moveTo(startX, y).lineTo(555, y).stroke();
      y += 10;
      doc
        .font('Helvetica-Bold')
        .text(`Valor total del inventario: Bs ${valorTotalInventario.toFixed(2)}`, startX, y);

      doc.end();
    });
  }

  // Datos agregados para el gráfico: stock total por categoría
  async stockPorCategoria(): Promise<{ categoria: string; stock: number }[]> {
    const filas = await this.productoRepo
      .createQueryBuilder('p')
      .leftJoin('p.categoria', 'c')
      .select('c.categoria_nombre', 'categoria')
      .addSelect('SUM(p.producto_stock)', 'stock')
      .where('p.activo = true')
      .groupBy('c.categoria_id')
      .getRawMany();

    return filas.map((f) => ({ categoria: f.categoria, stock: Number(f.stock) }));
  }
}