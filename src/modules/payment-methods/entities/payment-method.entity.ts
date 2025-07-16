import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

export type PaymentMethodType =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'pix'
  | 'check';

@Entity('paymentmethods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'check'] })
  type: PaymentMethodType;

  @Column()
  personType: string;

  @Column()
  beneficiaryId: string;

  @Column()
  beneficiaryType: string;

  @Column({ nullable: true })
  machineName: string;

  @Column({ type: 'int', default: 1 })
  debitTerm: number;

  @Column({ type: 'int', default: 30 })
  firstInstallmentTerm: number;

  @Column({ type: 'int', default: 30 })
  otherInstallmentsTerm: number;

  @Column({ type: 'int', default: 12 })
  maxInstallments: number;

  @Column({ type: 'int', default: 1 })
  anticipationTerm: number;

  @Column({ type: 'simple-json', nullable: true })
  acceptedBrands: any[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  debitFee: string;

  @Column({ type: 'simple-json', nullable: true })
  creditFees: any;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Transaction, transaction => transaction.paymentMethod)
  transactions: Transaction[];
} 