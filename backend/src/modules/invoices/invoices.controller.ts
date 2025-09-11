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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar uma nova fatura',
    description: 'Cria uma nova fatura com itens, valores e informações do paciente'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'A fatura foi criada com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        patientId: '60d0fe4f5e2a7b001c8e4a1c',
        invoiceNumber: 'INV-2024-001',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        totalAmount: 250.00,
        status: 'pending',
        items: [
          {
            description: 'Consulta médica',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({
    description: 'Dados para criação da fatura',
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1c', description: 'ID do paciente' },
        dueDate: { type: 'string', format: 'date', example: '2024-02-15', description: 'Data de vencimento' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string', example: 'Consulta médica' },
              quantity: { type: 'number', example: 1 },
              unitPrice: { type: 'number', example: 150.00 },
              serviceId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1d' }
            }
          }
        },
        discount: { type: 'number', example: 0, description: 'Desconto aplicado' },
        notes: { type: 'string', example: 'Observações da fatura' }
      },
      required: ['patientId', 'items']
    }
  })
  async create(@Body() body: any) {
    return this.invoicesService.create(body);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obter todas as faturas',
    description: 'Lista todas as faturas com opções de filtro e paginação'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Faturas retornadas com sucesso.',
    schema: {
      example: {
        data: [
          {
            id: '60d0fe4f5e2a7b001c8e4a1b',
            invoiceNumber: 'INV-2024-001',
            patientName: 'João Silva',
            totalAmount: 250.00,
            status: 'pending',
            issueDate: '2024-01-15',
            dueDate: '2024-02-15'
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros por página', example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'paid', 'overdue', 'cancelled'], description: 'Filtrar por status' })
  @ApiQuery({ name: 'patientId', required: false, type: String, description: 'Filtrar por ID do paciente' })
  @ApiQuery({ name: 'startDate', required: false, type: String, format: 'date', description: 'Data inicial do filtro' })
  @ApiQuery({ name: 'endDate', required: false, type: String, format: 'date', description: 'Data final do filtro' })
  async findAll(@Query() query: any) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter uma fatura por ID',
    description: 'Retorna os detalhes completos de uma fatura específica'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Fatura retornada com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        invoiceNumber: 'INV-2024-001',
        patient: {
          id: '60d0fe4f5e2a7b001c8e4a1c',
          name: 'João Silva',
          email: 'joao@email.com'
        },
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        totalAmount: 250.00,
        paidAmount: 0,
        status: 'pending',
        items: [
          {
            id: '60d0fe4f5e2a7b001c8e4a1e',
            description: 'Consulta médica',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00
          }
        ],
        payments: []
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da fatura', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar uma fatura por ID',
    description: 'Atualiza os dados de uma fatura existente'
  })
  @ApiResponse({ status: 200, description: 'A fatura foi atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiParam({ name: 'id', description: 'ID da fatura', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização da fatura',
    schema: {
      type: 'object',
      properties: {
        dueDate: { type: 'string', format: 'date', example: '2024-03-15' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' }
            }
          }
        },
        discount: { type: 'number', example: 10.00 },
        notes: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'paid', 'overdue', 'cancelled'] }
      }
    }
  })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.invoicesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remover uma fatura por ID',
    description: 'Remove uma fatura do sistema (apenas se não tiver pagamentos)'
  })
  @ApiResponse({ status: 200, description: 'A fatura foi removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiResponse({ status: 400, description: 'Não é possível remover fatura com pagamentos.' })
  @ApiParam({ name: 'id', description: 'ID da fatura', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post(':id/convert')
  @ApiOperation({ 
    summary: 'Converter uma fatura',
    description: 'Converte um orçamento em fatura ou altera o tipo da fatura'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Fatura convertida com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        invoiceNumber: 'INV-2024-001',
        status: 'pending',
        convertedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da fatura', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async convertToInvoice(@Param('id') id: string) {
    return this.invoicesService.convertToInvoice(id);
  }

  @Post('calculate')
  @ApiOperation({ 
    summary: 'Calcular fatura',
    description: 'Calcula o valor total de uma fatura com base nos itens, descontos e impostos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Fatura calculada com sucesso.',
    schema: {
      example: {
        subtotal: 200.00,
        discount: 20.00,
        tax: 18.00,
        total: 198.00,
        items: [
          {
            description: 'Consulta médica',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({
    description: 'Dados para cálculo da fatura',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              quantity: { type: 'number', example: 1 },
              unitPrice: { type: 'number', example: 150.00 }
            }
          }
        },
        discount: { type: 'number', example: 10.00 },
        taxRate: { type: 'number', example: 0.1, description: 'Taxa de imposto (0.1 = 10%)' }
      },
      required: ['items']
    }
  })
  async calculateInvoice(@Body() body: any) {
    return this.invoicesService.calculateInvoice(body);
  }

  @Get('patient/:patientId')
  @ApiOperation({ 
    summary: 'Obter faturas por ID do paciente',
    description: 'Lista todas as faturas de um paciente específico'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Faturas retornadas com sucesso.',
    schema: {
      example: [
        {
          id: '60d0fe4f5e2a7b001c8e4a1b',
          invoiceNumber: 'INV-2024-001',
          totalAmount: 250.00,
          status: 'pending',
          issueDate: '2024-01-15',
          dueDate: '2024-02-15'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente', type: String, example: '60d0fe4f5e2a7b001c8e4a1c' })
  async findByPatient(@Param('patientId') patientId: string) {
    return this.invoicesService.findByPatient(patientId);
  }

  @Post(':id/payments')
  @ApiOperation({ 
    summary: 'Processar pagamento de fatura',
    description: 'Registra um pagamento para uma fatura específica'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pagamento processado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1f',
        invoiceId: '60d0fe4f5e2a7b001c8e4a1b',
        amount: 250.00,
        paymentMethod: 'Cartão de Crédito',
        paymentDate: '2024-01-15T14:30:00Z',
        status: 'completed',
        transactionId: 'TXN-2024-001'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da fatura', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados do pagamento',
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 250.00, description: 'Valor do pagamento' },
        paymentMethodId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a20', description: 'ID do método de pagamento' },
        paymentMethodName: { type: 'string', example: 'Cartão de Crédito', description: 'Nome do método de pagamento' },
        description: { type: 'string', example: 'Pagamento da consulta', description: 'Descrição do pagamento' },
        userId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a21', description: 'ID do usuário que processou o pagamento' },
        dueDate: { type: 'string', format: 'date-time', example: '2024-01-15T14:30:00Z', description: 'Data de vencimento' },
        installments: { type: 'number', example: 1, description: 'Número de parcelas' },
        cardBrand: { type: 'string', example: 'Visa', description: 'Bandeira do cartão (se aplicável)' }
      },
      required: ['amount', 'paymentMethodId', 'paymentMethodName', 'userId', 'dueDate']
    }
  })
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
  @ApiOperation({ 
    summary: 'Obter status de pagamento da fatura',
    description: 'Retorna o status detalhado dos pagamentos de uma fatura'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status de pagamento retornado com sucesso.',
    schema: {
      example: {
        invoiceId: '60d0fe4f5e2a7b001c8e4a1b',
        totalAmount: 250.00,
        paidAmount: 100.00,
        remainingAmount: 150.00,
        status: 'partially_paid',
        payments: [
          {
            id: '60d0fe4f5e2a7b001c8e4a1f',
            amount: 100.00,
            paymentMethod: 'Cartão de Crédito',
            paymentDate: '2024-01-15T14:30:00Z',
            status: 'completed'
          }
        ],
        isOverdue: false,
        dueDate: '2024-02-15'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da fatura', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async getPaymentStatus(@Param('id') invoiceId: string) {
    return this.invoicesService.getInvoicePaymentStatus(invoiceId);
  }
}