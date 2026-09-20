import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAcceso, EventoAcceso } from './entities/log-acceso.entity';

@Injectable()
export class LogAccesoService {
  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepo: Repository<LogAcceso>,
  ) {}

  registrar(usuarioId: number, ip: string, evento: EventoAcceso, navegador: string) {
    const registro = this.logRepo.create({ usuarioId, ip, evento, navegador });
    return this.logRepo.save(registro);
  }
}