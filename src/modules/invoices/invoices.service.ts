import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';

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
    return this.dataSource.transaction(async manager => {
      const { type, patientId, protocolId, performedBy, notes, items, payments, discount, discountType } = data;
      const number = await this.generateInvoiceNumber(type);
      const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      const discountValue = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
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
      console.log('Criando invoice:', invoice);
      await manager.save(invoice);
      for (const item of items) {
        if (!item.protocolId || typeof item.protocolId !== 'string' || item.protocolId.trim() === '') {
          throw new BadRequestException('protocolId é obrigatório e deve ser um UUID válido em cada item!');
        }
        const invoiceItem = manager.create(InvoiceItem, {
          invoiceId: invoice.id,
          protocolId: item.protocolId,
          quantity: Number(item.quantity),
          price: Number(item.price).toFixed(2),
          total: (Number(item.price) * Number(item.quantity)).toFixed(2),
        });
        console.log('Criando invoiceItem:', invoiceItem);
        await manager.save(invoiceItem);
        const savedItem = await manager.findOne(InvoiceItem, { where: { id: invoiceItem.id } });
        console.log('Salvo no banco invoiceItem:', savedItem);
      }
      if (type === 'invoice' && payments && payments.length > 0) {
        for (const payment of payments) {
          if (!payment.paymentMethodId && !payment.paymentMethodName) {
            throw new BadRequestException('Informe paymentMethodId (UUID) ou paymentMethodName (texto livre) em cada pagamento!');
          }
          const invoicePayment = new InvoicePayment();
          invoicePayment.paymentMethodId = payment.paymentMethodId ? String(payment.paymentMethodId) : '';
          invoicePayment.paymentMethodName = payment.paymentMethodName ? String(payment.paymentMethodName) : '';
          invoicePayment.dueDate = payment.dueDate;
          invoicePayment.controlNumber = payment.controlNumber ? String(payment.controlNumber) : '';
          invoicePayment.description = payment.description ? String(payment.description) : '';
          invoicePayment.installments = Number(payment.installments);
          invoicePayment.installmentValue = Number(payment.installmentValue).toFixed(2);
          invoicePayment.totalValue = Number(payment.totalValue).toFixed(2);
          invoicePayment.invoice = invoice;
          console.log('Criando invoicePayment:', invoicePayment);
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
      if (payments.length > 0) {
        for (const payment of payments) {
          const invoicePayment = new InvoicePayment();
          invoicePayment.paymentMethodId = payment.paymentMethodId ? String(payment.paymentMethodId) : '';
          invoicePayment.paymentMethodName = payment.paymentMethodName ? String(payment.paymentMethodName) : '';
          invoicePayment.dueDate = payment.dueDate;
          invoicePayment.controlNumber = payment.controlNumber ? String(payment.controlNumber) : '';
          invoicePayment.description = payment.description ? String(payment.description) : '';
          invoicePayment.installments = Number(payment.installments);
          invoicePayment.installmentValue = Number(payment.installmentValue).toFixed(2);
          invoicePayment.totalValue = Number(payment.totalValue).toFixed(2);
          invoicePayment.invoice = invoice;
          await manager.save(invoicePayment);
        }
        const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.totalValue), 0);
        if (totalPayments >= total) {
          await manager.update(Invoice, id, { status: 'paid' });
        }
      }
      return this.findOne(id);
    });
  }

  async convertToInvoice(id: string) {
    return this.dataSource.transaction(async manager => {
      const invoice = await manager.findOne(Invoice, { where: { id } });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.type !== 'budget') throw new BadRequestException('Only budgets can be converted to invoices');
      const newNumber = await this.generateInvoiceNumber('invoice');
      await manager.update(Invoice, id, { type: 'invoice', status: 'invoiced', number: newNumber });
      return this.findOne(id);
    });
  }

  async remove(id: string) {
    return this.dataSource.transaction(async manager => {
      const invoice = await manager.findOne(Invoice, { where: { id } });
      if (!invoice) throw new NotFoundException('Invoice not found');
      await manager.delete(InvoiceItem, { invoiceId: id });
      await manager.delete(InvoicePayment, { invoice: { id } });
      await manager.delete(Invoice, { id });
      return { success: true };
    });
  }
} 