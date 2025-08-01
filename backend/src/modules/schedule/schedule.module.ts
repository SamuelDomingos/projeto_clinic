import { Module } from '@nestjs/common';
import { ScheduleConfigModule } from './config/schedule-config.module';
import { ScheduleTypeModule } from './types/schedule-type.module';
import { ScheduleHolidayModule } from './holidays/schedule-holiday.module';
import { ScheduleEventModule } from './events/schedule-event.module';
import { ScheduleRuleModule } from './rules/schedule-rule.module';

@Module({
  imports: [
    ScheduleConfigModule,
    ScheduleTypeModule,
    ScheduleHolidayModule,
    ScheduleEventModule,
    ScheduleRuleModule,
  ],
})
export class ScheduleModule {} 