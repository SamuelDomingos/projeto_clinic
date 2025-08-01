import { TransactionType } from './transaction';

export interface OFXTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  branch: string;
  category: string;
} 