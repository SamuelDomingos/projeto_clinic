import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProtocol } from './entities/patient-protocol.entity';

@Injectable()
export class PatientProtocolsService {
  constructor(
    @InjectRepository(PatientProtocol)
    private readonly patientProtocolRepository: Repository<PatientProtocol>,
  ) {}

  async create(data: any) {
    const patientProtocol = this.patientProtocolRepository.create(data);
    return this.patientProtocolRepository.save(patientProtocol);
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