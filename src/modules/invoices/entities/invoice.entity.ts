import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Protocol } from '../../protocols/entities/protocol.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoicePayment } from './invoice-payment.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column()
  type: string; // budget | invoice

  @Column({ default: 'pending' })
  status: string; // pending | approved | invoiced | paid | cancelled

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ nullable: true })
  guide: string;

  @Column({ nullable: true })
  receiptNumber: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column()
  performedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: string;

  @Column({ default: 'fixed' })
  discountType: string; // fixed | percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, patient => patient.invoices)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  protocolId: string;

  @ManyToOne(() => Protocol, protocol => protocol.invoices)
  @JoinColumn({ name: 'protocolId' })
  protocol: Protocol;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => InvoicePayment, payment => payment.invoice, { cascade: true })
  payments: InvoicePayment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 