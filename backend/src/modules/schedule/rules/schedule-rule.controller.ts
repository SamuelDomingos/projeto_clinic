import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleRuleService } from './schedule-rule.service';
import { ScheduleRule } from './schedule-rule.entity';

@Controller('schedule/rules')
export class ScheduleRuleController {
  constructor(private readonly service: ScheduleRuleService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<ScheduleRule>) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: Partial<ScheduleRule>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
} 