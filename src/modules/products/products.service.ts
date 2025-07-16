import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { StockMovement } from '@/modules/stock-movements/entities/stock-movement.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  async create(data: any) {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async findAll(query: any = {}) {
    const products = await this.productRepository.find({
      relations: ['stockLocations'],
      order: { createdAt: 'DESC' }
    });
    return products.map(product => {
      const totalQuantity = (product.stockLocations || []).reduce((sum, loc) => sum + (loc.quantity || 0), 0);
      const inventoryStatus = totalQuantity < product.minimumStock ? 'baixo' : 'ok';
      return {
        ...product,
        totalQuantity,
        inventoryStatus,
      };
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['stockLocations']
    });
    if (!product) throw new NotFoundException('Product not found');
    const totalQuantity = (product.stockLocations || []).reduce((sum, loc) => sum + (loc.quantity || 0), 0);
    const inventoryStatus = totalQuantity < product.minimumStock ? 'baixo' : 'ok';
    return {
      ...product,
      totalQuantity,
      inventoryStatus,
    };
  }

  async update(id: string, data: any) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.remove(product);
    return { success: true };
  }
} 