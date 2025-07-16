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
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.patientsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
} 