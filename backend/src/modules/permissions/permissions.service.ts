import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(data: any) {
    const permission = this.permissionRepository.create(data);
    return this.permissionRepository.save(permission);
  }

  async findAll(query: any = {}) {
    return this.permissionRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: string, data: any) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    Object.assign(permission, data);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    await this.permissionRepository.remove(permission);
    return { success: true };
  }
} 