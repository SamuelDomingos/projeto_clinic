import { api } from '../config';
import { 
  Transaction, 
  TransactionFilters, 
  TransactionResponse, 
  TransactionSummary 
} from '../types/transaction';

export const transactionService = {
  // Obter todas as transações com filtros
  getAll: async (filters: TransactionFilters): Promise<TransactionResponse> => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/transactions?${params.toString()}`);
      return response.data as TransactionResponse;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  },

  // Obter uma transação específica
  getById: async (id: string): Promise<Transaction> => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data as Transaction;
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw error;
    }
  },

  // Criar uma nova transação
  // Criar uma nova transação
  create: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, file?: File): Promise<Transaction> => {
    console.log('=== TRANSACTION SERVICE CREATE ===');
    console.log('Transaction data:', transaction);
    console.log('File:', file);
    
    try {
      // Se há arquivo, usar FormData
      if (file) {
        console.log('Enviando com FormData (arquivo presente)');
        const formData = new FormData();
        
        // Adicionar todos os campos da transação
        Object.entries(transaction).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            console.log(`FormData append: ${key} = ${value}`);
            formData.append(key, value.toString());
          }
        });
        
        // Adicionar o arquivo
        formData.append('boletoFile', file);
        console.log('Arquivo adicionado ao FormData:', file.name);
        
        console.log('Fazendo POST com FormData...');
        const response = await api.post('/transactions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Resposta do servidor (FormData):', response.data);
        return response.data;
      } else {
        console.log('Enviando com JSON (sem arquivo)');
        
        // Para transações sem arquivo, usar JSON normal
        const cleanTransaction = {
          ...transaction,
          paymentMethod: transaction.paymentMethod || null,
          boletoNumber: transaction.boletoNumber || '' // Garantir que sempre tenha um valor
        };
        
        console.log('Dados limpos para envio:', cleanTransaction);
        console.log('Fazendo POST com JSON...');
        
        const response = await api.post('/transactions', cleanTransaction);
        console.log('Resposta do servidor (JSON):', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('=== ERRO NO TRANSACTION SERVICE ===');
      console.error('Erro completo:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('Request config:', error.config);
      throw error;
    }
  },

  // Criar múltiplas transações (bulk)
  createBulk: async (transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{
    success: boolean;
    count: number;
    transactions: Transaction[];
  }> => {
    try {
      const response = await api.post('/transactions/bulk', { transactions });
      return response.data as { success: boolean; count: number; transactions: Transaction[]; };
    } catch (error) {
      console.error('Erro ao criar transações em lote:', error);
      throw error;
    }
  },

  // Obter resumo financeiro do servidor
  getSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
    paymentMethodId?: string;
  }): Promise<TransactionSummary> => {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.paymentMethodId) params.append('paymentMethodId', filters.paymentMethodId);
      
      const response = await api.get(`/transactions/summary?${params.toString()}`);
      return response.data as TransactionSummary;
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  },

  // Atualizar uma transação
  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      const response = await api.put(`/transactions/${id}`, transaction);
      return response.data as Transaction;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  },

  // Novo método específico para dar baixa
  markAsPaid: async (id: string, paymentData: {
    paidAt?: string;
    paymentMethod?: string;
    paidViaId?: string;
    documentNumber?: string;
    payableAmount?: string;
  }): Promise<Transaction> => {
    try {
      const updateData = {
        ...paymentData,
        status: 'completed'
      };
      const response = await api.put(`/transactions/${id}`, updateData);
      return response.data as Transaction;
    } catch (error) {
      console.error('Erro ao dar baixa na transação:', error);
      throw error;
    }
  },

  // Deletar uma transação
  delete: async (id: string, deleteAll?: boolean): Promise<void> => {
    const params = new URLSearchParams();
    if (deleteAll) {
      params.append('deleteAll', 'true');
    }
    await api.delete(`/transactions/${id}?${params.toString()}`);
  },

  // Calcular resumo financeiro a partir da lista de transações (método local)
  calculateSummaryFromList: (transactions: Transaction[]): TransactionSummary => {
    return transactions.reduce(
      (summary, transaction) => {
        const amount = parseFloat(transaction.amount.toString());
        
        if (transaction.type === 'revenue') {
          if (transaction.status === 'completed') {
            summary.revenue += amount;
          } else {
            summary.pendingRevenue += amount;
          }
        } else {
          if (transaction.status === 'completed') {
            summary.expenses += amount;
          } else {
            summary.pendingExpenses += amount;
          }
        }
        
        return summary;
      },
      {
        revenue: 0,
        expenses: 0,
        balance: 0,
        pendingRevenue: 0,
        pendingExpenses: 0,
        pendingBalance: 0,
        totalFees: 0,
      }
    );
  },

  // Método para conciliar OFX em lote (dar baixa)
  conciliateOFXBulk: async (conciliations: {
    transactionId: string;
    paidAt: string;
    reference: string;
    ofxAmount: number;
  }[]): Promise<{
    success: boolean;
    count: number;
    transactions: Transaction[];
    errors?: any[];
  }> => {
    try {
      const response = await api.post('/transactions/conciliate-ofx-bulk', { conciliations });
      return response.data;
    } catch (error) {
      console.error('Erro ao conciliar OFX em lote:', error);
      throw error;
    }
  }
};