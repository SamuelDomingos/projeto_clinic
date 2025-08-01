import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingOptimization } from './entities/scheduling-optimization.entity';
import { AttendanceSchedule } from '../attendance-schedules/entities/attendance-schedule.entity';
import { Patient } from '../patients/entities/patient.entity';
import { SchedulingAIService } from './scheduling-ai.service';
import { SchedulingAIController } from './scheduling-ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchedulingOptimization,
      AttendanceSchedule,
      Patient
    ])
  ],
  controllers: [SchedulingAIController],
  providers: [SchedulingAIService],
  exports: [SchedulingAIService],
})
export class SchedulingAIModule {}