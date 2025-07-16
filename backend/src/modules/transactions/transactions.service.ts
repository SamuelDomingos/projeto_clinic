import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(data: any, userId: string) {
    if (!userId) {
      throw new Error('userId é obrigatório para criar transação');
    }
    // Garantir que pelo menos um dos campos de boleto esteja presente
    if (!data.boletoFile && !data.boletoNumber) {
      throw new Error('É obrigatório enviar o arquivo do boleto ou o número do boleto.');
    }
    const transaction = this.transactionRepository.create({ ...data, createdBy: userId, updatedBy: userId });
    return this.transactionRepository.save(transaction);
  }

  async createBulk(transactions: any[], userId: string) {
    if (!userId) {
      throw new Error('userId é obrigatório para criar transações');
    }
    
    // Validação adicional para garantir que é um array
    if (!Array.isArray(transactions)) {
      throw new Error('transactions deve ser um array');
    }
    
    if (transactions.length === 0) {
      return {
        success: true,
        count: 0,
        transactions: []
      };
    }
    
    const transactionsToSave = transactions.map(transaction => ({
      ...transaction,
      createdBy: userId,
      updatedBy: userId
    }));
    
    const savedTransactions = await this.transactionRepository.save(transactionsToSave);
    return {
      success: true,
      count: savedTransactions.length,
      transactions: savedTransactions
    };
  }

  async findAll(query: any = {}) {
    const transactions = await this.transactionRepository.find({
      relations: ['creator', 'updater', 'paymentMethod', 'categoryData'],
      order: { createdAt: 'DESC' }
    });
    // Filtrar dados sensíveis dos usuários
    const filteredTransactions = transactions.map(t => ({
      ...t,
      creator: t.creator ? { id: t.creator.id, name: t.creator.name } : null,
      updater: t.updater ? { id: t.updater.id, name: t.updater.name } : null,
    }));
    return {
      transactions: filteredTransactions,
      total: transactions.length,
      pages: 1,
      currentPage: 1
    };
  }

  async getFinancialSummary(query: any = {}) {
    const { startDate, endDate, paymentMethodId } = query;
    const whereConditions: any = {};

    if (startDate && endDate) {
      whereConditions.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (paymentMethodId) {
      whereConditions.paymentMethodId = paymentMethodId;
    }

    // Calcular totais por tipo e status usando TypeORM
    const revenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CAST(transaction.amount AS DECIMAL(10,2)))', 'total')
      .where('transaction.type = :type', { type: 'revenue' })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .andWhere(startDate && endDate ? 'transaction.dueDate BETWEEN :startDate AND :endDate' : '1=1', 
        startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : {})
      .andWhere(paymentMethodId ? 'transaction.paymentMethodId = :paymentMethodId' : '1=1', 
        paymentMethodId ? { paymentMethodId } : {})
      .getRawOne();

    const expenses = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CAST(transaction.amount AS DECIMAL(10,2)))', 'total')
      .where('transaction.type = :type', { type: 'expense' })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .andWhere(startDate && endDate ? 'transaction.dueDate BETWEEN :startDate AND :endDate' : '1=1', 
        startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : {})
      .andWhere(paymentMethodId ? 'transaction.paymentMethodId = :paymentMethodId' : '1=1', 
        paymentMethodId ? { paymentMethodId } : {})
      .getRawOne();

    const pendingRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CAST(transaction.amount AS DECIMAL(10,2)))', 'total')
      .where('transaction.type = :type', { type: 'revenue' })
      .andWhere('transaction.status = :status', { status: 'pending' })
      .andWhere(startDate && endDate ? 'transaction.dueDate BETWEEN :startDate AND :endDate' : '1=1', 
        startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : {})
      .andWhere(paymentMethodId ? 'transaction.paymentMethodId = :paymentMethodId' : '1=1', 
        paymentMethodId ? { paymentMethodId } : {})
      .getRawOne();

    const pendingExpenses = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CAST(transaction.amount AS DECIMAL(10,2)))', 'total')
      .where('transaction.type = :type', { type: 'expense' })
      .andWhere('transaction.status = :status', { status: 'pending' })
      .andWhere(startDate && endDate ? 'transaction.dueDate BETWEEN :startDate AND :endDate' : '1=1', 
        startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : {})
      .andWhere(paymentMethodId ? 'transaction.paymentMethodId = :paymentMethodId' : '1=1', 
        paymentMethodId ? { paymentMethodId } : {})
      .getRawOne();

    const summary = {
      revenue: parseFloat(revenue?.total || '0'),
      expenses: parseFloat(expenses?.total || '0'),
      balance: parseFloat(revenue?.total || '0') - parseFloat(expenses?.total || '0'),
      pendingRevenue: parseFloat(pendingRevenue?.total || '0'),
      pendingExpenses: parseFloat(pendingExpenses?.total || '0'),
      pendingBalance: parseFloat(pendingRevenue?.total || '0') - parseFloat(pendingExpenses?.total || '0'),
      totalFees: 0
    };

    return summary;
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findOne({ 
      where: { id },
      relations: ['creator', 'updater', 'paymentMethod', 'categoryData']
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(id: string, data: any, userId: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    Object.assign(transaction, data, { updatedBy: userId });
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    await this.transactionRepository.remove(transaction);
    return { success: true };
  }
} 