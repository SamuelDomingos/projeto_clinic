import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEvent } from './schedule-event.entity';

@Injectable()
export class ScheduleEventService {
  constructor(
    @InjectRepository(ScheduleEvent)
    private readonly repo: Repository<ScheduleEvent>,
  ) {}

  create(data: Partial<ScheduleEvent>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, data: Partial<ScheduleEvent>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 