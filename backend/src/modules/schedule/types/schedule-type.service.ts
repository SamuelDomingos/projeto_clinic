import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleType } from './schedule-type.entity';

@Injectable()
export class ScheduleTypeService {
  constructor(
    @InjectRepository(ScheduleType)
    private readonly repo: Repository<ScheduleType>,
  ) {}

  create(data: Partial<ScheduleType>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  update(id: string, data: Partial<ScheduleType>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
} 