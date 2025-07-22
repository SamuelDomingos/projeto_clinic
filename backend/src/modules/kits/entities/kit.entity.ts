import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { KitItem } from './kit-item.entity';

@Entity('kits')
export class Kit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => KitItem, kitItem => kitItem.kit, { cascade: true })
  items: KitItem[];
}