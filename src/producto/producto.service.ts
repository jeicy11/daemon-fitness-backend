import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async create(dto: CreateProductoDto): Promise<Producto> {
    const existe = await this.productoRepo.findOne({
      where: { productoCodigo: dto.productoCodigo },
    });
    if (existe) {
      throw new ConflictException('Ese código de producto ya existe');
    }
    const nuevo = this.productoRepo.create(dto);
    return this.productoRepo.save(nuevo);
  }

  // Solo activos, con su categoría cargada (útil para listados)
  findAll(): Promise<Producto[]> {
    return this.productoRepo.find({
      where: { activo: true },
      relations: { categoria: true },
      order: { productoNombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepo.findOne({
      where: { productoId: id, activo: true },
      relations: { categoria: true },
    });
    if (!producto) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return producto;
  }

  async update(id: number, dto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    Object.assign(producto, dto);
    return this.productoRepo.save(producto);
  }

  // Eliminación LÓGICA
  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    producto.activo = false;
    await this.productoRepo.save(producto);
  }

  // Útil para el reporte/gráfico de stock bajo más adelante
  findStockBajo(umbral = 5): Promise<Producto[]> {
    return this.productoRepo
      .createQueryBuilder('p')
      .where('p.activo = true')
      .andWhere('p.producto_stock <= :umbral', { umbral })
      .orderBy('p.producto_stock', 'ASC')
      .getMany();
  }
}