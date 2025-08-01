import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';

export type PurchaseOrderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed';

@Entity('purchaseorders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' })
  status: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ type: 'simple-json' })
  items: any;
} 