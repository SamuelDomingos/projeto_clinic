export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer';
  personType: 'pf' | 'pj';
  beneficiaryId: string;
  beneficiaryType: 'user' | 'supplier';
  machineName?: string;
  debitTerm?: number;
  firstInstallmentTerm?: number;
  otherInstallmentsTerm?: number;
  maxInstallments?: number;
  anticipationTerm?: number;
  acceptedBrands?: string[];
  debitFee?: number;
  creditFees?: Record<string, number>;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodData {
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer';
  personType: 'pf' | 'pj';
  beneficiaryId: string;
  beneficiaryType: 'user' | 'supplier';
  machineName: string;
  debitTerm?: number;
  firstInstallmentTerm?: number;
  otherInstallmentsTerm?: number;
  maxInstallments?: number;
  anticipationTerm?: number;
  acceptedBrands?: string[];
  debitFee?: number;
  creditFees?: Record<string, number>;
  status?: 'active' | 'inactive';
}

export type UpdatePaymentMethodData = Partial<CreatePaymentMethodData>; 