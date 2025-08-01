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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido de compra' })
  @ApiResponse({ status: 201, description: 'Pedido de compra criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() body: any) {
    return this.purchaseOrdersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista pedidos de compra' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos de compra.' })
  async findAll(@Query() query: any) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pedido de compra pelo ID' })
  @ApiResponse({ status: 200, description: 'Pedido de compra encontrado.' })
  @ApiResponse({ status: 404, description: 'Pedido de compra não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um pedido de compra pelo ID' })
  @ApiResponse({ status: 200, description: 'Pedido de compra atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pedido de compra não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.purchaseOrdersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um pedido de compra pelo ID' })
  @ApiResponse({ status: 200, description: 'Pedido de compra removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pedido de compra não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}