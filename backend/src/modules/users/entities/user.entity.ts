import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';

export type UserRole = 'admin' | 'health_professional' | 'receptionist' | 'financial' | 'scheduling' | 'common';
export type UserStatus = 'active' | 'inactive';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'health_professional', 'receptionist', 'financial', 'scheduling', 'common'],
    default: 'common',
  })
  role: UserRole;

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @ManyToMany(() => Permission, permission => permission.users)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @OneToMany(() => MedicalRecord, record => record.doctor)
  medicalRecords: MedicalRecord[];

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Métodos como validatePassword e hooks de hash devem ser implementados em services/providers
} 