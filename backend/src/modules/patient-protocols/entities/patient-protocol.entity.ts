import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Protocol } from '../../protocols/entities/protocol.entity';
import { PatientServiceSession } from '../../patient-service-sessions/entities/patient-service-session.entity';

export type PatientProtocolStatus =
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'paused';

@Entity('patientprotocols')
export class PatientProtocol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, patient => patient.patientProtocols)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  protocolId: string;

  @ManyToOne(() => Protocol, protocol => protocol.patientProtocols)
  @JoinColumn({ name: 'protocolId' })
  protocol: Protocol;

  @OneToMany(() => PatientServiceSession, session => session.patientProtocol)
  patientServiceSessions: PatientServiceSession[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchaseDate: Date;

  @Column({ type: 'enum', enum: ['active', 'completed', 'cancelled', 'paused'], default: 'active' })
  status: PatientProtocolStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 