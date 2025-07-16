import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedule_events')
export class ScheduleEvent {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  professionalId: number;

  @Column()
  unitId: number;

  @Column()
  type: string;

  @Column('timestamp', { nullable: true })
  startDateTime: Date;

  @Column('timestamp', { nullable: true })
  endDateTime: Date;

  @Column()
  scheduleTypeId: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  notes?: string;
} 