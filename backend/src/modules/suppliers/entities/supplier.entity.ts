import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';

export type SupplierStatus = 'active' | 'inactive';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'enum', enum: ['fornecedor', 'unidade'], default: 'fornecedor', nullable: true })
  type: 'fornecedor' | 'unidade';

  @Column({ nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: SupplierStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastOrderDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => StockMovement, stockMovement => stockMovement.supplier)
  stockMovements: StockMovement[];

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.supplier)
  purchaseOrders: PurchaseOrder[];
} 