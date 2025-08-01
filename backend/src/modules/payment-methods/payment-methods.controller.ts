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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo método de pagamento' })
  @ApiResponse({ status: 201, description: 'Método de pagamento criado com sucesso.' })
  async create(@Body() body: any) {
    return this.paymentMethodsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os métodos de pagamento' })
  @ApiResponse({ status: 200, description: 'Lista de métodos de pagamento retornada com sucesso.' })
  async findAll(@Query() query: any) {
    return this.paymentMethodsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar método de pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Método de pagamento retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Método de pagamento não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar método de pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Método de pagamento atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Método de pagamento não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.paymentMethodsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover método de pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Método de pagamento removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Método de pagamento não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }
}