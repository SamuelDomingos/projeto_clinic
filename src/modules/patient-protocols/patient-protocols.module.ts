import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProtocol } from './entities/patient-protocol.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { PatientProtocolsService } from './patient-protocols.service';
import { PatientProtocolsController } from './patient-protocols.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PatientProtocol, Patient, Protocol])],
  controllers: [PatientProtocolsController],
  providers: [PatientProtocolsService],
  exports: [PatientProtocolsService],
})
export class PatientProtocolsModule {} 