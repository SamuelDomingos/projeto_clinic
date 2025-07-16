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
import { ProtocolsService } from './protocols.service';

@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.protocolsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.protocolsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.protocolsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.protocolsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.protocolsService.remove(id);
  }
} 