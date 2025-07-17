import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedule_rules')
export class ScheduleRule {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  professionalId: number;

  @Column()
  unitId: number;

  @Column('simple-array')
  daysOfWeek: string[];

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ nullable: true })
  exceptions?: string;
} 