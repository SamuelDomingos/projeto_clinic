import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientServiceSession } from './entities/patient-service-session.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Service } from '../services/entities/service.entity';
import { PatientServiceSessionsService } from './patient-service-sessions.service';
import { PatientServiceSessionsController } from './patient-service-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PatientServiceSession, Patient, Service])],
  controllers: [PatientServiceSessionsController],
  providers: [PatientServiceSessionsService],
  exports: [PatientServiceSessionsService],
})
export class PatientServiceSessionsModule {} 