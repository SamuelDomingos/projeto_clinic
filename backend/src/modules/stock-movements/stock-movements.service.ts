import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { StockLocationsService } from '../stock-locations/stock-locations.service';
import { StockLocation } from '../stock-locations/entities/stock-location.entity';
import { SuppliersService } from '../suppliers/suppliers.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CategoriesService } from '../categories/categories.service';
import { Inject, forwardRef } from '@nestjs/common';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    private readonly stockLocationsService: StockLocationsService,
    private readonly suppliersService: SuppliersService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(data: any, userId: string) {
    console.log('--- [StockMovementsService.create] ---');
    console.log('Dados recebidos:', JSON.stringify(data));
    console.log('userId:', userId);
    if (data.type === 'in') {
      let stockLocation: StockLocation | null = null;

      // 1. Buscar o supplier (unidade) pelo locationId
      console.log('[IN] Procurando supplier pelo locationId:', data.locationId);
      const supplier = await this.suppliersService.findOne(data.locationId).catch(e => {
        console.error('[IN] Erro ao buscar supplier:', e.message);
        return null;
      });
      if (!supplier) {
        console.error('[IN] Unidade (supplier) não encontrada para locationId:', data.locationId);
        throw new Error('Unidade (supplier) não encontrada');
      }

      // 2. Procurar StockLocation para productId + supplier.name
      console.log('[IN] Procurando StockLocation para productId:', data.productId, 'location:', supplier.name);
      stockLocation = await this.stockLocationsService.findByProductAndLocationName(data.productId, supplier.name);
      console.log('[IN] StockLocation encontrada:', stockLocation);

      // 3. Se não existir, criar StockLocation
      if (!stockLocation) {
        console.log('[IN] StockLocation não encontrada, criando nova...');
        stockLocation = await this.stockLocationsService.create({
          productId: data.productId,
          location: supplier.name,
          quantity: 0,
        });
        console.log('[IN] Nova StockLocation criada:', stockLocation);
      }

      // 4. Fazer a entrada normalmente
      stockLocation.quantity += data.quantity;
      stockLocation.price = data.price;
      stockLocation.sku = data.sku;
      stockLocation.expiryDate = data.expiryDate;
      console.log('[IN] Atualizando StockLocation (entrada):', stockLocation.id, stockLocation.location);
      await this.stockLocationsService.update(stockLocation.id, stockLocation);
      data.locationId = stockLocation.id;

      // Criar transação financeira (conta a pagar) - CATEGORIA OBRIGATÓRIA DO FRONTEND
      if (data.categoryId) {
        try {
          // Verificar se a categoria existe
          const categoria = await this.categoriesService.findOne(data.categoryId);
          if (!categoria) {
            throw new Error('Categoria não encontrada');
          }
          
          // Calcular valor total
          const amount = Number(data.price) * Number(data.quantity);
          // Data de vencimento padrão: hoje + 30 dias
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          
          await this.transactionsService.create({
            type: 'expense',
            amount: amount.toFixed(2),
            description: `Compra de produto: ${data.productId}`,
            category: categoria.id,
            dueDate,
            status: 'pending',
            notes: `Entrada de estoque gerada automaticamente para o fornecedor ${data.locationId}`,
            reference: data.productId,
            boletoNumber: `AUTO-${Date.now()}`,
            createdBy: userId,
            updatedBy: userId,
          }, userId);
        } catch (e) {
          console.error('Erro ao criar transação financeira para entrada de estoque:', e);
          throw e;
        }
      } else {
        throw new Error('Categoria é obrigatória para movimentos de entrada de estoque');
      }
    } else if (data.type === 'out') {
      let stockLocation: StockLocation | null = null;
      if (data.locationId) {
        console.log('[OUT] Procurando StockLocation pelo locationId:', data.locationId);
        stockLocation = await this.stockLocationsService.findOne(data.locationId).catch(e => {
          console.error('[OUT] Erro ao buscar StockLocation:', e.message);
          return null;
        });
      }
      console.log('[OUT] StockLocation encontrada:', stockLocation);
      if (!stockLocation) {
        console.error('[OUT] Localização de estoque não encontrada para locationId:', data.locationId);
        throw new Error('Localização de estoque não encontrada');
      }
      if (stockLocation.quantity >= data.quantity) {
        stockLocation.quantity -= data.quantity;
        await this.stockLocationsService.update(stockLocation.id, stockLocation, true);
        data.locationId = stockLocation.id;
      } else {
        console.error('[OUT] Estoque insuficiente para saída. Quantidade disponível:', stockLocation.quantity, 'Solicitada:', data.quantity);
        throw new Error('Estoque insuficiente para saída');
      }
    } else if (data.type === 'transfer') {
      // ORIGEM: sempre StockLocation existente
      let fromStock: StockLocation | null = null;
      if (data.fromLocationId) {
        console.log('[TRANSFER] Procurando StockLocation origem pelo fromLocationId:', data.fromLocationId);
        fromStock = await this.stockLocationsService.findOne(data.fromLocationId).catch(e => {
          console.error('[TRANSFER] Erro ao buscar StockLocation origem:', e.message);
          return null;
        });
      }
      console.log('[TRANSFER] StockLocation origem encontrada:', fromStock);
      if (!fromStock) {
        console.error('[TRANSFER] Localização de origem não encontrada para fromLocationId:', data.fromLocationId);
        throw new Error('Localização de origem não encontrada');
      }

      // DESTINO: supplier (unidade), pode não existir StockLocation ainda
      let toStock: StockLocation | null = null;
      if (data.toLocationId) {
        console.log('[TRANSFER] Procurando supplier destino pelo toLocationId:', data.toLocationId);
        const toSupplier = await this.suppliersService.findOne(data.toLocationId).catch(e => {
          console.error('[TRANSFER] Erro ao buscar supplier destino:', e.message);
          return null;
        });
        if (!toSupplier) {
          console.error('[TRANSFER] Unidade de destino não encontrada para toLocationId:', data.toLocationId);
          throw new Error('Unidade de destino não encontrada');
        }
        console.log('[TRANSFER] Procurando StockLocation destino para productId:', data.productId, 'location:', toSupplier.name);
        toStock = await this.stockLocationsService.findByProductAndLocationName(data.productId, toSupplier.name);
        console.log('[TRANSFER] StockLocation destino encontrada:', toStock);
        if (!toStock) {
          console.log('[TRANSFER] StockLocation destino não encontrada, criando nova...');
          toStock = await this.stockLocationsService.create({
            productId: data.productId,
            location: toSupplier.name,
            quantity: 0,
          });
          console.log('[TRANSFER] Nova StockLocation destino criada:', toStock);
        }
      }
      if (!toStock) {
        console.error('[TRANSFER] Localização de destino não encontrada ou não especificada para toLocationId:', data.toLocationId);
        throw new Error('Localização de destino não encontrada ou não especificada');
      }

      // Lógica de transferência
      if (fromStock.quantity >= data.quantity) {
        fromStock.quantity -= data.quantity;
        // Log detalhado antes do update da origem
        const checkFromStock = await this.stockLocationsService.findOne(fromStock.id).catch(e => {
          console.error('[TRANSFER] Erro ao buscar StockLocation origem antes do update:', e.message);
          return null;
        });
        console.log('[TRANSFER] Check fromStock before update:', fromStock.id, checkFromStock);
        console.log('[TRANSFER] Atualizando StockLocation (origem transferência):', fromStock.id, fromStock.location, 'Novo valor:', fromStock);
        await this.stockLocationsService.update(fromStock.id, fromStock, true);
        toStock.quantity += data.quantity;
        // Log detalhado antes do update do destino
        const checkToStock = await this.stockLocationsService.findOne(toStock.id).catch(e => {
          console.error('[TRANSFER] Erro ao buscar StockLocation destino antes do update:', e.message);
          return null;
        });
        console.log('[TRANSFER] Check toStock before update:', toStock.id, checkToStock);
        console.log('[TRANSFER] Atualizando StockLocation (destino transferência):', toStock.id, toStock.location, 'Novo valor:', toStock);
        await this.stockLocationsService.update(toStock.id, toStock, true);
        data.fromLocationId = fromStock.id;
        data.toLocationId = toStock.id;
      } else {
        console.error('[TRANSFER] Estoque insuficiente para transferência. Quantidade disponível:', fromStock.quantity, 'Solicitada:', data.quantity);
        throw new Error('Estoque insuficiente para transferência');
      }
    }
    console.log('[MOVEMENT] Criando movimentação de estoque:', { ...data, userId });
    const movement = this.stockMovementRepository.create({
      ...data,
      userId,
    });
    return this.stockMovementRepository.save(movement);
  }

  async findAll(query: any = {}) {
    const movements = await this.stockMovementRepository.find({
      relations: ['location', 'user', 'supplier', 'fromLocation', 'toLocation'],
      where: query,
      order: { createdAt: 'DESC' as const }
    });

    // Retorne apenas os campos necessários e seguros
    return movements.map(movement => ({
      id: movement.id,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      price: movement.price,
      expiryDate: movement.expiryDate,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
      location: (movement.type === 'transfer')
        ? null
        : (movement.location
            ? { id: movement.location.id, location: movement.location.location }
            : null),
      fromLocation: movement.fromLocation
        ? { id: movement.fromLocation.id, location: movement.fromLocation.location }
        : null,
      toLocation: movement.toLocation
        ? { id: movement.toLocation.id, location: movement.toLocation.location }
        : null,
      supplier: movement.supplier
        ? { id: movement.supplier.id, name: movement.supplier.name }
        : null,
      user: movement.user
        ? { id: movement.user.id, name: movement.user.name }
        : null,
    }));
  }

  async findOne(id: string) {
    const movement = await this.stockMovementRepository.findOne({ where: { id } });
    if (!movement) throw new NotFoundException('Stock movement not found');
    return movement;
  }

  async update(id: string, data: any) {
    const movement = await this.stockMovementRepository.findOne({ where: { id } });
    if (!movement) throw new NotFoundException('Stock movement not found');
    Object.assign(movement, data);
    return this.stockMovementRepository.save(movement);
  }

  async remove(id: string) {
    const movement = await this.stockMovementRepository.findOne({ where: { id } });
    if (!movement) throw new NotFoundException('Stock movement not found');
    await this.stockMovementRepository.remove(movement);
    return { success: true };
  }
}