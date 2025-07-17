import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(data: any) {
    const service = this.serviceRepository.create(data);
    return this.serviceRepository.save(service);
  }

  async findAll(query: any = {}) {
    return this.serviceRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, data: any) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    Object.assign(service, data);
    return this.serviceRepository.save(service);
  }

  async remove(id: string) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    await this.serviceRepository.remove(service);
    return { success: true };
  }
} 