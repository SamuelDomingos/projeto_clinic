import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EmployeeResponsesService } from './employee-responses.service';

@Controller('employee-responses')
export class EmployeeResponsesController {
  constructor(private readonly service: EmployeeResponsesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
} 