import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn({ name: 'producto_id' })
  productoId: number;

  @Column({ name: 'producto_codigo', length: 70, unique: true })
  productoCodigo: string;

  @Column({ name: 'producto_nombre', length: 70 })
  productoNombre: string;

  @Column({ name: 'producto_precio', type: 'decimal', precision: 10, scale: 2 })
  productoPrecio: number;

  @Column({ name: 'producto_stock', type: 'int', default: 0 })
  productoStock: number;

  // 0=Dar de baja, 1=Pésimo, 2=Malo, 3=Regular, 4=Bueno, 5=Excelente
  @Column({ name: 'estado_conservacion', type: 'tinyint', default: 5 })
  estadoConservacion: number;

  @Column({ name: 'producto_foto', length: 255, nullable: true })
  productoFoto: string;

  @Column({ name: 'categoria_id' })
  categoriaId: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}