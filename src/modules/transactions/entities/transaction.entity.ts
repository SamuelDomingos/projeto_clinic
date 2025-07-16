import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { Category } from '../../categories/entities/category.entity';

export type TransactionType = 'revenue' | 'expense';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['revenue', 'expense'] })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @ManyToOne(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category' })
  categoryData: Category;

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

  @Column({ type: 'int', nullable: true })
  installments: number;

  @Column({ type: 'int', nullable: true })
  installmentNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  payableAmount: string | null; // Valor a pagar, se houver necessidade

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date | null; // Data do pagamento do débito

  @Column({ type: 'varchar', nullable: true })
  paidViaId: string | null; // ID da unidade ou conta bancária

  @Column({ type: 'varchar', nullable: true })
  documentNumber: string | null; // Número do documento

  @Column({ type: 'varchar', nullable: true })
  boletoFile: string | null; // Caminho do arquivo do boleto (PDF/DOC)

  @Column({ type: 'varchar', nullable: true })
  boletoNumber: string | null; // Número do boleto, caso não tenha arquivo

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column()
  updatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updater: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 