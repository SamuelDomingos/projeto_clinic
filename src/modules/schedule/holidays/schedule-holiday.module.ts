import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleHoliday } from './schedule-holiday.entity';
import { ScheduleHolidayService } from './schedule-holiday.service';
import { ScheduleHolidayController } from './schedule-holiday.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleHoliday])],
  controllers: [ScheduleHolidayController],
  providers: [ScheduleHolidayService],
  exports: [ScheduleHolidayService],
})
export class ScheduleHolidayModule {} 