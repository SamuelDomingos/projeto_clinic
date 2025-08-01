import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

import { PatientProtocolsService } from '../patient-protocols/patient-protocols.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CategoriesService } from '../categories/categories.service'; // Adicionar esta linha

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(InvoicePayment)
    private readonly invoicePaymentRepository: Repository<InvoicePayment>,
    private readonly dataSource: DataSource,
    private readonly patientProtocolsService: PatientProtocolsService,
    private readonly transactionsService: TransactionsService,
    private readonly categoriesService: CategoriesService, // Adicionar esta linha
  ) {}

  async generateInvoiceNumber(type: string): Promise<string> {
    const prefix = type === 'budget' ? 'ORÇ' : 'FAT';
    const lastInvoice = await this.invoiceRepository.findOne({
      where: { number: ILike(`${prefix}-%`) },
      order: { number: 'DESC' },
    });
    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.number.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
  }

  async create(data: any) {
    if (!data) {
      throw new BadRequestException('Dados do body não enviados!');
    }
    const { items } = data;
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('O campo items deve ser um array com pelo menos um item.');
    }
    return this.dataSource.transaction(async (manager) => {
      const {
        type,
        patientId,
        protocolId,
        performedBy,
        notes,
        items,
        payments,
        discount,
        discountType,
      } = data;
      const number = await this.generateInvoiceNumber(type);
      const subtotal = (items as any[]).reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );
      const discountValue =
        discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
      const total = subtotal - discountValue;
      const invoice = manager.create(Invoice, {
        number: String(number),
        type: String(type),
        status: type === 'budget' ? 'pending' : 'invoiced',
        date: new Date(),
        performedBy: String(performedBy),
        notes: notes ? String(notes) : '',
        subtotal: subtotal.toFixed(2),
        discount: discountValue.toFixed(2),
        discountType: String(discountType),
        total: total.toFixed(2),
        patientId: String(patientId),
        protocolId: protocolId ? String(protocolId) : undefined,
      });
      await manager.save(invoice);
      // Criação automática do PatientProtocol se for orçamento (budget)
      if (type === 'budget') {
        const patientProtocol = await this.patientProtocolsService.create({
          patientId: String(patientId),
          protocolId: String(protocolId),
          purchaseDate: new Date(),
          status: 'active'
        });
      }
      for (const item of items as any[]) {
        if (
          !item.protocolId ||
          typeof item.protocolId !== 'string' ||
          item.protocolId.trim() === ''
        ) {
          throw new BadRequestException(
            'protocolId é obrigatório e deve ser um UUID válido em cada item!',
          );
        }
        const invoiceItem = manager.create(InvoiceItem, {
          invoiceId: invoice.id,
          protocolId: item.protocolId,
          quantity: Number(item.quantity),
          price: Number(item.price).toFixed(2),
          total: (Number(item.price) * Number(item.quantity)).toFixed(2),
        });
        await manager.save(invoiceItem);
        const savedItem = await manager.findOne(InvoiceItem, {
          where: { id: invoiceItem.id },
        });
      }
      if (type === 'invoice' && payments && payments.length > 0) {
        for (const payment of payments as any[]) {
          const invoicePayment = new InvoicePayment();
          invoicePayment.paymentMethodId =
            payment.paymentMethodId && payment.paymentMethodId.trim()
              ? payment.paymentMethodId.trim()
              : null;
          invoicePayment.paymentMethodName = payment.paymentMethodName || '';
          invoicePayment.dueDate = payment.dueDate;
          invoicePayment.controlNumber = payment.controlNumber || '';
          invoicePayment.description = payment.description || '';
          invoicePayment.installments = payment.installments || 1;
          invoicePayment.installmentValue = payment.installmentValue
            ? Number(payment.installmentValue).toFixed(2)
            : '0.00';
          invoicePayment.totalValue = payment.totalValue
            ? Number(payment.totalValue).toFixed(2)
            : '0.00';
          invoicePayment.cardBrand = payment.cardBrand || null;
          invoicePayment.invoice = invoice;
          await manager.save(invoicePayment);
        }
      }
      // Retorna o invoice salvo diretamente, sem buscar novamente
      return invoice;
    });
  }

  async findAll(query: any = {}) {
    const { type, status, search } = query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) where.number = ILike(`%${search}%`);
    return this.invoiceRepository.find({
      where,
      relations: ['patient', 'protocol', 'items', 'items.protocol', 'payments', 'payments.paymentMethod'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string) {
    return this.invoiceRepository.find({
      where: { patientId },
      relations: [
        'patient',
        'protocol',
        'items',
        'items.protocol',
        'payments',
        'payments.paymentMethod',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['patient', 'protocol', 'items', 'items.protocol', 'payments', 'payments.paymentMethod'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, data: any) {
    return this.dataSource.transaction(async manager => {
      const { status, performedBy, notes, items, payments, discount, discountType } = data;
      const invoice = await manager.findOne(Invoice, { where: { id } });
      if (!invoice) throw new NotFoundException('Invoice not found');
      
      if (data.type === 'invoice' && invoice.type !== 'invoice') {
        await manager.update(Invoice, id, { type: 'invoice' });
        invoice.type = 'invoice';
      }
      
      const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      const discountValue = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
      const total = subtotal - discountValue;
      
      await manager.update(Invoice, id, {
        status: String(status),
        performedBy: String(performedBy),
        notes: notes ? String(notes) : '',
        discount: discountValue.toFixed(2),
        discountType: String(discountType),
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
      });
      
      // Atualizar itens
      await manager.delete(InvoiceItem, { invoiceId: id });
      for (const item of items) {
        const invoiceItem = manager.create(InvoiceItem, {
          invoiceId: id,
          protocolId: String(item.protocolId),
          quantity: Number(item.quantity),
          price: Number(item.price).toFixed(2),
          total: (Number(item.price) * Number(item.quantity)).toFixed(2),
        });
        await manager.save(invoiceItem);
      }
      
      // Atualizar pagamentos
      await manager.delete(InvoicePayment, { invoice: { id } });
      if (Array.isArray(payments) && payments.length > 0) {
        for (const payment of payments) {
          // VERIFICAR/CRIAR CATEGORIA PADRÃO PARA CADA PAGAMENTO
          const defaultCategory = await this.categoriesService.findOrCreateDefaultCategory('revenue', payment.userId || 'system');
          
          const paymentMethodId = payment.paymentMethodId && payment.paymentMethodId.trim() 
            ? payment.paymentMethodId 
            : null;
          
          const invoicePayment = manager.create(InvoicePayment, {
            invoice: invoice,
            paymentMethodId: payment.paymentMethodId,
            paymentMethodName: payment.paymentMethodName,
            dueDate: payment.dueDate,
            description: payment.description,
            installments: payment.installments || 1,
            installmentValue: payment.amount.toFixed(2),
            totalValue: payment.amount.toFixed(2),
            cardBrand: payment.cardBrand
          });
          
          await manager.save(invoicePayment);
          
          // CRIAR A TRANSAÇÃO AUTOMATICAMENTE COM A CATEGORIA PADRÃO!
          const transactionData = {
            type: 'revenue',
            amount: payment.amount,
            description: payment.description || `Pagamento da Fatura ${invoice.number}`,
            category: defaultCategory.id, // USAR O ID DA CATEGORIA PADRÃO
            paymentMethod: payment.paymentMethodName,
            dueDate: payment.dueDate,
            status: 'completed',
            invoiceId: invoice.id,
            boletoNumber: `PAY-${invoice.number}-${Date.now()}`,
            createdBy: payment.userId,
            updatedBy: payment.userId
          };
          
          // Criar a transação usando o TransactionsService
          await this.transactionsService.create(transactionData, payment.userId);
        }
      }
      
      // Retornar a fatura atualizada
      return await manager.findOne(Invoice, {
        where: { id },
        relations: ['patient', 'protocol', 'items', 'items.protocol', 'payments', 'payments.paymentMethod']
      });
    });
  }

  // Método simplificado para verificar status de pagamento (agora fora do método update)
  async getInvoicePaymentStatus(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['payments', 'patient']
    });
    
    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }
    
    // Calcular total pago somando todos os InvoicePayments
    const totalPaid = invoice.payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.totalValue);
    }, 0);
    
    const totalInvoice = parseFloat(invoice.total);
    const remaining = totalInvoice - totalPaid;
    
    // Determinar status
    let paymentStatus = 'unpaid';
    if (totalPaid > 0 && remaining > 0) {
      paymentStatus = 'partial';
    } else if (remaining <= 0) {
      paymentStatus = 'paid';
      // Atualizar status da invoice
      invoice.status = 'paid';
      await this.invoiceRepository.save(invoice);
    }
    
    return {
      invoice: {
        id: invoice.id,
        number: invoice.number,
        patient: invoice.patient,
        total: totalInvoice,
        totalPaid: totalPaid,
        remaining: Math.max(0, remaining),
        paymentStatus,
        status: invoice.status
      },
      payments: invoice.payments,
      summary: {
        isFullyPaid: remaining <= 0,
        needsMorePayment: remaining > 0,
        paymentPercentage: totalInvoice > 0 ? (totalPaid / totalInvoice) * 100 : 0,
        numberOfPayments: invoice.payments.length
      }
    };
  }

  async calculateInvoice(data: any) {
    const { items, discount = 0, discountType = 'fixed', payments = [] } = data;
    
    // Calcular subtotal dos itens
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.price;
    }
    
    // Calcular desconto
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
    
    const total = subtotal - discountAmount;
    
    // Calcular total recebido dos pagamentos
    const totalReceived = payments.reduce((sum: number, payment: any) => {
      return sum + (payment.totalValue || 0);
    }, 0);
    
    // Determinar status do pagamento
    let paymentStatus = 'pending';
    if (totalReceived >= total) {
      paymentStatus = 'paid';
    } else if (totalReceived > 0) {
      paymentStatus = 'partial';
    }
    
    return {
      subtotal,
      discount: discountAmount,
      discountType,
      total,
      totalReceived,
      paymentStatus
    };
  }

  async processInvoicePayment(invoiceId: string, paymentData: any) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['payments', 'patient'] // Adicionar relação com patient
    });
    
    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }
    
    // VERIFICAR/CRIAR CATEGORIA PADRÃO ANTES DE PROCESSAR O PAGAMENTO
    const defaultCategory = await this.categoriesService.findOrCreateDefaultCategory('revenue', paymentData.userId || 'system');
    
    // Converter paymentMethodId vazio para null
    const processedPaymentData = {
      ...paymentData,
      paymentMethodId: paymentData.paymentMethodId === '' ? null : paymentData.paymentMethodId
    };
    
    const payment = this.invoicePaymentRepository.create({
      invoice: { id: invoiceId },
      ...processedPaymentData,
      totalValue: paymentData.amount,
      installmentValue: paymentData.amount / (paymentData.installments || 1)
    });
    
    const savedPayment = await this.invoicePaymentRepository.save(payment);
    
    // Criar transação correspondente COM A CATEGORIA PADRÃO
    try {
      // Construir descrição com nome do paciente
      const patientName = invoice.patient?.name || 'Paciente não identificado';
      
      // SEMPRE criar a descrição com o nome do paciente
      const description = `Pagamento via ${paymentData.paymentMethodName || 'método não especificado'} - ${patientName}`;
      
      await this.transactionsService.create({
        type: 'revenue',
        amount: paymentData.amount,
        description: description, // Descrição com nome do paciente
        category: defaultCategory.id, // USAR O ID DA CATEGORIA PADRÃO
        paymentMethod: paymentData.paymentMethodName || 'não especificado', // Usar apenas um campo
        paidViaId: paymentData.paidViaId, // Adicionar conta bancária
        dueDate: new Date() // Data de vencimento/recebimento
      }, paymentData.userId || null);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      // Não falhar o pagamento se a transação falhar
    }
    
    return savedPayment;
  }

  async remove(id: string) {
    return this.dataSource.transaction(async manager => {
      const invoice = await manager.findOne(Invoice, { 
        where: { id },
        relations: ['items', 'payments']
      });
      
      if (!invoice) {
        throw new NotFoundException('Fatura não encontrada');
      }
      
      // Deletar itens relacionados
      await manager.delete(InvoiceItem, { invoiceId: id });
      
      // Deletar pagamentos relacionados
      await manager.delete(InvoicePayment, { invoice: { id } });
      
      // Deletar a fatura
      await manager.delete(Invoice, { id });
      
      return { message: 'Fatura deletada com sucesso' };
    });
  }
  
  async convertToInvoice(id: string) {
    return this.dataSource.transaction(async manager => {
      const budget = await manager.findOne(Invoice, {
        where: { id, type: 'budget' },
        relations: ['items', 'payments']
      });
      
      if (!budget) {
        throw new NotFoundException('Orçamento não encontrado');
      }
      
      if (budget.type !== 'budget') {
        throw new BadRequestException('Este item já é uma fatura');
      }
      
      // Gerar novo número de fatura
      const invoiceNumber = await this.generateInvoiceNumber('invoice');
      
      // Atualizar o tipo e número
      await manager.update(Invoice, id, {
        type: 'invoice',
        number: invoiceNumber,
        status: 'pending'
      });
      
      // Buscar a fatura atualizada
      const updatedInvoice = await manager.findOne(Invoice, {
        where: { id },
        relations: ['patient', 'protocol', 'items', 'items.protocol', 'payments', 'payments.paymentMethod']
      });
      
      return updatedInvoice;
    });
  }
}