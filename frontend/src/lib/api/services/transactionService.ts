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

  // Obter resumo financeiro
  getSummary: async (filters: Pick<TransactionFilters, 'startDate' | 'endDate' | 'paymentMethodId'>): Promise<TransactionSummary> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/transactions/summary?${params.toString()}`);
    return response.data;
  },
}; 