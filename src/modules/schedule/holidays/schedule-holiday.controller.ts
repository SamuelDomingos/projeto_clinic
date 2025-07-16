import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleHolidayService } from './schedule-holiday.service';
import { ScheduleHoliday } from './schedule-holiday.entity';

@Controller('schedule/holidays')
export class ScheduleHolidayController {
  constructor(private readonly service: ScheduleHolidayService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: Partial<ScheduleHoliday>) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: Partial<ScheduleHoliday>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
} 