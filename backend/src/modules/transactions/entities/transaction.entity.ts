import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { Category } from '../../categories/entities/category.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export type TransactionType = 'revenue' | 'expense' | 'invoice_payment';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['revenue', 'expense', 'invoice_payment'] })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column()
  description: string;

  @ManyToOne(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category' })
  categoryData: Category;

  @Column({ nullable: true })
  invoiceId: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'cancelled'], default: 'pending' })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true })
  branch: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string;

  @Column({ type: 'varchar', nullable: true })
  documentNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  boletoFile: string | null;

  @Column({ type: 'varchar', nullable: true })
  boletoNumber: string | null;

  // NOVOS CAMPOS ADICIONADOS:
  
  // Centro de custo (referência ao supplier com category "centerOfCustody")
  @Column({ type: 'varchar', nullable: true })
  costCenter: string | null;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'costCenter' })
  costCenterData: Supplier;

  // Unidade (referência ao supplier com category "unidade")
  @Column({ type: 'varchar', nullable: true })
  unit: string | null;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'unit' })
  unitData: Supplier;

  // Competência (mês/ano quando deve começar a ser pago/recebido)
  @Column({ type: 'varchar', nullable: true })
  competence: string | null; // Formato: "MM/YYYY"

  @Column({ nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updater: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}