import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { PatientProtocol } from '../../patient-protocols/entities/patient-protocol.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PatientStatus = 'active' | 'inactive';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ unique: true, nullable: true })
  rg: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  profession: string;

  @Column({ type: 'enum', enum: ['single', 'married', 'divorced', 'widowed'], nullable: true })
  maritalStatus: MaritalStatus;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'enum', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], nullable: true })
  bloodType: BloodType;

  @Column({ type: 'simple-json', nullable: true })
  allergies: any[];

  @Column({ nullable: true })
  insurance: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: PatientStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastVisit: Date;

  @Column({ type: 'int', default: 0 })
  totalSessions: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => MedicalRecord, record => record.patient)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => PatientProtocol, patientProtocol => patientProtocol.patient)
  patientProtocols: PatientProtocol[];

  @OneToMany(() => Invoice, invoice => invoice.patient)
  invoices: Invoice[];
} 