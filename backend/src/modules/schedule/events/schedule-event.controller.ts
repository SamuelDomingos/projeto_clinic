import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleEventService } from './schedule-event.service';
import { ScheduleEvent } from './schedule-event.entity';

@Controller('schedule/events')
export class ScheduleEventController {
  constructor(private readonly service: ScheduleEventService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<ScheduleEvent>) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: Partial<ScheduleEvent>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
} 