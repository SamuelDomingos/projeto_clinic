import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';
import { AttendanceSchedulesService } from './attendance-schedules.service';
import { AttendanceSchedulesController } from './attendance-schedules.controller';
import { PatientServiceSession } from '../patient-service-sessions/entities/patient-service-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceSchedule, PatientServiceSession])],
  controllers: [AttendanceSchedulesController],
  providers: [AttendanceSchedulesService],
  exports: [AttendanceSchedulesService],
})
export class AttendanceSchedulesModule {} 