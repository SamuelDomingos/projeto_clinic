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
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() body: any) {
    return this.invoicesService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.invoicesService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post(':id/convert')
  async convertToInvoice(@Param('id') id: string) {
    return this.invoicesService.convertToInvoice(id);
  }
} 