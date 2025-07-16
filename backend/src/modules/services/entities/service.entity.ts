import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type ServiceType =
  | 'consultation'
  | 'injection'
  | 'massage'
  | 'drainage'
  | 'calometry';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['consultation', 'injection', 'massage', 'drainage', 'calometry'] })
  type: ServiceType;

  @Column({ type: 'boolean', default: false })
  requiresScheduling: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 