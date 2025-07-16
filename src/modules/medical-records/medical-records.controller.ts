import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  async create(@Body() body: any, @Req() req) {
    return this.medicalRecordsService.create(body, req.user.id);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.medicalRecordsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.medicalRecordsService.update(id, body, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.medicalRecordsService.remove(id, req.user.id);
  }
} 