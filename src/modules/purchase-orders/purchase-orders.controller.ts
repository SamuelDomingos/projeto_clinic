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
import { PurchaseOrdersService } from './purchase-orders.service';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  async create(@Body() body: any) {
    return this.purchaseOrdersService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.purchaseOrdersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
} 