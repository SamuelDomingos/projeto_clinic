import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleType } from './schedule-type.entity';
import { ScheduleTypeService } from './schedule-type.service';
import { ScheduleTypeController } from './schedule-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleType])],
  controllers: [ScheduleTypeController],
  providers: [ScheduleTypeService],
  exports: [ScheduleTypeService],
})
export class ScheduleTypeModule {} 