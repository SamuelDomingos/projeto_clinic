import type { Invoice } from './invoice';
import type { Patient } from './patient';

export type InvoiceWithDetails = Invoice & {
  patient?: Patient;
  guide?: string;
};

export type InvoiceStatus = 'pending' | 'approved' | 'paid' | 'cancelled' | 'invoiced';
export type InvoiceType = 'budget' | 'invoice';
export type DiscountType = 'fixed' | 'percentage'; 