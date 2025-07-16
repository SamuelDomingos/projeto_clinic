import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleConfig } from './schedule-config.entity';
import { ScheduleConfigService } from './schedule-config.service';
import { ScheduleConfigController } from './schedule-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleConfig])],
  controllers: [ScheduleConfigController],
  providers: [ScheduleConfigService],
  exports: [ScheduleConfigService],
})
export class ScheduleConfigModule {} 