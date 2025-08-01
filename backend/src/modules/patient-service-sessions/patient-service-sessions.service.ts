import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientServiceSession, PatientServiceSessionStatus } from './entities/patient-service-session.entity';

@Injectable()
export class PatientServiceSessionsService {
  constructor(
    @InjectRepository(PatientServiceSession)
    private readonly patientServiceSessionRepository: Repository<PatientServiceSession>,
  ) {}

  async create(data: any) {
    const session = this.patientServiceSessionRepository.create(data);
    return this.patientServiceSessionRepository.save(session);
  }

  async findAll(query: any = {}) {
    return this.patientServiceSessionRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const session = await this.patientServiceSessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException('PatientServiceSession not found');
    return session;
  }

  async update(id: string, data: any) {
    const session = await this.patientServiceSessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException('PatientServiceSession not found');
    Object.assign(session, data);
    return this.patientServiceSessionRepository.save(session);
  }

  async remove(id: string) {
    const session = await this.patientServiceSessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException('PatientServiceSession not found');
    await this.patientServiceSessionRepository.remove(session);
    return { success: true };
  }

  async updateSessionStatus(id: string, status: PatientServiceSessionStatus) {
    const session = await this.patientServiceSessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException('PatientServiceSession not found');
    
    session.status = status;
    return this.patientServiceSessionRepository.save(session);
  }
  
  async getCompletedSessionsCount(patientProtocolId: string, protocolServiceId: string) {
    const completedSessions = await this.patientServiceSessionRepository.count({
      where: {
        patientProtocolId,
        protocolServiceId,
        status: 'completed'
      }
    });
    
    return completedSessions;
  }
  
  async getTotalSessionsCount(patientProtocolId: string, protocolServiceId: string) {
    const totalSessions = await this.patientServiceSessionRepository.count({
      where: {
        patientProtocolId,
        protocolServiceId
      }
    });
    
    return totalSessions;
  }
}