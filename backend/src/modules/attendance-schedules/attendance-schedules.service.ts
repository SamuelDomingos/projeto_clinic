import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';
import { PatientServiceSession } from '../patient-service-sessions/entities/patient-service-session.entity';

@Injectable()
export class AttendanceSchedulesService {
  constructor(
    @InjectRepository(AttendanceSchedule)
    private readonly attendanceScheduleRepository: Repository<AttendanceSchedule>,
    @InjectRepository(PatientServiceSession)
    private readonly patientServiceSessionRepository: Repository<PatientServiceSession>,
  ) {}

  async create(data: Partial<AttendanceSchedule>): Promise<AttendanceSchedule> {
    // LOG: payload recebido
    console.log('Payload recebido para criar agendamento:', data);
    // Extrair os campos corretamente do payload, aceitando tanto *_id quanto objeto
    let patientProtocolId: string | undefined;
    let protocolServiceId: string | undefined;
    let sessionNumber: number | undefined;

    if (
      typeof (data as Record<string, unknown>)?.patientProtocolId === 'string'
    ) {
      patientProtocolId = (data as Record<string, string>).patientProtocolId;
    } else if (typeof data.patientProtocol === 'string') {
      patientProtocolId = data.patientProtocol;
    } else if (
      typeof data.patientProtocol === 'object' &&
      data.patientProtocol &&
      'id' in data.patientProtocol
    ) {
      patientProtocolId = (data.patientProtocol as { id: string }).id;
    }

    if (
      typeof (data as Record<string, unknown>)?.serviceSessionId === 'string'
    ) {
      protocolServiceId = (data as Record<string, string>).serviceSessionId;
    } else if (
      typeof (data as Record<string, unknown>)?.protocolServiceId === 'string'
    ) {
      protocolServiceId = (data as Record<string, string>).protocolServiceId;
    } else if (typeof data.serviceSession === 'string') {
      protocolServiceId = data.serviceSession;
    } else if (
      typeof data.serviceSession === 'object' &&
      data.serviceSession &&
      'id' in data.serviceSession
    ) {
      protocolServiceId = (data.serviceSession as { id: string }).id;
    }

    if (
      typeof (data as Record<string, unknown>)?.sessionNumber !== 'undefined'
    ) {
      sessionNumber = Number((data as Record<string, unknown>).sessionNumber);
    }

    // LOG: debug dos campos de protocolo
    console.log('DEBUG: attendanceType:', data.attendanceType);
    console.log('DEBUG: patientProtocolId:', patientProtocolId);
    console.log('DEBUG: protocolServiceId:', protocolServiceId);
    console.log('DEBUG: sessionNumber:', sessionNumber);

    // Se for agendamento de protocolo, crie/atualize a sessão
    if (
      data.attendanceType === 'protocolo' &&
      !!patientProtocolId &&
      !!protocolServiceId &&
      typeof sessionNumber !== 'undefined' &&
      patientProtocolId !== '' &&
      protocolServiceId !== ''
    ) {
      // Verifica se já existe uma sessão para esse protocolo, serviço e número
      let session = await this.patientServiceSessionRepository.findOne({
        where: {
          patientProtocolId,
          protocolServiceId,
          sessionNumber: Number(sessionNumber),
        },
      });
      if (!session) {
        // Cria nova sessão marcada como agendada
        session = this.patientServiceSessionRepository.create({
          patientProtocolId,
          protocolServiceId,
          sessionNumber: Number(sessionNumber),
          status: 'scheduled',
        });
      } else {
        // Se já existe, impede agendamento duplicado
        if (session.status === 'scheduled' || session.status === 'completed') {
          throw new Error('Esta sessão já foi agendada ou realizada.');
        }
        session.status = 'scheduled';
      }
      await this.patientServiceSessionRepository.save(session);
    }
    // Montar corretamente os relacionamentos para o AttendanceSchedule
    const attendance = this.attendanceScheduleRepository.create({
      ...data,
      patientProtocol: patientProtocolId
        ? { id: patientProtocolId }
        : undefined,
      serviceSession: protocolServiceId ? { id: protocolServiceId } : undefined,
    });
    // LOG: objeto a ser salvo
    console.log('Attendance a ser salvo:', attendance);
    const saved = await this.attendanceScheduleRepository.save(attendance);
    // LOG: objeto salvo
    console.log('Attendance salvo:', saved);
    return saved;
  }

  async findAll(): Promise<AttendanceSchedule[]> {
    // Buscar com todos os relacionamentos relevantes
    return this.attendanceScheduleRepository.find({
      relations: ['patient', 'user', 'unit', 'patientProtocol', 'serviceSession'],
    });
  }

  async findOne(id: string): Promise<AttendanceSchedule | null> {
    return this.attendanceScheduleRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<AttendanceSchedule>,
  ): Promise<AttendanceSchedule | null> {
    await this.attendanceScheduleRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.attendanceScheduleRepository.delete(id);
  }
} 