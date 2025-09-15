import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { InstallmentInvoicesService } from './installment-invoices.service';

@ApiTags('💳 Faturas Parceladas')
@ApiBearerAuth()
@Controller('installment-invoices')
export class InstallmentInvoicesController {
  constructor(private readonly installmentInvoicesService: InstallmentInvoicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar fatura parcelada',
    description: 'Cria uma nova fatura parcelada para um protocolo de tratamento'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fatura parcelada criada com sucesso',
    schema: {
      example: {
        id: 'uuid-fatura',
        invoiceNumber: 'INV-2024-001',
        patientId: 'uuid-paciente',
        protocolId: 'uuid-protocolo',
        totalAmount: '1200.00',
        totalInstallments: 6,
        installmentValue: '200.00',
        status: 'active',
        createdAt: '2024-01-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente ou protocolo não encontrado'
  })
  create(@Body() createData: {
    patientId: string;
    protocolId: string;
    patientProtocolId: string;
    totalInstallments: number;
    firstDueDate: string;
    notes?: string;
  }) {
    return this.installmentInvoicesService.create({
      ...createData,
      firstDueDate: new Date(createData.firstDueDate)
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as faturas parceladas',
    description: 'Retorna uma lista paginada de todas as faturas parceladas'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de faturas parceladas retornada com sucesso'
  })
  findAll() {
    return this.installmentInvoicesService.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Buscar faturas por paciente',
    description: 'Retorna todas as faturas parceladas de um paciente específico'
  })
  @ApiParam({
    name: 'patientId',
    description: 'ID único do paciente',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Faturas do paciente retornadas com sucesso'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente não encontrado'
  })
  findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.installmentInvoicesService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar fatura por ID',
    description: 'Retorna os detalhes completos de uma fatura parcelada'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da fatura parcelada',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalhes da fatura retornados com sucesso',
    schema: {
      example: {
        id: 'uuid-fatura',
        invoiceNumber: 'INV-2024-001',
        patient: { id: 'uuid', name: 'João Silva' },
        protocol: { id: 'uuid', name: 'Fisioterapia Completa' },
        installments: [
          {
            installmentNumber: 1,
            dueDate: '2024-01-15',
            amount: '200.00',
            status: 'paid',
            paidAt: '2024-01-10'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fatura não encontrada'
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.installmentInvoicesService.findOne(id);
  }

  @Patch(':id/payment/:installmentNumber')
  @ApiOperation({
    summary: 'Atualizar status de pagamento',
    description: 'Atualiza o status de pagamento de uma parcela específica'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da fatura parcelada',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012'
  })
  @ApiParam({
    name: 'installmentNumber',
    description: 'Número da parcela (1, 2, 3...)',
    example: 1
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentMethodId: { type: 'string', example: 'uuid-payment-method' },
        paidDate: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        notes: { type: 'string', example: 'Pagamento realizado via PIX' }
      },
      required: ['paidDate']
    },
    description: 'Dados para atualização do pagamento'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status de pagamento atualizado com sucesso'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fatura ou parcela não encontrada'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de pagamento inválidos'
  })
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('installmentNumber', ParseIntPipe) installmentNumber: number,
    @Body() updateData: {
      paymentMethodId?: string;
      paidDate: string;
      notes?: string;
    }
  ) {
    return this.installmentInvoicesService.updatePaymentStatus(
      id,
      installmentNumber,
      {
        ...updateData,
        paidDate: new Date(updateData.paidDate)
      }
    );
  }

  @Get(':id/payment-history')
  @ApiOperation({
    summary: 'Histórico de pagamentos',
    description: 'Retorna o histórico completo de pagamentos de uma fatura'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da fatura parcelada',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Histórico de pagamentos retornado com sucesso',
    schema: {
      example: {
        installmentInvoiceId: 'uuid-fatura',
        totalPaid: '400.00',
        totalPending: '800.00',
        paymentHistory: [
          {
            id: 'uuid-payment',
            installmentNumber: 1,
            amount: '200.00',
            status: 'paid',
            paymentMethod: 'Cartão de Crédito',
            paidAt: '2024-01-10T14:30:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fatura não encontrada'
  })
  getPaymentHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.installmentInvoicesService.getPaymentHistory(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar fatura parcelada',
    description: 'Cancela uma fatura parcelada (apenas se nenhuma parcela foi paga)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da fatura parcelada',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fatura cancelada com sucesso'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Não é possível cancelar fatura com parcelas pagas'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fatura não encontrada'
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.installmentInvoicesService.remove(id);
  }
}