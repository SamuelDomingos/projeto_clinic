import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleRule } from './schedule-rule.entity';
import { ScheduleRuleService } from './schedule-rule.service';
import { ScheduleRuleController } from './schedule-rule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleRule])],
  controllers: [ScheduleRuleController],
  providers: [ScheduleRuleService],
  exports: [ScheduleRuleService],
})
export class ScheduleRuleModule {} 