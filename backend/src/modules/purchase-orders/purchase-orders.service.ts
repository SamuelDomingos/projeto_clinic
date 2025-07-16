import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async create(data: any) {
    const purchaseOrder = this.purchaseOrderRepository.create(data);
    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async findAll(query: any = {}) {
    return this.purchaseOrderRepository.find();
  }

  async findOne(id: string) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('PurchaseOrder not found');
    return purchaseOrder;
  }

  async update(id: string, data: any) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('PurchaseOrder not found');
    Object.assign(purchaseOrder, data);
    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async remove(id: string) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({ where: { id } });
    if (!purchaseOrder) throw new NotFoundException('PurchaseOrder not found');
    await this.purchaseOrderRepository.remove(purchaseOrder);
    return { success: true };
  }
} 