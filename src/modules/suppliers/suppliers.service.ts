import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
// import { SupplierStatus } from './entities/supplier.entity'; // descomente se enum existir

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(data: any) {
    return this.supplierRepository.save(this.supplierRepository.create(data));
  }

  async findOne(id: string) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: string, data: any) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    Object.assign(supplier, data);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    await this.supplierRepository.remove(supplier);
    return { success: true };
  }

  async search(query: any) {
    const { name, category, status, type } = query;
    const where: any = {};
    if (name) where.name = ILike(`%${name}%`);
    if (category) where.category = category;
    if (status) where.status = status;
    if (type) where.type = type;
    return this.supplierRepository.find({ where });
  }

  async updateStatus(id: string, status: any) { // ajuste para SupplierStatus se enum
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    supplier.status = status;
    return this.supplierRepository.save(supplier);
  }
} 