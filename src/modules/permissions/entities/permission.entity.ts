import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('permissions')
@Index(['path', 'method'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @Column()
  method: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToMany(() => User, user => user.permissions)
  users: User[];
} 