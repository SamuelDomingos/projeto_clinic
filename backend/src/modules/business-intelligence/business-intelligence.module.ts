import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BIInsight } from './entities/bi-insight.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Patient } from '../patients/entities/patient.entity';
import { AttendanceSchedule } from '../attendance-schedules/entities/attendance-schedule.entity';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { BusinessIntelligenceController } from './business-intelligence.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BIInsight,
      Transaction,
      Patient,
      AttendanceSchedule
    ])
  ],
  controllers: [BusinessIntelligenceController],
  providers: [BusinessIntelligenceService],
  exports: [BusinessIntelligenceService],
})
export class BusinessIntelligenceModule {}