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
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.paymentMethodsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.paymentMethodsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.paymentMethodsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }
} 