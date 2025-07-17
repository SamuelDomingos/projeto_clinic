import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleConfigService } from './schedule-config.service';
import { ScheduleConfig } from './schedule-config.entity';

@Controller('schedule/config')
export class ScheduleConfigController {
  constructor(private readonly service: ScheduleConfigService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<ScheduleConfig>) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<ScheduleConfig>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
} 