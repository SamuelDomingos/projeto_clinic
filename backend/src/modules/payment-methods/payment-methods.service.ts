import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(data: any) {
    const paymentMethod = this.paymentMethodRepository.create(data);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async findAll(query: any = {}) {
    return this.paymentMethodRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!paymentMethod) throw new NotFoundException('PaymentMethod not found');
    return paymentMethod;
  }

  async update(id: string, data: any) {
    const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!paymentMethod) throw new NotFoundException('PaymentMethod not found');
    Object.assign(paymentMethod, data);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(id: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!paymentMethod) throw new NotFoundException('PaymentMethod not found');
    await this.paymentMethodRepository.remove(paymentMethod);
    return { success: true };
  }
} 