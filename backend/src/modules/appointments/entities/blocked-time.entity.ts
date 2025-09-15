import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type BlockedTimeType = 'vacation' | 'break' | 'meeting' | 'personal' | 'maintenance';

@Entity('blocked_times')
export class BlockedTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ type: 'datetime' })
  startDateTime: Date;

  @Column({ type: 'datetime' })
  endDateTime: Date;

  @Column({
    type: 'enum',
    enum: ['vacation', 'break', 'meeting', 'personal', 'maintenance'],
    default: 'break',
  })
  type: BlockedTimeType;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}