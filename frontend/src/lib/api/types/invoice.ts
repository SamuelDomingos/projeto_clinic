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
  // Adicionados para suportar seleção de maquineta e bandeira
  machineId?: string;
  cardBrand?: string;
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

// Novo tipo para pagamento flexível
export type InvoicePaymentInput = {
  paymentMethodName?: string; // Torna opcional para compatibilidade de conversão
  dueDate: string;
  installments: number;
  installmentValue: number | string;
  totalValue: number | string;
  // Só para cartão:
  paymentMethodId?: string;
  cardBrand?: string;
  // Extras opcionais
  controlNumber?: string;
  description?: string;
  machineId?: string; // Adicionado para compatibilidade com cartão
};

export interface CreateInvoiceData {
  type: InvoiceType;
  patientId: string;
  protocolId?: string;
  performedBy: string;
  items: Array<{
    protocolId: string;
    quantity: number;
    price: number;
  }>;
  discount: number;
  discountType: DiscountType;
  payments: InvoicePaymentInput[];
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
  payments?: InvoicePaymentInput[];
  notes?: string;
}

export type InvoiceWithDetails = Invoice & {
  patient?: Patient;
  protocol?: Protocol;
  guide?: string;
  number: string;
};

export interface InvoiceCalculationRequest {
  items: Array<{ protocolId: string; quantity: number; price: number }>;
  discount: number;
  discountType: 'fixed' | 'percentage';
  payments: Array<{
    paymentMethodId: string;
    installments: number;
    installmentValue: number;
    totalValue: number;
  }>;
}

export interface InvoiceCalculationResult {
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  total: number;
  totalReceived: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
} 
