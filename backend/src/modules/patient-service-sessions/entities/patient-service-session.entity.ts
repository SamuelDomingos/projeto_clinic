import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PatientProtocol } from '../../patient-protocols/entities/patient-protocol.entity';
import { ProtocolService } from '../../protocol-services/entities/protocol-service.entity';

export type PatientServiceSessionStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'missed';

@Entity('patientservicesessions')
export class PatientServiceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientProtocolId: string;

  @ManyToOne(() => PatientProtocol, patientProtocol => patientProtocol.patientServiceSessions)
  @JoinColumn({ name: 'patientProtocolId' })
  patientProtocol: PatientProtocol;

  @Column()
  protocolServiceId: string;

  @ManyToOne(() => ProtocolService, protocolService => protocolService.patientServiceSessions)
  @JoinColumn({ name: 'protocolServiceId' })
  protocolService: ProtocolService;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sessionDate: Date;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'timestamp', nullable: true })
  nextAllowedDate: Date;

  @Column({ type: 'enum', enum: ['scheduled', 'completed', 'cancelled', 'missed'], default: 'scheduled' })
  status: PatientServiceSessionStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 