import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { SERVICE_APPOINTMENTS } from '../../common/constants';
@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Patient, User])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, { provide: SERVICE_APPOINTMENTS, useExisting: AppointmentsService }],
  exports: [AppointmentsService, SERVICE_APPOINTMENTS],
})
export class AppointmentsModule {}