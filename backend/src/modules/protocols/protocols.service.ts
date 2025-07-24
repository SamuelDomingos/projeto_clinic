import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Protocol } from './entities/protocol.entity';
import { ProtocolService as ProtocolServiceEntity } from '../protocol-services/entities/protocol-service.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class ProtocolsService {
  constructor(
    @InjectRepository(Protocol)
    private readonly protocolRepository: Repository<Protocol>,
    private readonly dataSource: DataSource,
    @InjectRepository(ProtocolServiceEntity)
    private readonly protocolServiceRepository: Repository<ProtocolServiceEntity>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(data: any) {
    // data: { name, totalPrice, services: [{ name, type, requiresScheduling, numberOfSessions, requiresIntervalControl }] }
    return this.dataSource.transaction(async manager => {
      const { name, totalPrice, services } = data;
      // Cria o protocolo
      const protocol = manager.create(Protocol, { name, totalPrice });
      const savedProtocol = await manager.save(protocol);
      // Cria os serviços e os vínculos (ProtocolService)
      if (Array.isArray(services) && services.length > 0) {
        for (const item of services) {
          // Cria o serviço inline
          const service = manager.create(Service, {
            name: item.name,
            type: item.type,
            requiresScheduling: item.requiresScheduling ?? false,
          });
          const savedService = await manager.save(service);
          // Cria o vínculo
          const protocolService = manager.create(ProtocolServiceEntity, {
            protocolId: savedProtocol.id,
            serviceId: savedService.id,
            numberOfSessions: item.numberOfSessions,
            requiresIntervalControl: item.requiresIntervalControl ?? false,
          });
          await manager.save(protocolService);
        }
      }
      // Retorna o protocolo com os itens
      const protocolWithItems = await manager.findOne(Protocol, {
        where: { id: savedProtocol.id },
        relations: ['protocolServices'],
      });
      return protocolWithItems;
    });
  }

  async findAll(query: any = {}) {
    return this.protocolRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['protocolServices', 'protocolServices.service'],
    });
  }

  async findOne(id: string) {
    const protocol = await this.protocolRepository.findOne({
      where: { id },
      relations: ['protocolServices', 'protocolServices.service'],
    });
    if (!protocol) throw new NotFoundException('Protocol not found');
    return protocol;
  }

  async update(id: string, data: any) {
    const protocol = await this.protocolRepository.findOne({ where: { id } });
    if (!protocol) throw new NotFoundException('Protocol not found');
    Object.assign(protocol, data);
    return this.protocolRepository.save(protocol);
  }

  async remove(id: string) {
    const protocol = await this.protocolRepository.findOne({ where: { id } });
    if (!protocol) throw new NotFoundException('Protocol not found');
    await this.protocolRepository.remove(protocol);
    return { success: true };
  }
}