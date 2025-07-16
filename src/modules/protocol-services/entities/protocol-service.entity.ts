import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Protocol } from '../../protocols/entities/protocol.entity';
import { Service } from '../../services/entities/service.entity';
import { PatientServiceSession } from '../../patient-service-sessions/entities/patient-service-session.entity';

@Entity('protocolservices')
export class ProtocolService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  protocolId: string;

  @ManyToOne(() => Protocol, protocol => protocol.protocolServices)
  @JoinColumn({ name: 'protocolId' })
  protocol: Protocol;

  @Column()
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @OneToMany(() => PatientServiceSession, session => session.protocolService)
  patientServiceSessions: PatientServiceSession[];

  @Column({ type: 'int', default: 1 })
  numberOfSessions: number;

  @Column({ type: 'boolean', default: false })
  requiresIntervalControl: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 