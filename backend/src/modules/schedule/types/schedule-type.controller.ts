import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleTypeService } from './schedule-type.service';
import { ScheduleType } from './schedule-type.entity';

@Controller('schedule/types')
export class ScheduleTypeController {
  constructor(private readonly service: ScheduleTypeService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<ScheduleType>) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<ScheduleType>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
} 