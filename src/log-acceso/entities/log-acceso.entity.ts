import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type EventoAcceso = 'ingreso' | 'salida';

@Entity('log_acceso')
export class LogAcceso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ length: 45 })
  ip: string;

  @Column({ type: 'enum', enum: ['ingreso', 'salida'] })
  evento: EventoAcceso;

  @Column({ length: 255 })
  navegador: string;

  @CreateDateColumn({ name: 'fecha_hora' })
  fechaHora: Date;
}