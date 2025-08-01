import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InventoryAIService } from './inventory-ai.service';
import { InventoryPrediction } from './entities/inventory-prediction.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Inventory AI')
@Controller('inventory-ai')
export class InventoryAIController {
  constructor(
    private readonly inventoryAIService: InventoryAIService,
  ) {}

  @Get('predictions')
  @ApiOperation({ summary: 'Obter todas as previsões de inventário' })
  @ApiResponse({ status: 200, description: 'Previsões de inventário retornadas com sucesso.' })
  async getAllPredictions(): Promise<InventoryPrediction[]> {
    return await this.inventoryAIService.getAllPredictions();
  }

  @Post('predict')
  @ApiOperation({ summary: 'Gerar uma previsão de inventário' })
  @ApiResponse({ status: 201, description: 'Previsão de inventário gerada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async generatePrediction(
    @Body() params: { productId: string }
  ): Promise<InventoryPrediction> {
    return await this.inventoryAIService.generateInventoryPrediction(params.productId);
  }

  @Post('batch-predict')
  @ApiOperation({ summary: 'Gerar previsões de inventário em lote' })
  @ApiResponse({ status: 201, description: 'Previsões de inventário em lote geradas com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async batchGeneratePredictions(
    @Body() params: { productIds: string[] }
  ): Promise<InventoryPrediction[]> {
    const predictions: InventoryPrediction[] = [];
    
    for (const productId of params.productIds) {
      try {
        const prediction = await this.inventoryAIService.generateInventoryPrediction(productId);
        predictions.push(prediction);
      } catch (error) {
        console.error(`Erro ao gerar previsão para produto ${productId}:`, error);
      }
    }
    
    return predictions;
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Obter análises de inventário' })
  @ApiResponse({ status: 200, description: 'Análises de inventário retornadas com sucesso.' })
  async getInventoryAnalytics(
    @Query('location') location?: string
  ) {
    const predictions = await this.inventoryAIService.getAllPredictions();
    
    const totalProducts = predictions.length;
    const lowStockProducts = predictions.filter(p => 
      p.currentStock <= p.recommendedReorderPoint
    ).length;
    
    const stockoutRisk = predictions.filter(p => 
      p.predictedStockoutDate && 
      new Date(p.predictedStockoutDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const avgDemand = predictions.reduce((sum, p) => 
      sum + p.predictedDemand, 0
    ) / Math.max(totalProducts, 1);
    
    return {
      summary: {
        totalProducts,
        lowStockProducts,
        stockoutRisk,
        avgDemand: Math.round(avgDemand)
      },
      recommendations: this.generateInventoryRecommendations(predictions),
      trends: {
        demandTrend: 'stable',
        seasonalFactors: ['Aumento esperado no final do ano'],
        criticalItems: predictions
          .filter(p => p.currentStock <= p.recommendedReorderPoint)
          .map(p => ({
            productId: p.productId,
            productName: p.product?.name || 'Produto não encontrado',
            currentStock: p.currentStock,
            recommendedReorder: p.recommendedReorderPoint,
            urgency: p.predictedStockoutDate ? 'high' : 'medium'
          }))
      }
    };
  }

  @Get('prediction/:productId')
  @ApiOperation({ summary: 'Obter previsão por ID do produto' })
  @ApiResponse({ status: 200, description: 'Previsão de inventário retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async getPredictionByProduct(@Param('productId') productId: string) {
    const predictions = await this.inventoryAIService.getAllPredictions();
    const prediction = predictions.find(p => p.productId === productId);
    
    if (!prediction) {
      // Gerar nova previsão se não existir
      return await this.inventoryAIService.generateInventoryPrediction(productId);
    }
    
    return prediction;
  }

  private generateInventoryRecommendations(predictions: InventoryPrediction[]): string[] {
    const recommendations: string[] = [];
    
    const lowStockCount = predictions.filter(p => 
      p.currentStock <= p.recommendedReorderPoint
    ).length;
    
    const urgentStockout = predictions.filter(p => 
      p.predictedStockoutDate && 
      new Date(p.predictedStockoutDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    ).length;
    
    if (urgentStockout > 0) {
      recommendations.push(`${urgentStockout} produto(s) com risco de ruptura em 3 dias`);
      recommendations.push('Priorizar pedidos de reposição urgentes');
    }
    
    if (lowStockCount > 0) {
      recommendations.push(`${lowStockCount} produto(s) abaixo do ponto de reposição`);
      recommendations.push('Revisar políticas de estoque mínimo');
    }
    
    if (predictions.length > 0) {
      const avgCost = predictions.reduce((sum, p) => 
        sum + (p.costAnalysis?.totalCost || 0), 0
      ) / predictions.length;
      
      if (avgCost > 100) {
        recommendations.push('Considerar otimização de custos de pedido');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Estoque em níveis adequados');
      recommendations.push('Manter monitoramento regular');
    }
    
    return recommendations;
  }
}