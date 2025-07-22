import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Kit } from './kit.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('kit_items')
export class KitItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kitId: string;

  @Column()
  productId: string;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Kit, kit => kit.items)
  @JoinColumn({ name: 'kitId' })
  kit: Kit;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
}