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
    let userId: string | undefined;
    let unitId: string | undefined;
    let patientId: string | undefined;

<<<<<<< HEAD
    // Se não foi fornecido professionalId mas foi fornecido userId, use userId como professionalId
    if (!data.professionalId && data.user) {
      if (typeof data.user === 'string') {
        data.professionalId = data.user;
      } else if (typeof data.user === 'object' && data.user && 'id' in data.user) {
        data.professionalId = (data.user as { id: string }).id;
      }
    }

    if (
      typeof (data as Record<string, unknown>)?.patientProtocolId === 'string'
    ) {
=======
    // Extrair patientProtocolId
    if (typeof (data as Record<string, unknown>)?.patientProtocolId === 'string') {
>>>>>>> e2b5b03263b4508b7743cd0ec4ab30ccef37e650
      patientProtocolId = (data as Record<string, string>).patientProtocolId;
    } else if (typeof data.patientProtocol === 'string') {
      patientProtocolId = data.patientProtocol;
    } else if (typeof data.patientProtocol === 'object' && data.patientProtocol && 'id' in data.patientProtocol) {
      patientProtocolId = (data.patientProtocol as { id: string }).id;
    }

    // Extrair serviceSessionId e protocolServiceId
    if (typeof (data as Record<string, unknown>)?.serviceSessionId === 'string') {
      const serviceSessionId = (data as Record<string, string>).serviceSessionId;
      // Buscar a sessão para obter o protocolServiceId
      const session = await this.patientServiceSessionRepository.findOne({
        where: { id: serviceSessionId },
      });
      if (session) {
        protocolServiceId = session.protocolServiceId;
      }
    } else if (typeof (data as Record<string, unknown>)?.protocolServiceId === 'string') {
      protocolServiceId = (data as Record<string, string>).protocolServiceId;
    } else if (typeof data.serviceSession === 'string') {
      const serviceSessionId = data.serviceSession;
      // Buscar a sessão para obter o protocolServiceId
      const session = await this.patientServiceSessionRepository.findOne({
        where: { id: serviceSessionId },
      });
      if (session) {
        protocolServiceId = session.protocolServiceId;
      }
    } else if (typeof data.serviceSession === 'object' && data.serviceSession && 'id' in data.serviceSession) {
      const serviceSessionId = (data.serviceSession as { id: string }).id;
      // Buscar a sessão para obter o protocolServiceId
      const session = await this.patientServiceSessionRepository.findOne({
        where: { id: serviceSessionId },
      });
      if (session) {
        protocolServiceId = session.protocolServiceId;
      }
    }

    // Extrair sessionNumber
    if (typeof (data as Record<string, unknown>)?.sessionNumber !== 'undefined') {
      sessionNumber = Number((data as Record<string, unknown>).sessionNumber);
    }

    // Extrair userId
    if (typeof (data as Record<string, unknown>)?.userId === 'string') {
      userId = (data as Record<string, string>).userId;
    } else if (typeof data.user === 'string') {
      userId = data.user;
    } else if (typeof data.user === 'object' && data.user && 'id' in data.user) {
      userId = (data.user as { id: string }).id;
    }

    // Extrair unitId
    if (typeof (data as Record<string, unknown>)?.unitId === 'string') {
      unitId = (data as Record<string, string>).unitId;
    } else if (typeof data.unit === 'string') {
      unitId = data.unit;
    } else if (typeof data.unit === 'object' && data.unit && 'id' in data.unit) {
      unitId = (data.unit as { id: string }).id;
    }

    // Extrair patientId
    if (typeof (data as Record<string, unknown>)?.patientId === 'string') {
      patientId = (data as Record<string, string>).patientId;
    } else if (typeof data.patient === 'string') {
      patientId = data.patient;
    } else if (typeof data.patient === 'object' && data.patient && 'id' in data.patient) {
      patientId = (data.patient as { id: string }).id;
    }

    // LOG: debug dos campos
    console.log('DEBUG: attendanceType:', data.attendanceType);
    console.log('DEBUG: patientProtocolId:', patientProtocolId);
    console.log('DEBUG: protocolServiceId:', protocolServiceId);
    console.log('DEBUG: sessionNumber:', sessionNumber);
    console.log('DEBUG: userId:', userId);
    console.log('DEBUG: unitId:', unitId);
    console.log('DEBUG: patientId:', patientId);

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
        if (session.status === 'completed') {
          throw new Error('Esta sessão já foi realizada.');
        }
        // Atualiza o status para 'completed' quando um agendamento é criado
        session.status = 'completed';
      }
      await this.patientServiceSessionRepository.save(session);
    }
    
    // Montar corretamente os relacionamentos para o AttendanceSchedule
    const attendance = this.attendanceScheduleRepository.create({
      ...data,
<<<<<<< HEAD
      patientProtocol: patientProtocolId
        ? { id: patientProtocolId }
        : undefined,
      serviceSession: protocolServiceId ? { id: protocolServiceId } : undefined,
      professional: data.professionalId ? { id: data.professionalId } : undefined,
=======
      patient: patientId ? { id: patientId } : undefined,
      user: userId ? { id: userId } : undefined,
      unit: unitId ? { id: unitId } : undefined,
      patientProtocol: patientProtocolId ? { id: patientProtocolId } : undefined,
      serviceSession: (data as Record<string, string>).serviceSessionId ? { id: (data as Record<string, string>).serviceSessionId } : undefined,
>>>>>>> e2b5b03263b4508b7743cd0ec4ab30ccef37e650
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
      relations: ['patient', 'user', 'professional', 'unit', 'patientProtocol', 'serviceSession'],
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