import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocolService } from './entities/protocol-service.entity';

@Injectable()
export class ProtocolServicesService {
  constructor(
    @InjectRepository(ProtocolService)
    private readonly protocolServiceRepository: Repository<ProtocolService>,
  ) {}

  async create(data: any) {
    const protocolService = this.protocolServiceRepository.create(data);
    return this.protocolServiceRepository.save(protocolService);
  }

  async findAll(query: any = {}) {
    return this.protocolServiceRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const protocolService = await this.protocolServiceRepository.findOne({ where: { id } });
    if (!protocolService) throw new NotFoundException('ProtocolService not found');
    return protocolService;
  }

  async update(id: string, data: any) {
    const protocolService = await this.protocolServiceRepository.findOne({ where: { id } });
    if (!protocolService) throw new NotFoundException('ProtocolService not found');
    Object.assign(protocolService, data);
    return this.protocolServiceRepository.save(protocolService);
  }

  async remove(id: string) {
    const protocolService = await this.protocolServiceRepository.findOne({ where: { id } });
    if (!protocolService) throw new NotFoundException('ProtocolService not found');
    await this.protocolServiceRepository.remove(protocolService);
    return { success: true };
  }
} 