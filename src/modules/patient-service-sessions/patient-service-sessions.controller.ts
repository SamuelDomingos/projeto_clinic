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
import { PatientServiceSessionsService } from './patient-service-sessions.service';

@Controller('patient-service-sessions')
export class PatientServiceSessionsController {
  constructor(private readonly patientServiceSessionsService: PatientServiceSessionsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.patientServiceSessionsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.patientServiceSessionsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientServiceSessionsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientServiceSessionsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientServiceSessionsService.remove(id);
  }
} 