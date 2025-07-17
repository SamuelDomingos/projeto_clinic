import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<Appointment>) {
    const { doctorId, date, startTime } = data;
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorId,
        date,
        startTime,
        status: Not('cancelled'),
      },
    });
    if (existingAppointment) throw new BadRequestException('Horário já está ocupado');
    const appointment = this.appointmentRepository.create({ ...data, status: 'scheduled' });
    await this.appointmentRepository.save(appointment);
    return appointment;
  }

  async list(query: any) {
    const { startDate, endDate, doctorId, patientId, status } = query;
    const where: any = {};
    if (startDate && endDate) where.date = Between(new Date(startDate), new Date(endDate));
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    return this.appointmentRepository.find({
      where,
      relations: ['patient', 'doctor'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async update(id: string, data: Partial<Appointment>) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (data.date && data.startTime) {
      const existingAppointment = await this.appointmentRepository.findOne({
        where: {
          doctorId: appointment.doctorId,
          date: data.date,
          startTime: data.startTime,
          id: Not(id),
          status: Not('cancelled'),
        },
      });
      if (existingAppointment) throw new BadRequestException('Horário já está ocupado');
    }
    await this.appointmentRepository.update(id, { ...data });
    return this.appointmentRepository.findOne({ where: { id } });
  }

  async cancel(id: string, reason?: string) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    await this.appointmentRepository.update(id, {
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''}\nCancelado: ${reason}` : appointment.notes,
    });
    return this.appointmentRepository.findOne({ where: { id } });
  }

  async confirm(id: string) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    await this.appointmentRepository.update(id, { status: 'confirmed' });
    return this.appointmentRepository.findOne({ where: { id } });
  }

  async complete(id: string, notes?: string) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    await this.appointmentRepository.update(id, {
      status: 'completed',
      notes: notes ? `${appointment.notes || ''}\nConcluído: ${notes}` : appointment.notes,
    });
    return this.appointmentRepository.findOne({ where: { id } });
  }

  findAll(query?: any) {
    return this.list(query);
  }

  findOne(id: string) {
    return this.appointmentRepository.findOne({ where: { id } });
  }

  remove(id: string, reason?: string) {
    return this.cancel(id, reason);
  }
} 