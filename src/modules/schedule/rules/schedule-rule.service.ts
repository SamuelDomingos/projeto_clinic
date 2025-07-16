import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleRule } from './schedule-rule.entity';

@Injectable()
export class ScheduleRuleService {
  constructor(
    @InjectRepository(ScheduleRule)
    private readonly repo: Repository<ScheduleRule>,
  ) {}

  create(data: Partial<ScheduleRule>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, data: Partial<ScheduleRule>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 