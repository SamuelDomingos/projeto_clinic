import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StockLocation } from '../../stock-locations/entities/stock-location.entity';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity';

export type ProductStatus = 'active' | 'inactive';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'unidade' })
  unit: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'int', default: 5 })
  minimumStock: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: ProductStatus;

  @Column({ type: 'simple-json', default: '{}' })
  specifications: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => StockLocation, stockLocation => stockLocation.product)
  stockLocations: StockLocation[];

  @OneToMany(() => StockMovement, stockMovement => stockMovement.product)
  stockMovements: StockMovement[];
} 