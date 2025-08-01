import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('business-intelligence')
@Controller('business-intelligence')
export class BusinessIntelligenceController {
  constructor(
    private readonly businessIntelligenceService: BusinessIntelligenceService,
  ) {}

  @Get('insights')
  @ApiOperation({ summary: 'Obtém os insights mais recentes' })
  @ApiResponse({ status: 200, description: 'Insights mais recentes.', schema: { type: 'array', items: { type: 'object' } } })
  async getLatestInsights() {
    return this.businessIntelligenceService.getLatestInsights();
  }

  @Get('kpi-analysis')
  @ApiOperation({ summary: 'Gera uma análise de KPI' })
  @ApiResponse({ status: 200, description: 'Análise de KPI gerada com sucesso.', schema: { type: 'object' } })
  async generateKPIAnalysis() {
    return this.businessIntelligenceService.generateKPIAnalysis();
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Detecta anomalias' })
  @ApiResponse({ status: 200, description: 'Anomalias detectadas com sucesso.', schema: { type: 'array', items: { type: 'object' } } })
  async detectAnomalies() {
    return this.businessIntelligenceService.detectAnomalies();
  }

  @Get('predictive-report')
  @ApiOperation({ summary: 'Gera um relatório preditivo' })
  @ApiResponse({ status: 200, description: 'Relatório preditivo gerado com sucesso.', schema: { type: 'object' } })
  async generatePredictiveReport() {
    return this.businessIntelligenceService.generatePredictiveReport();
  }

  @Get('insights/:id')
  @ApiOperation({ summary: 'Obtém um insight pelo ID' })
  @ApiResponse({ status: 200, description: 'Insight encontrado.', schema: { type: 'object' } })
  @ApiResponse({ status: 404, description: 'Insight não encontrado.' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID do insight (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  async getInsightById(@Param('id') id: string) {
    // Agora comparamos string com string (UUID)
    const insights = await this.businessIntelligenceService.getLatestInsights();
    return insights.find(insight => insight.id === id);
  }
}