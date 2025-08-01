import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleConfig } from './schedule-config.entity';

@Injectable()
export class ScheduleConfigService {
  constructor(
    @InjectRepository(ScheduleConfig)
    private readonly repo: Repository<ScheduleConfig>,
  ) {}

  create(data: Partial<ScheduleConfig>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find({ relations: { unit: true } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: { unit: true } });
  }

  async update(id: string, data: Partial<ScheduleConfig>) {
    await this.repo.update(id, data);
    return this.repo.findOne({
      where: { id },
      relations: { unit: true }
    });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
} 