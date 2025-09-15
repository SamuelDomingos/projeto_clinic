import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InstallmentInvoice } from './entities/installment-invoice.entity';
import { PaymentHistory } from './entities/payment-history.entity';
import { Protocol } from '../protocols/entities/protocol.entity';

@Injectable()
export class InstallmentInvoicesService {
  constructor(
    @InjectRepository(InstallmentInvoice)
    private readonly installmentInvoiceRepository: Repository<InstallmentInvoice>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
    @InjectRepository(Protocol)
    private readonly protocolRepository: Repository<Protocol>,
    private readonly dataSource: DataSource,
  ) {}

  async generateInvoiceNumber(): Promise<string> {
    const lastInvoice = await this.installmentInvoiceRepository.findOne({
      order: { invoiceNumber: 'DESC' },
    });
    
    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    return `PROT-${String(nextNumber).padStart(6, '0')}`;
  }

  async createInstallmentInvoice(data: {
    patientId: string;
    protocolId: string;
    patientProtocolId: string;
    totalInstallments: number;
    firstDueDate: Date;
    notes?: string;
  }) {
    return this.dataSource.transaction(async manager => {
      // Buscar o protocolo para obter o valor
      const protocol = await manager.findOne(Protocol, {
        where: { id: data.protocolId }
      });

      if (!protocol) {
        throw new NotFoundException('Protocolo não encontrado');
      }

      const totalAmount = parseFloat(protocol.totalPrice || '0');
      const installmentValue = totalAmount / data.totalInstallments;
      const invoiceNumber = await this.generateInvoiceNumber();

      // Criar a fatura parcelada
      const installmentInvoice = manager.create(InstallmentInvoice, {
        invoiceNumber,
        patientId: data.patientId,
        protocolId: data.protocolId,
        patientProtocolId: data.patientProtocolId,
        totalAmount: totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        totalInstallments: data.totalInstallments,
        paidInstallments: 0,
        installmentValue: installmentValue,
        status: 'active',
        firstDueDate: data.firstDueDate,
        notes: data.notes || '',
      });

      const savedInvoice = await manager.save(installmentInvoice);

      // Criar o histórico de pagamentos (parcelas)
      for (let i = 1; i <= data.totalInstallments; i++) {
        const dueDate = new Date(data.firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        const paymentHistory = manager.create(PaymentHistory, {
          installmentInvoiceId: savedInvoice.id,
          installmentNumber: i,
          amount: installmentValue.toFixed(2),
          dueDate,
          status: 'pending',
        });

        await manager.save(paymentHistory);
      }

      return savedInvoice;
    });
  }

  async processPayment(data: {
    installmentInvoiceId: string;
    installmentNumber: number;
    paymentMethodId?: string;
    paidDate: Date;
    notes?: string;
  }) {
    return this.dataSource.transaction(async manager => {
      const installmentInvoice = await manager.findOne(InstallmentInvoice, {
        where: { id: data.installmentInvoiceId },
        relations: ['paymentHistory'],
      });

      if (!installmentInvoice) {
        throw new NotFoundException('Fatura parcelada não encontrada');
      }

      const paymentHistory = await manager.findOne(PaymentHistory, {
        where: {
          installmentInvoiceId: data.installmentInvoiceId,
          installmentNumber: data.installmentNumber,
        },
      });

      if (!paymentHistory) {
        throw new NotFoundException('Parcela não encontrada');
      }

      if (paymentHistory.status === 'paid') {
        throw new BadRequestException('Esta parcela já foi paga');
      }

      // Atualizar o histórico de pagamento
      await manager.update(PaymentHistory, paymentHistory.id, {
        status: 'paid',
        paidDate: data.paidDate,
        paymentMethodId: data.paymentMethodId,
        notes: data.notes,
        updatedAt: new Date(),
      });

      // Atualizar a fatura parcelada
      const newPaidAmount = installmentInvoice.paidAmount + parseFloat(paymentHistory.amount);
      const newRemainingAmount = installmentInvoice.totalAmount - newPaidAmount;
      const newPaidInstallments = installmentInvoice.paidInstallments + 1;
      
      const updateData: any = {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        paidInstallments: newPaidInstallments,
        updatedAt: new Date(),
      };

      // Se todas as parcelas foram pagas, marcar como completa
      if (newPaidInstallments >= installmentInvoice.totalInstallments) {
        updateData.status = 'completed';
      }

      await manager.update(InstallmentInvoice, installmentInvoice.id, updateData);

      return await manager.findOne(InstallmentInvoice, {
        where: { id: data.installmentInvoiceId },
        relations: ['paymentHistory', 'patient', 'protocol'],
      });
    });
  }

  async findByPatient(patientId: string) {
    return this.installmentInvoiceRepository.find({
      where: { patientId },
      relations: ['patient', 'protocol', 'paymentHistory', 'paymentHistory.paymentMethod'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.installmentInvoiceRepository.findOne({
      where: { id },
      relations: ['patient', 'protocol', 'paymentHistory', 'paymentHistory.paymentMethod'],
    });

    if (!invoice) {
      throw new NotFoundException('Fatura parcelada não encontrada');
    }

    return invoice;
  }

  async findAll() {
    return this.installmentInvoiceRepository.find({
      relations: ['patient', 'protocol', 'paymentHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentHistory(installmentInvoiceId: string) {
    return this.paymentHistoryRepository.find({
      where: { installmentInvoiceId },
      relations: ['paymentMethod'],
      order: { installmentNumber: 'ASC' },
    });
  }

  async updateOverduePayments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.paymentHistoryRepository
      .createQueryBuilder()
      .update(PaymentHistory)
      .set({ status: 'overdue' })
      .where('status = :status', { status: 'pending' })
      .andWhere('dueDate < :today', { today })
      .execute();
  }

  // Método create para compatibilidade com o controller
  async create(data: {
    patientId: string;
    protocolId: string;
    patientProtocolId: string;
    totalInstallments: number;
    firstDueDate: Date;
    notes?: string;
  }) {
    return this.createInstallmentInvoice(data);
  }

  // Método updatePaymentStatus para compatibilidade com o controller
  async updatePaymentStatus(
    installmentInvoiceId: string,
    installmentNumber: number,
    data: {
      paymentMethodId?: string;
      paidDate: Date;
      notes?: string;
    }
  ) {
    return this.processPayment({
      installmentInvoiceId,
      installmentNumber,
      paymentMethodId: data.paymentMethodId,
      paidDate: data.paidDate,
      notes: data.notes
    });
  }

  // Método remove para compatibilidade com o controller
  async remove(id: string) {
    const invoice = await this.findOne(id);
    
    // Verificar se há parcelas pagas
    if (invoice.paidInstallments > 0) {
      throw new BadRequestException('Não é possível cancelar fatura com parcelas já pagas');
    }

    return this.dataSource.transaction(async manager => {
      // Remover histórico de pagamentos
      await manager.delete(PaymentHistory, { installmentInvoiceId: id });
      
      // Remover a fatura
      await manager.delete(InstallmentInvoice, { id });
      
      return { message: 'Fatura cancelada com sucesso' };
    });
  }
}