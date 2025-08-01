import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAnalysis } from './entities/patient-analysis.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { AttendanceSchedule } from '../attendance-schedules/entities/attendance-schedule.entity';
import { PatientAIService } from './patient-ai.service';
import { PatientAIController } from './patient-ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientAnalysis,
      Patient,
      Protocol,
      AttendanceSchedule,
    ]),
  ],
  controllers: [PatientAIController],
  providers: [PatientAIService],
  exports: [PatientAIService],
})
export class PatientAIModule {}