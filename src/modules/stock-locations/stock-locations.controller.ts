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
import { StockLocationsService } from './stock-locations.service';

@Controller('stock-locations')
export class StockLocationsController {
  constructor(private readonly stockLocationsService: StockLocationsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.stockLocationsService.create(body);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.stockLocationsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stockLocationsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.stockLocationsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stockLocationsService.remove(id);
  }
} 