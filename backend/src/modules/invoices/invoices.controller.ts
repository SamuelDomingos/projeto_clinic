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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova fatura' })
  @ApiResponse({ status: 201, description: 'A fatura foi criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async create(@Body() body: any) {
    return this.invoicesService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Obter todas as faturas' })
  @ApiResponse({ status: 200, description: 'Faturas retornadas com sucesso.' })
  async findAll(@Query() query: any) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma fatura por ID' })
  @ApiResponse({ status: 200, description: 'Fatura retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma fatura por ID' })
  @ApiResponse({ status: 200, description: 'A fatura foi atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.invoicesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma fatura por ID' })
  @ApiResponse({ status: 200, description: 'A fatura foi removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Converter uma fatura' })
  @ApiResponse({ status: 200, description: 'Fatura convertida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  async convertToInvoice(@Param('id') id: string) {
    return this.invoicesService.convertToInvoice(id);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calcular fatura' })
  @ApiResponse({ status: 200, description: 'Fatura calculada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async calculateInvoice(@Body() body: any) {
    return this.invoicesService.calculateInvoice(body);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obter faturas por ID do paciente' })
  @ApiResponse({ status: 200, description: 'Faturas retornadas com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  async findByPatient(@Param('patientId') patientId: string) {
    return this.invoicesService.findByPatient(patientId);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Processar pagamento de fatura' })
  @ApiResponse({ status: 200, description: 'Pagamento processado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  async processPayment(
    @Param('id') invoiceId: string,
    @Body() paymentData: {
      amount: number;
      paymentMethodId: string;
      paymentMethodName: string;
      description?: string;
      userId: string;
      dueDate: Date;
      installments?: number;
      cardBrand?: string;
    }
  ) {
    return this.invoicesService.processInvoicePayment(invoiceId, paymentData);
  }

  @Get(':id/payment-status')
  @ApiOperation({ summary: 'Obter status de pagamento da fatura' })
  @ApiResponse({ status: 200, description: 'Status de pagamento retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  async getPaymentStatus(@Param('id') invoiceId: string) {
    return this.invoicesService.getInvoicePaymentStatus(invoiceId);
  }
}