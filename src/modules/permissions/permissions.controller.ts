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
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.permissionsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.permissionsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
} 