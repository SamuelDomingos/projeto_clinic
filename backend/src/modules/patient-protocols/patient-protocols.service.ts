import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PatientProtocol } from './entities/patient-protocol.entity';
import { PatientServiceSession } from '../patient-service-sessions/entities/patient-service-session.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { ProtocolService as ProtocolServiceEntity } from '../protocol-services/entities/protocol-service.entity';

@Injectable()
export class PatientProtocolsService {
  constructor(
    @InjectRepository(PatientProtocol)
    private readonly patientProtocolRepository: Repository<PatientProtocol>,
    @InjectRepository(PatientServiceSession)
    private readonly patientServiceSessionRepository: Repository<PatientServiceSession>,
    @InjectRepository(Protocol)
    private readonly protocolRepository: Repository<Protocol>,
    @InjectRepository(ProtocolServiceEntity)
    private readonly protocolServiceRepository: Repository<ProtocolServiceEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: any) {
    return this.dataSource.transaction(async manager => {
      // Cria o PatientProtocol normalmente
      const patientProtocol = manager.create(PatientProtocol, data);
      const savedPatientProtocol = await manager.save(patientProtocol);
      // Busca os serviços do protocolo
      const protocol = await manager.findOne(Protocol, {
        where: { id: savedPatientProtocol.protocolId },
        relations: ['protocolServices'],
      });
      console.log('protocol.protocolServices:', protocol?.protocolServices);
      if (protocol && protocol.protocolServices && protocol.protocolServices.length > 0) {
        for (const protocolService of protocol.protocolServices) {
          for (let i = 1; i <= protocolService.numberOfSessions; i++) {
            const exists = await manager.getRepository(PatientServiceSession).findOne({
              where: {
                patientProtocolId: savedPatientProtocol.id,
                protocolServiceId: protocolService.id,
                sessionNumber: i,
              },
            });
            if (!exists) {
              await manager.getRepository(PatientServiceSession).save({
                patientProtocolId: savedPatientProtocol.id,
                protocolServiceId: protocolService.id,
                sessionNumber: i,
                status: 'scheduled',
              });
              console.log('Sessão criada:', { patientProtocolId: savedPatientProtocol.id, protocolServiceId: protocolService.id, sessionNumber: i });
            } else {
              console.log('Sessão já existe:', { patientProtocolId: savedPatientProtocol.id, protocolServiceId: protocolService.id, sessionNumber: i });
            }
          }
        }
      } else {
        console.log('Protocolo ou serviços não encontrados ao criar PatientProtocol!');
      }
      return savedPatientProtocol;
    });
  }

  async createSessionsForPatientProtocol(patientProtocolId: string) {
    console.log('Chamando createSessionsForPatientProtocol para', patientProtocolId);
    const patientProtocol = await this.patientProtocolRepository.findOne({
      where: { id: patientProtocolId },
      relations: ['protocol', 'protocol.protocolServices'],
    });
    console.log('PatientProtocol:', patientProtocol);
    if (!patientProtocol || !patientProtocol.protocol || !patientProtocol.protocol.protocolServices) {
      console.log('Protocolo ou serviços não encontrados!');
      return;
    }
    for (const protocolService of patientProtocol.protocol.protocolServices) {
      console.log('Criando sessões para serviço:', protocolService.id, protocolService.numberOfSessions);
      for (let i = 1; i <= protocolService.numberOfSessions; i++) {
        // Verifica se já existe a sessão para evitar duplicidade
        const exists = await this.patientServiceSessionRepository.findOne({
          where: {
            patientProtocolId: patientProtocol.id,
            protocolServiceId: protocolService.id,
            sessionNumber: i,
          },
        });
        if (!exists) {
          await this.patientServiceSessionRepository.save({
            patientProtocolId: patientProtocol.id,
            protocolServiceId: protocolService.id,
            sessionNumber: i,
            status: 'scheduled',
          });
          console.log('Sessão criada:', { patientProtocolId: patientProtocol.id, protocolServiceId: protocolService.id, sessionNumber: i });
        } else {
          console.log('Sessão já existe:', { patientProtocolId: patientProtocol.id, protocolServiceId: protocolService.id, sessionNumber: i });
        }
      }
    }
  }

  async findAll(query: any = {}) {
    return this.patientProtocolRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const patientProtocol = await this.patientProtocolRepository.findOne({ where: { id } });
    if (!patientProtocol) throw new NotFoundException('PatientProtocol not found');
    return patientProtocol;
  }

  async update(id: string, data: any) {
    const patientProtocol = await this.patientProtocolRepository.findOne({ where: { id } });
    if (!patientProtocol) throw new NotFoundException('PatientProtocol not found');
    Object.assign(patientProtocol, data);
    return this.patientProtocolRepository.save(patientProtocol);
  }

  async remove(id: string) {
    const patientProtocol = await this.patientProtocolRepository.findOne({ where: { id } });
    if (!patientProtocol) throw new NotFoundException('PatientProtocol not found');
    await this.patientProtocolRepository.remove(patientProtocol);
    return { success: true };
  }
} 