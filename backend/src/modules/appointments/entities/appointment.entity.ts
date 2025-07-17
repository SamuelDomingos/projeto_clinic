import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, patient => patient.appointments)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: string;

  @ManyToOne(() => User, user => user.medicalRecords)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'int', default: 30 })
  duration: number;

  @Column()
  procedure: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 