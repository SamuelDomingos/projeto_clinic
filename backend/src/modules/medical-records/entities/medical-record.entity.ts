import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

export type RecordCategory =
  | 'observation'
  | 'evolution'
  | 'private_note'
  | 'attachment'
  | 'prescription'
  | 'exam_request';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, patient => patient.medicalRecords)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({
    type: 'enum',
    enum: [
      'observation',
      'evolution',
      'private_note',
      'attachment',
      'prescription',
      'exam_request',
    ],
  })
  recordCategory: RecordCategory;

  @Column()
  doctorId: string;

  @ManyToOne(() => User, user => user.medicalRecords)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'simple-json', nullable: true })
  prescriptionData: any;

  @Column({ type: 'simple-json', nullable: true })
  examRequestData: any;

  @Column({ type: 'simple-json', nullable: true })
  attachments: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 