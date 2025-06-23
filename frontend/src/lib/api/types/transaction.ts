export type TransactionType = 'revenue' | 'expense';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'check';
export type RelatedEntityType = 'invoice' | 'product' | 'patient' | 'protocol' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  categoryName?: string;
  dueDate: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  branch?: string;
  reference?: string;
  installments?: number;
  installmentNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  classification: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  search?: string;
  paymentMethodId?: string;
  page?: number;
  limit?: number;
}

export interface TransactionSummary {
  revenue: number;
  expenses: number;
  balance: number;
  pendingRevenue: number;
  pendingExpenses: number;
  pendingBalance: number;
  totalFees: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  pages: number;
  currentPage: number;
} 