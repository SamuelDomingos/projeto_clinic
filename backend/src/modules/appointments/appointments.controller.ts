import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
} 