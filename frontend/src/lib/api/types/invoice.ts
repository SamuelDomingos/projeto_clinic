import type { Patient } from './patient';
import type { Protocol } from './protocol';
import type { Service } from './service';
import type { PaymentMethod } from './payment';

export type InvoiceStatus = 'pending' | 'approved' | 'paid' | 'cancelled' | 'invoiced';
export type InvoiceType = 'budget' | 'invoice';
export type DiscountType = 'fixed' | 'percentage';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  protocolId: string;
  quantity: number;
  price: number;
  total: number;
  protocol?: Protocol;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  paymentMethodId: string;
  dueDate: string;
  controlNumber?: string;
  description?: string;
  installments: number;
  installmentValue: number;
  totalValue: number;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  patientId: string;
  protocolId?: string;
  performedBy: string;
  date: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  discount: number;
  discountType: DiscountType;
  total: number;
  notes?: string;
  patient?: Patient;
  protocol?: Protocol;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  type: InvoiceType;
  patientId: string;
  protocolId?: string;
  performedBy: string;
  date: string;
  items: Array<{
    protocolId: string;
    quantity: number;
    price: number;
  }>;
  discount: number;
  discountType: DiscountType;
  payments: Array<{
    paymentMethodId: string;
    dueDate: string;
    controlNumber?: string;
    description?: string;
    installments: number;
    installmentValue: number;
    totalValue: number;
  }>;
  notes?: string;
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  performedBy?: string;
  date?: string;
  items?: Array<{
    protocolId: string;
    quantity: number;
    price: number;
  }>;
  discount?: number;
  discountType?: DiscountType;
  payments?: Array<{
    paymentMethodId: string;
    dueDate: string;
    controlNumber?: string;
    description?: string;
    installments: number;
    installmentValue: number;
    totalValue: number;
  }>;
  notes?: string;
}

export type InvoiceWithDetails = Invoice & {
  patient?: Patient;
  protocol?: Protocol;
  guide?: string;
  number: string;
}; 