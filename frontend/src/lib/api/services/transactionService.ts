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