import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AttendanceSchedulesService } from './attendance-schedules.service';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';

@Controller('attendance-schedules')
export class AttendanceSchedulesController {
  constructor(private readonly attendanceSchedulesService: AttendanceSchedulesService) {}

  @Post()
  create(@Body() data: Partial<AttendanceSchedule>) {
    return this.attendanceSchedulesService.create(data);
  }

  @Get()
  findAll() {
    return this.attendanceSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceSchedulesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<AttendanceSchedule>) {
    return this.attendanceSchedulesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceSchedulesService.remove(id);
  }
} 