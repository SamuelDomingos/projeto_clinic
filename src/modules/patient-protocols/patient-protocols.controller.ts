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
import { PatientProtocolsService } from './patient-protocols.service';

@Controller('patient-protocols')
export class PatientProtocolsController {
  constructor(private readonly patientProtocolsService: PatientProtocolsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.patientProtocolsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.patientProtocolsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientProtocolsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientProtocolsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientProtocolsService.remove(id);
  }
} 