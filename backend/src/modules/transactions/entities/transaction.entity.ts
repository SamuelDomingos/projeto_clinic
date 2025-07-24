import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { Category } from '../../categories/entities/category.entity';

export type TransactionType = 'revenue' | 'expense' | 'invoice_payment'; // Adicionar invoice_payment aqui
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['revenue', 'expense', 'invoice_payment'] }) // Atualizar enum
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

  // Adicionar referência para invoice (opcional)
  @Column({ nullable: true })
  invoiceId: string;

  // Remover a linha duplicada de type que estava causando erro
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