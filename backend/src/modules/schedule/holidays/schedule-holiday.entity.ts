import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedule_holidays')
export class ScheduleHoliday {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column('int')
  day: number;

  @Column('int')
  month: number;

  @Column('int', { nullable: true })
  year?: number;
} 