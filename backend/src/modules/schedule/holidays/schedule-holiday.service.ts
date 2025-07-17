import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleHoliday } from './schedule-holiday.entity';

@Injectable()
export class ScheduleHolidayService {
  constructor(
    @InjectRepository(ScheduleHoliday)
    private readonly repo: Repository<ScheduleHoliday>,
  ) {}

  create(data: Partial<ScheduleHoliday>) {
    return this.repo.save(data);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, data: Partial<ScheduleHoliday>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 