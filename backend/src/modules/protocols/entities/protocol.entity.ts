import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProtocolService } from '../../protocol-services/entities/protocol-service.entity';
import { PatientProtocol } from '../../patient-protocols/entities/patient-protocol.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('protocols')
export class Protocol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => ProtocolService, protocolService => protocolService.protocol)
  protocolServices: ProtocolService[];

  @OneToMany(() => PatientProtocol, patientProtocol => patientProtocol.protocol)
  patientProtocols: PatientProtocol[];

  @OneToMany(() => Invoice, invoice => invoice.protocol)
  invoices: Invoice[];
} 