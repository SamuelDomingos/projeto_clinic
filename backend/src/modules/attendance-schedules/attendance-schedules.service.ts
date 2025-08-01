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
    let professionalId: string | undefined;
    let unitId: string | undefined;
    let patientId: string | undefined;

    // Extrair professionalId
    if (typeof (data as Record<string, unknown>)?.professionalId === 'string') {
      professionalId = (data as Record<string, string>).professionalId;
    } else if (typeof (data as Record<string, unknown>)?.userId === 'string') {
      professionalId = (data as Record<string, string>).userId;
    } else if (typeof data.professional === 'string') {
      professionalId = data.professional;
    } else if (typeof data.professional === 'object' && data.professional && 'id' in data.professional) {
      professionalId = (data.professional as { id: string }).id;
    }

    // Extrair patientProtocolId
    if (typeof (data as Record<string, unknown>)?.patientProtocolId === 'string') {
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

    // Se for agendamento de protocolo, crie/atualize a sessão
    if (
      data.attendanceType === 'protocolo' &&
      !!patientProtocolId &&
      !!protocolServiceId &&
      patientProtocolId !== '' &&
      protocolServiceId !== ''
    ) {
      let session;
      
      // Se serviceSessionId foi fornecido, buscar a sessão específica
      if (typeof (data as Record<string, unknown>)?.serviceSessionId === 'string') {
        const serviceSessionId = (data as Record<string, string>).serviceSessionId;
        session = await this.patientServiceSessionRepository.findOne({
          where: { id: serviceSessionId },
        });
        
        if (!session) {
          throw new Error('Sessão não encontrada.');
        }
        
        // Verificar se a sessão já foi realizada
        if (session.status === 'completed') {
          throw new Error('Esta sessão já foi realizada.');
        }
        
        if (session.status === 'scheduled') {
          throw new Error('Esta sessão já está agendada.');
        }
        
        // Atualizar status para 'scheduled'
        session.status = 'scheduled';
        
      } else {
        // Lógica antiga para quando não há serviceSessionId específico
        // Se sessionNumber não foi fornecido, calcular o próximo disponível
        if (typeof sessionNumber === 'undefined' || sessionNumber === 0) {
          const existingSessions = await this.patientServiceSessionRepository.find({
            where: {
              patientProtocolId,
              protocolServiceId,
            },
            order: { sessionNumber: 'DESC' },
          });
          
          sessionNumber = existingSessions.length > 0 ? existingSessions[0].sessionNumber + 1 : 1;
        }
        
        // Verifica se já existe uma sessão para esse protocolo, serviço e número
        session = await this.patientServiceSessionRepository.findOne({
          where: {
            patientProtocolId,
            protocolServiceId,
            sessionNumber: Number(sessionNumber),
          },
        });
        
        if (!session) {
          // Criar nova sessão com status 'scheduled'
          session = this.patientServiceSessionRepository.create({
            patientProtocolId,
            protocolServiceId,
            sessionNumber: Number(sessionNumber),
            status: 'scheduled',
          });
        } else {
          // Se já existe, verificar o status
          if (session.status === 'completed') {
            throw new Error('Esta sessão já foi realizada.');
          }
          if (session.status === 'scheduled') {
            throw new Error('Esta sessão já está agendada.');
          }
          // Atualizar para 'scheduled' se estava em outro status
          session.status = 'scheduled';
        }
      }
      
      await this.patientServiceSessionRepository.save(session);
    }
    
    // Se for agendamento de protocolo, criar sessão sequencial automaticamente
    if (
      data.attendanceType === 'protocolo' &&
      !!patientProtocolId &&
      patientProtocolId !== ''
    ) {
      // Buscar todas as sessões deste protocolo
      const allSessions = await this.patientServiceSessionRepository.find({
        where: {
          patientProtocolId,
        },
        order: { sessionNumber: 'ASC' },
      });
      
      // Encontrar a próxima sessão disponível (sessionNumber = 0)
      const nextAvailableSession = allSessions.find(session => session.sessionNumber === 0);
      
      if (!nextAvailableSession) {
        throw new Error('Não há mais sessões disponíveis para este protocolo.');
      }
      
      // Calcular o próximo número sequencial
      const usedSessions = allSessions.filter(session => session.sessionNumber > 0);
      const nextSessionNumber = usedSessions.length + 1;
      
      // Atualizar a sessão com o número sequencial e status 'scheduled'
      nextAvailableSession.sessionNumber = nextSessionNumber;
      nextAvailableSession.status = 'scheduled';
      
      await this.patientServiceSessionRepository.save(nextAvailableSession);
      
      // Definir o serviceSessionId para o agendamento
      (data as any).serviceSessionId = nextAvailableSession.id;
      
      console.log(`Sessão ${nextSessionNumber} agendada para protocolo ${patientProtocolId}`);
    }
    
    // Montar corretamente os relacionamentos para o AttendanceSchedule
    const attendance = this.attendanceScheduleRepository.create({
      ...data,
      // Só definir patient se não for bloqueio e se patientId for válido
      patient: (!data.isBlocked && patientId && patientId !== 'undefined') ? { id: patientId } : undefined,
      unit: unitId ? { id: unitId } : undefined,
      patientProtocol: patientProtocolId ? { id: patientProtocolId } : undefined,
      serviceSession: (data as Record<string, string>).serviceSessionId ? { id: (data as Record<string, string>).serviceSessionId } : undefined,
      professional: professionalId ? { id: professionalId } : undefined,
    });
    
    const saved = await this.attendanceScheduleRepository.save(attendance);
    return saved;
  }

  async findAll(): Promise<AttendanceSchedule[]> {
    // Buscar com relacionamentos selecionados e campos específicos
    const schedules = await this.attendanceScheduleRepository.find({
      relations: [
        'patient', 
        'professional', 
        'unit', 
        'patientProtocol', 
        'serviceSession',
        'serviceSession.protocolService',
        'serviceSession.protocolService.service'
      ],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        attendanceType: true,
        observation: true,
        isBlocked: true,
        value: true,
        patient: {
          id: true,
          name: true,
          phone: true,
          email: true,
          birthDate: true,
          cpf: true,
          rg: true
        },
        professional: {
          id: true,
          name: true,
          email: true
        },
        unit: {
          id: true,
          name: true,
          address: true
        },
        patientProtocol: {
          id: true,
          status: true
        },
        serviceSession: {
          id: true,
          sessionNumber: true,
          status: true,
          totalSessions: true,
          protocolService: {
            id: true,
            service: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      }
    });
    
    return schedules;
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