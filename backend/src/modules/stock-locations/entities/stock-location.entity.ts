import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('stock_locations')
@Unique(['productId', 'location'])
export class StockLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column()
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @ManyToOne(() => Product, product => product.stockLocations)
  @JoinColumn({ name: 'productId' })
  product: Product;

  // ...outros campos
} 