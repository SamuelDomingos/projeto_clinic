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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Stock Locations')
@Controller('stock-locations')
export class StockLocationsController {
  constructor(private readonly stockLocationsService: StockLocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo local de estoque' })
  @ApiResponse({ status: 201, description: 'Local de estoque criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() body: any) {
    return this.stockLocationsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista locais de estoque' })
  @ApiResponse({ status: 200, description: 'Lista de locais de estoque.' })
  async findAll(@Query() query: any) {
    return this.stockLocationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um local de estoque pelo ID' })
  @ApiResponse({ status: 200, description: 'Local de estoque encontrado.' })
  @ApiResponse({ status: 404, description: 'Local de estoque não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.stockLocationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um local de estoque pelo ID' })
  @ApiResponse({ status: 200, description: 'Local de estoque atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Local de estoque não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.stockLocationsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um local de estoque pelo ID' })
  @ApiResponse({ status: 200, description: 'Local de estoque removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Local de estoque não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.stockLocationsService.remove(id);
  }
}