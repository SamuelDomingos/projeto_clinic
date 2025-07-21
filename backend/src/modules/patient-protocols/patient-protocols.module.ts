import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProtocol } from './entities/patient-protocol.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { PatientProtocolsService } from './patient-protocols.service';
import { PatientProtocolsController } from './patient-protocols.controller';
import { PatientServiceSession } from '../patient-service-sessions/entities/patient-service-session.entity';
import { ProtocolService as ProtocolServiceEntity } from '../protocol-services/entities/protocol-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PatientProtocol,
    Patient,
    Protocol,
    PatientServiceSession,
    ProtocolServiceEntity,
  ])],
  controllers: [PatientProtocolsController],
  providers: [PatientProtocolsService],
  exports: [PatientProtocolsService],
})
export class PatientProtocolsModule {} 