// Interfaces for Users and Roles
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  role: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
}

// Interfaces for Suppliers
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  category?: string;
  type?: 'fornecedor' | 'unidade';
  cnpj?: string;
  address?: string;
  contactPerson?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BankDetails {
  bankName: string;
  agency: string;
  account: string;
  accountType: 'checking' | 'savings';
  holderName: string;
  cpfCnpj: string;
}

export interface CreateSupplierData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  category?: string;
  type?: 'fornecedor' | 'unidade';
  cnpj?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  paymentTerms?: string;
  creditLimit?: number;
  bankDetails?: BankDetails;
  status?: 'active' | 'inactive';
  lastOrderDate?: string;
}

export interface UpdateSupplierData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  category?: string;
  type?: 'fornecedor' | 'unidade';
  cnpj?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
  paymentTerms?: string;
  creditLimit?: number;
  bankDetails?: BankDetails;
  status?: 'active' | 'inactive';
  lastOrderDate?: string;
}

// Interfaces for Payment Methods
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
  type: 'cash' | 'credit_card' | 'debit_card' | 'pix';
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