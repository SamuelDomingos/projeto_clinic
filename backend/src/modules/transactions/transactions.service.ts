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

  async create(data: any, userId?: string): Promise<Transaction> {
    // Validação apenas para despesas com boleto
    if (data.type === 'expense' && data.paymentMethod === 'boleto') {
      if (!data.boletoFile && !data.boletoNumber) {
        throw new Error('Para despesas com boleto, o arquivo do boleto ou número do boleto é obrigatório.');
      }
    }

    // Limpar campos duplicados e normalizar
    const cleanData = {
      ...data,
      // Usar apenas paymentMethod, remover duplicatas
      paymentMethod: data.paymentMethod || data.paymentMethodName || null,
      // Remover campos duplicados
      paymentMethodName: undefined,
      paymentMethodType: undefined,
      paymentMethodId: undefined
    };

    const transaction = this.transactionRepository.create({
      ...cleanData,
      createdBy: userId && userId !== 'temp-user-id' ? userId : null,
      updatedBy: userId && userId !== 'temp-user-id' ? userId : null,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);
    return Array.isArray(savedTransaction) ? savedTransaction[0] : savedTransaction;
  }

  async createBulk(transactions: any[], userId: string) {
    if (!userId) {
      throw new Error('userId é obrigatório para criar transações');
    }
    
    if (!Array.isArray(transactions)) {
      throw new Error('transactions deve ser um array');
    }
    
    if (transactions.length === 0) {
      return { success: true, count: 0, transactions: [] };
    }
    
    // ADICIONAR: Validação específica para importação OFX
    const transactionsToSave = transactions.map(transaction => {
      // Validar campos obrigatórios
      if (!transaction.type || !transaction.amount || !transaction.description) {
        throw new Error('Campos obrigatórios faltando: type, amount, description');
      }
      
      return {
        ...transaction,
        createdBy: userId,
        updatedBy: userId,
        // Garantir que amount seja string (conforme entidade)
        amount: transaction.amount.toString()
      };
    });
    
    const savedTransactions = await this.transactionRepository.save(transactionsToSave);
    return {
      success: true,
      count: savedTransactions.length,
      transactions: savedTransactions
    };
  }

  async findAll(query: any = {}) {
    const transactions = await this.transactionRepository.find({
      relations: ['creator', 'updater', 'categoryData', 'costCenterData', 'unitData'],
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
      relations: ['creator', 'updater', 'categoryData', 'costCenterData', 'unitData']
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(id: string, data: any, userId?: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    
    // Campos específicos para baixa de transação
    const updateData = {
      ...data,
      updatedBy: userId || transaction.updatedBy
    };
    
    // Se está marcando como pago, definir data de pagamento se não fornecida
    if (data.status === 'completed' && !data.paidAt) {
      updateData.paidAt = new Date();
    }
    
    Object.assign(transaction, updateData);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    await this.transactionRepository.remove(transaction);
    return { success: true };
  }

  async findByInvoice(invoiceId: string) {
    const transactions = await this.transactionRepository.find({
      where: { invoiceId },
      relations: ['invoice'], // removido 'paymentMethod'
      order: { createdAt: 'DESC' }
    });
    
    const totalPaid = transactions.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.amount);
    }, 0);
    
    return {
      transactions,
      summary: {
        totalPaid,
        numberOfTransactions: transactions.length
      }
    };
  }

  async getFinancialSummaryByInvoices(query: any = {}) {
    const { startDate, endDate } = query;
    
    // Receitas de faturas
    const invoiceRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CAST(transaction.amount AS DECIMAL(10,2)))', 'total')
      .where('transaction.type = :type', { type: 'invoice_payment' })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .andWhere(startDate && endDate ? 'transaction.dueDate BETWEEN :startDate AND :endDate' : '1=1', 
        startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : {})
      .getRawOne();
    
    return {
      invoiceRevenue: parseFloat(invoiceRevenue?.total || '0'),
      // ... outros cálculos ...
    };
  }

  // Adicionar método específico para conciliação OFX
  async conciliateOFX(ofxData: {
    transactionId: string;
    paidAt: string;
    reference: string;
    ofxAmount: number;
  }, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: ofxData.transactionId }
    });
    
    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }
    
    // Verificar se valores batem
    const amountDiff = Math.abs(parseFloat(transaction.amount) - ofxData.ofxAmount);
    if (amountDiff > 0.01) {
      throw new Error(`Valores não conferem: Sistema R$ ${transaction.amount}, OFX R$ ${ofxData.ofxAmount}`);
    }
    
    // Atualizar transação
    const updatedTransaction = await this.transactionRepository.save({
      ...transaction,
      status: 'completed',
      paidAt: new Date(ofxData.paidAt),
      reference: ofxData.reference,
      notes: `${transaction.notes || ''} - Baixa via OFX em ${new Date().toLocaleDateString('pt-BR')}`,
      updatedBy: userId
    });
    
    return updatedTransaction;
  }

  // 2. Adicionar o método no service do backend:
  async conciliateOFXBulk(conciliations: {
    transactionId: string;
    paidAt: string;
    reference: string;
    ofxAmount: number;
  }[], userId: string) {
    const results: Transaction[] = []; // Tipagem correta
    const errors: { transactionId: string; error: string }[] = []; // Tipagem correta
    
    for (const conciliation of conciliations) {
      try {
        const result = await this.conciliateOFX(conciliation, userId);
        results.push(result);
      } catch (error) {
        console.error(`Erro ao conciliar transação ${conciliation.transactionId}:`, error);
        errors.push({
          transactionId: conciliation.transactionId,
          error: error.message || 'Erro desconhecido'
        });
      }
    }
    
    return {
      success: true,
      count: results.length,
      transactions: results,
      errors: errors
    };
  }
}