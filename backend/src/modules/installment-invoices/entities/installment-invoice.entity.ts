import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Protocol } from '../../protocols/entities/protocol.entity';
import { PatientProtocol } from '../../patient-protocols/entities/patient-protocol.entity';
import { PaymentHistory } from './payment-history.entity';

export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceStatus = 'active' | 'completed' | 'cancelled';

@Entity('installment_invoices')
export class InstallmentInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  protocolId: string;

  @ManyToOne(() => Protocol)
  @JoinColumn({ name: 'protocolId' })
  protocol: Protocol;

  @Column()
  patientProtocolId: string;

  @ManyToOne(() => PatientProtocol)
  @JoinColumn({ name: 'patientProtocolId' })
  patientProtocol: PatientProtocol;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  remainingAmount: number;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column({ type: 'int', default: 0 })
  paidInstallments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (value: number) => value, from: (value: string) => parseFloat(value) } })
  installmentValue: number;

  @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled'], default: 'active' })
  status: InvoiceStatus;

  @Column({ type: 'timestamp' })
  firstDueDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => PaymentHistory, payment => payment.installmentInvoice, { cascade: true })
  paymentHistory: PaymentHistory[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}