import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn({ name: 'categoria_id' })
  categoriaId: number;

  @Column({ name: 'categoria_nombre', length: 50 })
  categoriaNombre: string;

  @Column({ name: 'categoria_ubicacion', length: 150, nullable: true })
  categoriaUbicacion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}