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
import { ProtocolServicesService } from './protocol-services.service';

@Controller('protocol-services')
export class ProtocolServicesController {
  constructor(private readonly protocolServicesService: ProtocolServicesService) {}

  @Post()
  async create(@Body() body: any) {
    return this.protocolServicesService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.protocolServicesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.protocolServicesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.protocolServicesService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.protocolServicesService.remove(id);
  }
} 