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

import { PatientProtocolsService } from '../patient-protocols/patient-protocols.service';

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
      console.log('Criando invoice:', invoice);
      await manager.save(invoice);
      // Criação automática do PatientProtocol se for orçamento (budget)
      if (type === 'budget') {
        const patientProtocol = await this.patientProtocolsService.create({
          patientId: String(patientId),
          protocolId: String(protocolId),
          purchaseDate: new Date(),
          status: 'active'
        });
        console.log('PatientProtocol criado automaticamente a partir do orçamento:', patientProtocol.id);
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
        console.log('Criando invoiceItem:', invoiceItem);
        await manager.save(invoiceItem);
        const savedItem = await manager.findOne(InvoiceItem, {
          where: { id: invoiceItem.id },
        });
        console.log('Salvo no banco invoiceItem:', savedItem);
      }
      if (type === 'invoice' && payments && payments.length > 0) {
        for (const payment of payments as any[]) {
          const invoicePayment = new InvoicePayment();
          invoicePayment.paymentMethodId =
            payment.paymentMethodId && payment.paymentMethodId.trim()
              ? payment.paymentMethodId.trim()
              : null;
          console.log('[InvoicePayment] Saving payment:', {
            paymentMethodId: invoicePayment.paymentMethodId,
            paymentMethodName: payment.paymentMethodName,
            cardBrand: payment.cardBrand,
          });
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
        invoice.type = 'invoice'; // Atualiza o objeto em memória também
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
          // Permitir pagamentos avulsos (dinheiro, pix, etc.) sem paymentMethod
          // Para cartão, preencher paymentMethod, cardBrand e installments
          const invoicePayment = new InvoicePayment();
          invoicePayment.paymentMethodId = payment.paymentMethodId && payment.paymentMethodId.trim() ? payment.paymentMethodId.trim() : null;
          invoicePayment.paymentMethodName = payment.paymentMethodName || '';
          invoicePayment.dueDate = payment.dueDate;
          invoicePayment.controlNumber = payment.controlNumber || '';
          invoicePayment.description = payment.description || '';
          invoicePayment.installments = payment.installments || 1;
          invoicePayment.installmentValue = payment.installmentValue ? Number(payment.installmentValue).toFixed(2) : '0.00';
          invoicePayment.totalValue = payment.totalValue ? Number(payment.totalValue).toFixed(2) : '0.00';
          invoicePayment.cardBrand = payment.cardBrand || null;
          invoicePayment.invoice = invoice;
          await manager.save(invoicePayment);
        }
        const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.totalValue), 0);
        if (totalPayments >= total) {
          await manager.update(Invoice, id, { status: 'paid' });
          // Sincronizar protocolos adquiridos
          for (const item of items) {
            let patientProtocol = await manager.getRepository('PatientProtocol').findOne({
              where: { patientId: invoice.patientId, protocolId: item.protocolId }
            });
            if (!patientProtocol) {
              patientProtocol = await manager.getRepository('PatientProtocol').save({
                patientId: invoice.patientId,
                protocolId: item.protocolId,
                purchaseDate: new Date(),
                status: 'active',
              });
              // Cria as sessões para o novo PatientProtocol usando o mesmo manager
              const protocol = await manager.getRepository('Protocol').findOne({
                where: { id: patientProtocol.protocolId },
                relations: ['protocolServices'],
              });
              console.log('[INVOICE] protocol.protocolServices:', protocol?.protocolServices);
              if (protocol && protocol.protocolServices && protocol.protocolServices.length > 0) {
                for (const protocolService of protocol.protocolServices) {
                  for (let i = 1; i <= protocolService.numberOfSessions; i++) {
                    await manager.getRepository('PatientServiceSession').save({
                      patientProtocolId: patientProtocol.id,
                      protocolServiceId: protocolService.id,
                      sessionNumber: i,
                      status: 'scheduled',
                    });
                    console.log('[INVOICE] Sessão criada:', { patientProtocolId: patientProtocol.id, protocolServiceId: protocolService.id, sessionNumber: i });
                  }
                }
              } else {
                console.log('[INVOICE] Protocolo ou serviços não encontrados ao criar PatientProtocol!');
              }
            }
          }
        } else if (totalPayments > 0) {
          // Sincronizar protocolos adquiridos para qualquer pagamento parcial ou total
          for (const item of items) {
            let patientProtocol = await manager.getRepository('PatientProtocol').findOne({
              where: { patientId: invoice.patientId, protocolId: item.protocolId }
            });
            if (!patientProtocol) {
              patientProtocol = await manager.getRepository('PatientProtocol').save({
                patientId: invoice.patientId,
                protocolId: item.protocolId,
                purchaseDate: new Date(),
                status: 'active',
              });
              // Cria as sessões para o novo PatientProtocol
              await this.patientProtocolsService.createSessionsForPatientProtocol(patientProtocol.id);
            }
          }
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

  async calculateInvoice(data: any) {
    const { items, discount, discountType, payments } = data;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Itens obrigatórios para cálculo');
    }
    // Buscar protocolos e validar/preencher preço correto
    const protocolIds = items.map((item: any) => item.protocolId);
    const protocols = await this.dataSource.getRepository('Protocol').findByIds(protocolIds);
    const protocolMap = new Map(protocols.map((p: any) => [p.id, p]));
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      const protocol = protocolMap.get(item.protocolId);
      if (!protocol) throw new Error(`Protocolo não encontrado: ${item.protocolId}`);
      const price = protocol.price ? Number(protocol.price) : Number(item.price);
      const quantity = Number(item.quantity);
      const total = price * quantity;
      subtotal += total;
      return { ...item, price, total };
    });
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (Number(discount) / 100);
    } else {
      discountValue = Number(discount);
    }
    const total = subtotal - discountValue;
    let totalReceived = 0;
    if (payments && Array.isArray(payments)) {
      totalReceived = payments.reduce((sum: number, p: any) => sum + Number(p.totalValue || 0), 0);
    }
    let paymentStatus: 'paid' | 'pending' | 'partial' = 'pending';
    if (totalReceived >= total) paymentStatus = 'paid';
    else if (totalReceived > 0) paymentStatus = 'partial';
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discountValue.toFixed(2)),
      discountType,
      total: Number(total.toFixed(2)),
      totalReceived: Number(totalReceived.toFixed(2)),
      paymentStatus,
    };
  }
} 