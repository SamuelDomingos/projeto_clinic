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
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // Obter uma transação específica
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Criar uma nova transação
  create: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  // Criar múltiplas transações (bulk)
  createBulk: async (transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{
    success: boolean;
    count: number;
    transactions: Transaction[];
  }> => {
    const response = await api.post('/transactions/bulk', { transactions });
    return response.data;
  },

  // Obter resumo financeiro do servidor
  getSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
    paymentMethodId?: string;
  }): Promise<TransactionSummary> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethodId) params.append('paymentMethodId', filters.paymentMethodId);
    
    const response = await api.get(`/transactions/summary?${params.toString()}`);
    return response.data;
  },

  // Atualizar uma transação
  update: async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  // Deletar uma transação
  delete: async (id: number, deleteAll?: boolean): Promise<void> => {
    const params = new URLSearchParams();
    if (deleteAll) {
      params.append('deleteAll', 'true');
    }
    await api.delete(`/transactions/${id}?${params.toString()}`);
  },

  // Calcular resumo financeiro a partir da lista de transações (método local)
  calculateSummaryFromList: (transactions: Transaction[]): TransactionSummary => {
    let revenue = 0;
    let expenses = 0;
    let pendingRevenue = 0;
    let pendingExpenses = 0;
    let totalFees = 0; // Se não houver taxas, manter 0
    transactions.forEach((t) => {
      if (t.type === 'revenue') {
        revenue += Number(t.amount);
        if (t.status === 'pending') pendingRevenue += Number(t.amount);
      } else if (t.type === 'expense') {
        expenses += Number(t.amount);
        if (t.status === 'pending') pendingExpenses += Number(t.amount);
      }
    });
    return {
      revenue,
      expenses,
      balance: revenue - expenses,
      pendingRevenue,
      pendingExpenses,
      pendingBalance: pendingRevenue - pendingExpenses,
      totalFees,
    };
  },
}; 