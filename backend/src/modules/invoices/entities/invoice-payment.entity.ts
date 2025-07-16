import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

@Entity('invoice_payments')
export class InvoicePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, invoice => invoice.payments)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ nullable: true })
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  paymentMethodName: string;

  @Column('timestamp')
  dueDate: Date;

  @Column({ nullable: true })
  controlNumber: string;

  @Column({ nullable: true })
  description: string;

  @Column('int', { default: 1 })
  installments: number;

  @Column('decimal', { precision: 10, scale: 2 })
  installmentValue: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalValue: string;

  // ...outros campos
} 