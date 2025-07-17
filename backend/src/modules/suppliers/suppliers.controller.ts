import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SupplierValidationPipe } from './pipes/supplier-validation.pipe';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UsePipes(SupplierValidationPipe)
  async create(@Body() body: any) {
    return this.suppliersService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Put(':id')
  @UsePipes(SupplierValidationPipe)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Get()
  async search(@Query() query: any) {
    return this.suppliersService.search(query);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.suppliersService.updateStatus(id, status);
  }
} 