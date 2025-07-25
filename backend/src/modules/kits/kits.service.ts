import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kit } from './entities/kit.entity';
import { KitItem } from './entities/kit-item.entity';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { ProductsService } from '../products/products.service';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

@Injectable()
export class KitsService {
  constructor(
    @InjectRepository(Kit)
    private readonly kitRepository: Repository<Kit>,
    @InjectRepository(KitItem)
    private readonly kitItemRepository: Repository<KitItem>,
    private readonly stockMovementsService: StockMovementsService,
    private readonly productsService: ProductsService,
  ) {}

  async create(data: any) {
    const kit = this.kitRepository.create({
      name: data.name,
      description: data.description,
      status: data.status || 'active',
    });
    
    const savedKit = await this.kitRepository.save(kit);
    
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const kitItem = this.kitItemRepository.create({
          kitId: savedKit.id,
          productId: item.productId,
          quantity: item.quantity,
        });
        await this.kitItemRepository.save(kitItem);
      }
    }
    
    return this.findOne(savedKit.id);
  }

  async findAll() {
    return this.kitRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    
    if (!kit) throw new NotFoundException('Kit not found');
    return kit;
  }

  async update(id: string, data: any) {
    const kit = await this.kitRepository.findOne({ where: { id } });
    if (!kit) throw new NotFoundException('Kit not found');
    
    // Atualizar dados básicos do kit
    if (data.name) kit.name = data.name;
    if (data.description !== undefined) kit.description = data.description;
    if (data.status) kit.status = data.status;
    
    await this.kitRepository.save(kit);
    
    // Atualizar itens se fornecidos
    if (data.items && Array.isArray(data.items)) {
      // Remover itens existentes
      await this.kitItemRepository.delete({ kitId: id });
      
      // Adicionar novos itens
      for (const item of data.items) {
        const kitItem = this.kitItemRepository.create({
          kitId: id,
          productId: item.productId,
          quantity: item.quantity,
        });
        await this.kitItemRepository.save(kitItem);
      }
    }
    
    return this.findOne(id);
  }

  async remove(id: string) {
    const kit = await this.kitRepository.findOne({ where: { id } });
    if (!kit) throw new NotFoundException('Kit not found');
    
    // Remover itens do kit primeiro
    await this.kitItemRepository.delete({ kitId: id });
    
    // Remover o kit
    await this.kitRepository.remove(kit);
    return { success: true };
  }

  // Método para dar baixa em um kit completo
  async removeKitStock(data: {
    kitId: string;
    locationId: string;
    quantity: number;
    reason: string;
    userId: string;
  }) {
    const kit = await this.findOne(data.kitId);
    if (!kit) throw new NotFoundException('Kit not found');
    
    // Verificar se o kit está ativo
    if (kit.status !== 'active') {
      throw new Error('Kit inativo não pode ser utilizado');
    }
    
    // Verificar se o kit tem itens
    if (!kit.items || kit.items.length === 0) {
      throw new Error('Kit não possui itens');
    }
    
    // Definir o tipo correto para o array results
    const results: StockMovement[] = [];
    const errors: { productId: string; error: string }[] = [];
    
    // Dar baixa em cada item do kit
    for (const item of kit.items) {
      try {
        // Calcular a quantidade total a ser removida (quantidade do item no kit * quantidade de kits)
        const totalQuantity = item.quantity * data.quantity;
        
        // Dar baixa no estoque
        const result = await this.stockMovementsService.create({
          productId: item.productId,
          locationId: data.locationId,
          quantity: totalQuantity,
          type: 'out',
          reason: `${data.reason} (Kit: ${kit.name})`,
        }, data.userId);
        
        // Corrigir esta linha - usar spread operator:
        results.push(...result);
      } catch (error) {
        errors.push({
          productId: item.productId,
          error: error.message,
        });
      }
    }
    
    // Se houver erros, retornar informações sobre os erros
    if (errors.length > 0) {
      throw new Error(`Erro ao dar baixa em alguns itens do kit: ${JSON.stringify(errors)}`);
    }
    
    return {
      success: true,
      kit,
      movements: results,
    };
  }
}