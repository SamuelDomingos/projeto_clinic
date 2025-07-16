import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';
import { StockLocation } from '../../stock-locations/entities/stock-location.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.stockMovements)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.stockMovements)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['in', 'out', 'transfer'] })
  type: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  reason: string;

  // NOVOS CAMPOS PARA USAR ID DE LOCALIZAÇÃO
  @Column({ nullable: true })
  locationId: string;
  @ManyToOne(() => StockLocation)
  @JoinColumn({ name: 'locationId' })
  location: StockLocation;

  @Column({ nullable: true })
  fromLocationId: string;
  @ManyToOne(() => StockLocation)
  @JoinColumn({ name: 'fromLocationId' })
  fromLocation: StockLocation;

  @Column({ nullable: true })
  toLocationId: string;
  @ManyToOne(() => StockLocation)
  @JoinColumn({ name: 'toLocationId' })
  toLocation: StockLocation;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 