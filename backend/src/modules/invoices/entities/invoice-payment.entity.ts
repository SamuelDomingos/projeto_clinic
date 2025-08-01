import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

@Entity('invoice_payments')
export class InvoicePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ nullable: true, default: null })
  paymentMethodId: string | null;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod?: PaymentMethod; // Opcional: só preencha para pagamentos em cartão

  /**
   * Nome da bandeira do cartão (ex: Visa, Master, Elo, etc). Só preencha para pagamentos em cartão.
   */
  @Column({ nullable: true })
  cardBrand?: string;

  @Column({ nullable: true })
  paymentMethodName: string;

  @Column('timestamp')
  dueDate: Date;

  @Column({ nullable: true })
  controlNumber: string;

  @Column({ nullable: true })
  description: string;

  @Column('int', { default: 1 })
  installments: number; // Número de parcelas. Só preencha para pagamentos parcelados (cartão)

  @Column('decimal', { precision: 10, scale: 2 })
  installmentValue: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalValue: string;

  // Observação:
  // - Para pagamentos em dinheiro, pix, etc: NÃO preencha paymentMethod nem cardBrand.
  // - Para pagamentos em cartão: preencha paymentMethod (maquineta), cardBrand (bandeira) e installments (parcelas).
}