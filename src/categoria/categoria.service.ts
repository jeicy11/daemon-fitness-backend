import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    const existe = await this.categoriaRepo.findOne({
      where: { categoriaNombre: dto.categoriaNombre },
    });
    if (existe) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
    const nueva = this.categoriaRepo.create(dto);
    return this.categoriaRepo.save(nueva);
  }

  findAll(): Promise<Categoria[]> {
    return this.categoriaRepo.find({
      where: { activo: true },
      order: { categoriaNombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepo.findOne({
      where: { categoriaId: id, activo: true },
    });
    if (!categoria) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, dto);
    return this.categoriaRepo.save(categoria);
  }

  // Eliminación LÓGICA -- pero primero verifica que no tenga productos
  // activos dependiendo de ella, para no dejar productos "huérfanos"
  // de categoría visible.
  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);

    const productosActivos = await this.categoriaRepo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from('producto', 'p')
      .where('p.categoria_id = :id', { id })
      .andWhere('p.activo = true')
      .getRawOne();

    if (Number(productosActivos.total) > 0) {
      throw new BadRequestException(
        'No se puede eliminar: hay productos activos usando esta categoría',
      );
    }

    categoria.activo = false;
    await this.categoriaRepo.save(categoria);
  }
}