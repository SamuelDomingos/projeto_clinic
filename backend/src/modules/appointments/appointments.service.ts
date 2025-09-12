import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { BlockedTime } from './entities/blocked-time.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(BlockedTime)
    private readonly blockedTimeRepository: Repository<BlockedTime>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async checkTimeAvailability(doctorId: string, date: Date, startTime: string, duration: number = 30): Promise<void> {
    // Converter data e hora para DateTime completo
    const appointmentDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}:00`);
    const appointmentEndDateTime = new Date(appointmentDateTime.getTime() + duration * 60000);

    // Verificar se existe agendamento conflitante
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctorId,
        date,
        startTime,
        status: Not('cancelled'),
      },
    });
    
    if (existingAppointment) {
      throw new BadRequestException('Horário já está ocupado por outro agendamento');
    }

    // Verificar se o horário está bloqueado
    const blockedTime = await this.blockedTimeRepository.findOne({
      where: {
        doctorId,
        isActive: true,
        startDateTime: LessThanOrEqual(appointmentDateTime),
        endDateTime: MoreThanOrEqual(appointmentEndDateTime),
      },
    });

    if (blockedTime) {
      throw new BadRequestException(
        `Horário não disponível. Motivo: ${blockedTime.reason || blockedTime.type}. ` +
        `Período bloqueado: ${blockedTime.startDateTime.toLocaleString()} - ${blockedTime.endDateTime.toLocaleString()}`
      );
    }

    // Verificar sobreposição parcial com horários bloqueados
    const overlappingBlockedTime = await this.blockedTimeRepository
      .createQueryBuilder('bt')
      .where('bt.doctorId = :doctorId', { doctorId })
      .andWhere('bt.isActive = :isActive', { isActive: true })
      .andWhere(
        '(bt.startDateTime < :endTime AND bt.endDateTime > :startTime)',
        {
          startTime: appointmentDateTime,
          endTime: appointmentEndDateTime,
        }
      )
      .getOne();

    if (overlappingBlockedTime) {
      throw new BadRequestException(
        `Horário conflita com período bloqueado. Motivo: ${overlappingBlockedTime.reason || overlappingBlockedTime.type}. ` +
        `Período bloqueado: ${overlappingBlockedTime.startDateTime.toLocaleString()} - ${overlappingBlockedTime.endDateTime.toLocaleString()}`
      );
    }
  }

  async create(data: Partial<Appointment>) {
    const { doctorId, date, startTime, duration = 30 } = data;
    
    // Validar campos obrigatórios
    if (!doctorId) {
      throw new BadRequestException('ID do médico é obrigatório');
    }
    if (!date) {
      throw new BadRequestException('Data é obrigatória');
    }
    if (!startTime) {
      throw new BadRequestException('Horário de início é obrigatório');
    }
    
    // Validar disponibilidade antes de criar
    await this.checkTimeAvailability(doctorId, date, startTime, duration);
    
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
    
    // Se está alterando data/hora, validar disponibilidade
    if (data.date && data.startTime) {
      await this.checkTimeAvailability(
        appointment.doctorId, 
        data.date, 
        data.startTime, 
        data.duration || appointment.duration
      );
    }
    
    await this.appointmentRepository.update(id, { ...data });
    return this.appointmentRepository.findOne({ where: { id } });
  }

  // Métodos para gerenciar horários bloqueados
  async createBlockedTime(data: Partial<BlockedTime>) {
    const blockedTime = this.blockedTimeRepository.create(data);
    return this.blockedTimeRepository.save(blockedTime);
  }

  async getBlockedTimes(doctorId: string, startDate?: Date, endDate?: Date) {
    const query = this.blockedTimeRepository.createQueryBuilder('bt')
      .where('bt.doctorId = :doctorId', { doctorId })
      .andWhere('bt.isActive = :isActive', { isActive: true });

    if (startDate && endDate) {
      query.andWhere('bt.startDateTime >= :startDate', { startDate })
           .andWhere('bt.endDateTime <= :endDate', { endDate });
    }

    return query.orderBy('bt.startDateTime', 'ASC').getMany();
  }

  async removeBlockedTime(id: string) {
    const blockedTime = await this.blockedTimeRepository.findOne({ where: { id } });
    if (!blockedTime) throw new NotFoundException('Horário bloqueado não encontrado');
    
    await this.blockedTimeRepository.update(id, { isActive: false });
    return blockedTime;
  }

  async checkAvailability(doctorId: string, date: Date, startTime: string, duration: number = 30) {
    try {
      await this.checkTimeAvailability(doctorId, date, startTime, duration);
      return { available: true, message: 'Horário disponível' };
    } catch (error) {
      return { available: false, message: error.message };
    }
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