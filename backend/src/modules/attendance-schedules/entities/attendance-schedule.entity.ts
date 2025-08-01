import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '@/modules/patients/entities/patient.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Supplier } from '@/modules/suppliers/entities/supplier.entity';
import { PatientProtocol } from '@/modules/patient-protocols/entities/patient-protocol.entity';
import { PatientServiceSession } from '@/modules/patient-service-sessions/entities/patient-service-session.entity';

@Entity('attendance_schedules')
export class AttendanceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professional_id' })
  professional: User;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'unit_id' })
  unit: Supplier;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: ['protocolo', 'avulso'] })
  attendanceType: 'protocolo' | 'avulso';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value?: number;

  @ManyToOne(() => PatientProtocol, { nullable: true })
  @JoinColumn({ name: 'patient_protocol_id' })
  patientProtocol?: PatientProtocol;

  @ManyToOne(() => PatientServiceSession, { nullable: true })
  @JoinColumn({ name: 'service_session_id' })
  serviceSession?: PatientServiceSession;

  @Column({ type: 'text', nullable: true })
  observation?: string;

  @Column({ default: false })
  isBlocked: boolean;
}