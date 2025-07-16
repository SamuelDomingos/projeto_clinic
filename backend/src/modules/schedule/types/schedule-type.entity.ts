import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedule_types')
export class ScheduleType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Procedure data
  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column('int')
  duration: number;

  @Column()
  color: string;

  // Default settings
  @Column()
  scheduleType: 'protocol' | 'single';

  @Column('simple-array', { nullable: true })
  selectedProtocolIds?: string[];

  @Column({ default: false })
  noSms: boolean;

  @Column({ default: false })
  noRegisterSms: boolean;

  // Protocols and linked services (JSON)
  @Column('json', { nullable: true })
  protocolsAndServices?: {
    protocolId: string;
    services: {
      serviceId: string;
      numberOfSessions: number;
      defaultDuration: number;
      requiresScheduling: boolean;
      requiresIntervalControl: boolean;
    }[];
  }[];

  // Financial settings
  @Column({ nullable: true })
  costCenter?: string;

  @Column({ nullable: true })
  financialDescription?: string;

  @Column({ nullable: true })
  receiptDescription?: string;
} 