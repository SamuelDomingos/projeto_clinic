import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

export type CategoryType = 'revenue' | 'expense';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['revenue', 'expense'] })
  type: CategoryType;

  // NOVO CAMPO: Marcar categorias padrão
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Transaction, transaction => transaction.categoryData)
  transactions: Transaction[];
}