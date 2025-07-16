import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('schedule_configs')
export class ScheduleConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  defaultView: string;

  @Column('int')
  blockInterval: number;

  @Column('simple-array')
  workingDays: string[];

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'unit_id' })
  unit: Supplier;

  @Column()
  defaultTypeName: string;

  @Column({ nullable: true })
  notes?: string;

  // Getter para expor apenas o essencial da unidade
  get unitInfo() {
    return this.unit ? { id: this.unit.id, name: this.unit.name } : undefined;
  }
} 