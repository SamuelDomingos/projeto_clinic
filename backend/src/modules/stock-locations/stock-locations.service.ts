import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockLocation } from './entities/stock-location.entity';
import { StockMovementsService } from '../stock-movements/stock-movements.service';

@Injectable()
export class StockLocationsService {
  constructor(
    @InjectRepository(StockLocation)
    private readonly stockLocationRepository: Repository<StockLocation>,
    @Inject(forwardRef(() => StockMovementsService))
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async create(data: any) {
    if (Array.isArray(data)) {
      throw new Error('O corpo da requisição deve ser um objeto, não um array.');
    }
    const stockLocation = this.stockLocationRepository.create(data);
    const saved = await this.stockLocationRepository.save(stockLocation);
    const savedLocation = Array.isArray(saved) ? saved[0] : saved;
    console.log('StockLocation criada/salva:', savedLocation.id, savedLocation.location);
    return savedLocation;
  }

  async findAll(query: any = {}) {
    const where: any = {};
    if (query.productId) where.productId = query.productId;
    if (query.location) where.location = query.location;
    
    const result = await this.stockLocationRepository.find({ where });
    
    return result;
  }

  async findOne(id: string) {
    const stockLocation = await this.stockLocationRepository.findOne({ where: { id } });
    if (!stockLocation) throw new NotFoundException('StockLocation not found');
    return stockLocation;
  }

  async update(id: string, data: any, skipMovement = false) {
    const stockLocation = await this.stockLocationRepository.findOne({ where: { id } });
    if (!stockLocation) {
      console.error('StockLocation not found for update:', id);
      throw new NotFoundException('StockLocation not found');
    }
    const oldQuantity = stockLocation.quantity;
    Object.assign(stockLocation, data);
    const saved = await this.stockLocationRepository.save({ ...stockLocation });
    // Registrar movimentação de saída se quantidade diminuir
    if (!skipMovement && data.quantity !== undefined && data.quantity < oldQuantity) {
      await this.stockMovementsService.create({
        productId: saved.productId,
        locationId: saved.id, // Usar sempre o ID da StockLocation
        quantity: oldQuantity - data.quantity,
        type: 'out',
        userId: data.userId || 'system', // Garante sempre um userId
        price: saved.price,
        sku: saved.sku,
        expiryDate: saved.expiryDate,
        supplierId: data.supplierId || null,
        reason: data.reason || 'Saída de estoque',
      }, data.userId || 'system');
    }
    return saved;
  }

  async remove(id: string) {
    const stockLocation = await this.stockLocationRepository.findOne({ where: { id } });
    if (!stockLocation) throw new NotFoundException('StockLocation not found');
    await this.stockLocationRepository.remove(stockLocation);
    return { success: true };
  }

  async findByProductAndLocationName(productId: string, location: string) {
    const found = await this.stockLocationRepository.findOne({ where: { productId, location } });
    if (Array.isArray(found)) {
      console.warn('findByProductAndLocationName retornou array, usando o primeiro:', found);
      return found[0] || null;
    }
    return found;
  }
} 