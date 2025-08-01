import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryPrediction } from './entities/inventory-prediction.entity';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { StockLocation } from '../stock-locations/entities/stock-location.entity';
import { conversarComIA } from '../../services/groq.service';

@Injectable()
export class InventoryAIService {
  constructor(
    @InjectRepository(InventoryPrediction)
    private inventoryPredictionRepository: Repository<InventoryPrediction>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(StockLocation)
    private stockLocationRepository: Repository<StockLocation>,
  ) {}

  async generateInventoryPrediction(productId: string): Promise<InventoryPrediction> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    const currentStock = await this.getCurrentStock(productId);
    const demandHistory = await this.getDemandHistory(productId);
    const predictedDemand = await this.predictDemand(demandHistory);
    const recommendedReorderPoint = this.calculateOptimalReorderPoint(predictedDemand);
    const recommendedOrderQuantity = this.calculateRecommendedOrderQuantity(predictedDemand);
    const costAnalysis = this.calculateCostAnalysis(product, recommendedOrderQuantity);
    const predictedStockoutDate = this.calculateStockoutDate(currentStock, predictedDemand);

    const prediction = this.inventoryPredictionRepository.create({
      productId,
      predictionType: 'demand_forecast' as const,
      currentStock,
      predictedDemand,
      recommendedReorderPoint,
      recommendedOrderQuantity,
      seasonalPatterns: {},
      costAnalysis,
      predictedStockoutDate: predictedStockoutDate || undefined
    });

    // Definir a relação do produto após a criação
    prediction.product = product;

    return await this.inventoryPredictionRepository.save(prediction);
  }

  async getAllPredictions(): Promise<InventoryPrediction[]> {
    return await this.inventoryPredictionRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' }
    });
  }

  private async getCurrentStock(productId: string): Promise<number> {
    const stockLocations = await this.stockLocationRepository.find({
      where: { product: { id: productId } }
    });
    
    return stockLocations.reduce((total, location) => total + location.quantity, 0);
  }

  private async getDemandHistory(productId: string): Promise<any[]> {
    const movements = await this.stockMovementRepository.find({
      where: { product: { id: productId }, type: 'out' },
      order: { createdAt: 'DESC' },
      take: 50
    });

    return movements;
  }

  private async predictDemand(history: any[]): Promise<number> {
    if (history.length === 0) return 10; // Default

    const totalQuantity = history.reduce((sum, movement) => sum + movement.quantity, 0);
    const avgDailyDemand = totalQuantity / Math.max(history.length, 1);
    
    // Simulação de previsão com tendência
    return Math.round(avgDailyDemand * 30); // Demanda mensal
  }

  private calculateOptimalReorderPoint(predictedDemand: number): number {
    const leadTime = 7; // dias
    const safetyStock = predictedDemand * 0.2; // 20% de estoque de segurança
    const dailyDemand = predictedDemand / 30;
    
    return Math.round(dailyDemand * leadTime + safetyStock);
  }

  private calculateRecommendedOrderQuantity(predictedDemand: number): number {
    // Fórmula EOQ simplificada
    const orderingCost = 50; // custo fixo por pedido
    const holdingCost = 2; // custo de manutenção por unidade
    
    return Math.round(Math.sqrt((2 * predictedDemand * orderingCost) / holdingCost));
  }

  private calculateCostAnalysis(product: any, quantity: number): any {
    const costPerUnit = 0.5; // custo de armazenagem por unidade
    return {
      storageCost: quantity * costPerUnit,
      orderingCost: 50,
      totalCost: quantity * costPerUnit + 50
    };
  }

  private calculateStockoutDate(currentStock: number, monthlyDemand: number): Date | null {
    if (monthlyDemand <= 0) return null;
    
    const dailyDemand = monthlyDemand / 30;
    const daysUntilStockout = currentStock / dailyDemand;
    
    const stockoutDate = new Date();
    stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysUntilStockout));
    
    return stockoutDate;
  }

  async generateInventoryInsights(productId: string, data: any): Promise<string> {
    const prompt = `
      Analise os dados de estoque do produto ID: ${productId}
      
      Dados:
      ${JSON.stringify(data)}
      
      Forneça insights sobre:
      1. Padrões de consumo
      2. Sazonalidade
      3. Otimizações possíveis
      4. Alertas importantes
      5. Recomendações de compra
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      return response.success ? response.content : 'Análise de estoque não disponível.';
    } catch (error) {
      return 'Erro ao analisar dados de estoque.';
    }
  }

  async optimizeInventoryLevels(products: any[]): Promise<any> {
    const prompt = `
      Otimize os níveis de estoque para os seguintes produtos:
      ${JSON.stringify(products)}
      
      Considere:
      1. Histórico de consumo
      2. Sazonalidade
      3. Custos de armazenamento
      4. Prazos de validade
      5. Fornecedores disponíveis
      
      Responda em JSON com recomendações para cada produto.
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      if (response.success) {
        try {
          return JSON.parse(response.content);
        } catch {
          return { recommendations: response.content };
        }
      }
    } catch (error) {
      console.error('Erro ao otimizar estoque com IA:', error);
    }
    
    return { error: 'Otimização não disponível' };
  }
}