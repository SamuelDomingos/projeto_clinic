import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InstallmentInvoice } from './installment-invoice.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

@Entity('payment_history')
export class PaymentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  installmentInvoiceId: string;

  @ManyToOne(() => InstallmentInvoice, invoice => invoice.paymentHistory)
  @JoinColumn({ name: 'installmentInvoiceId' })
  installmentInvoice: InstallmentInvoice;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending' })
  status: PaymentStatus;

  @Column({ nullable: true })
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}