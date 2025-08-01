import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FinancialAIService } from '../financial-ai/financial-ai.service';
import { SchedulingAIService } from '../scheduling-ai/scheduling-ai.service';
import { InventoryAIService } from '../inventory-ai/inventory-ai.service';
import { PatientAIService } from '../patient-ai/patient-ai.service';
import { BusinessIntelligenceService } from '../business-intelligence/business-intelligence.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Management AI')
@Controller('management-ai')
@UseGuards(AuthGuard)
export class ManagementAIController {
  constructor(
    private readonly financialAIService: FinancialAIService,
    private readonly schedulingAIService: SchedulingAIService,
    private readonly inventoryAIService: InventoryAIService,
    private readonly patientAIService: PatientAIService,
    private readonly businessIntelligenceService: BusinessIntelligenceService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter o painel de IA' })
  @ApiResponse({ status: 200, description: 'Painel de IA retornado com sucesso.' })
  async getAIDashboard() {
    const [financial, scheduling, inventory, insights] = await Promise.all([
      this.financialAIService.getLatestAnalysis(),
      this.schedulingAIService.getOptimizationSummary(),
      this.inventoryAIService.getAllPredictions(),
      this.businessIntelligenceService.getLatestInsights(),
    ]);

    return {
      financial,
      scheduling,
      inventory: inventory.slice(0, 5), // Top 5 predictions
      insights: insights.slice(0, 3), // Top 3 insights
      lastUpdated: new Date(),
    };
  }

  // Financial AI Endpoints
  @Post('financial/predict-revenue')
  @ApiOperation({ summary: 'Prever receita' })
  @ApiResponse({ status: 200, description: 'Previsão de receita gerada com sucesso.' })
  async predictRevenue(@Body() params: { period: string }) {
    return await this.financialAIService.predictRevenue(params.period);
  }

  @Post('financial/cash-flow')
  @ApiOperation({ summary: 'Gerar previsão de fluxo de caixa' })
  @ApiResponse({ status: 200, description: 'Previsão de fluxo de caixa gerada com sucesso.' })
  async generateCashFlowPrediction(@Body() params: { months?: number }) {
    return await this.financialAIService.generateCashFlowPrediction(params.months);
  }

  @Post('financial/optimize-expenses')
  @ApiOperation({ summary: 'Otimizar despesas' })
  @ApiResponse({ status: 200, description: 'Despesas otimizadas com sucesso.' })
  async optimizeExpenses() {
    return await this.financialAIService.optimizeExpenses();
  }

  // Scheduling AI Endpoints
  @Post('scheduling/predict-no-show')
  @ApiOperation({ summary: 'Prever não comparecimento' })
  @ApiResponse({ status: 200, description: 'Previsão de não comparecimento gerada com sucesso.' })
  async predictNoShow(@Body() params: { patientId: string; appointmentDate: string }) {
    const date = new Date(params.appointmentDate);
    return await this.schedulingAIService.predictNoShow(params.patientId, date);
  }

  @Post('scheduling/optimize')
  @ApiOperation({ summary: 'Otimizar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento otimizado com sucesso.' })
  async optimizeSchedule(@Body() params: { date: string }) {
    const date = new Date(params.date);
    return await this.schedulingAIService.optimizeSchedule(date);
  }

  // Inventory AI Endpoints
  @Post('inventory/predict')
  @ApiOperation({ summary: 'Gerar previsão de inventário' })
  @ApiResponse({ status: 200, description: 'Previsão de inventário gerada com sucesso.' })
  async generateInventoryPrediction(@Body() params: { productId: string }) {
    return await this.inventoryAIService.generateInventoryPrediction(params.productId);
  }

  @Get('inventory/predictions')
  @ApiOperation({ summary: 'Obter todas as previsões de inventário' })
  @ApiResponse({ status: 200, description: 'Previsões de inventário retornadas com sucesso.' })
  async getAllInventoryPredictions() {
    return await this.inventoryAIService.getAllPredictions();
  }

  // Patient AI Endpoints
  @Post('patient/analyze-treatment')
  @ApiOperation({ summary: 'Analisar sucesso do tratamento do paciente' })
  @ApiResponse({ status: 200, description: 'Análise de sucesso do tratamento gerada com sucesso.' })
  async analyzeTreatmentSuccess(@Body() params: { patientId: string; protocolId: string }) {
    return await this.patientAIService.analyzeTreatmentSuccess(params.patientId, params.protocolId);
  }

  @Get('patient/analyses')
  @ApiOperation({ summary: 'Obter análises do paciente' })
  @ApiResponse({ status: 200, description: 'Análises do paciente retornadas com sucesso.' })
  async getPatientAnalyses(@Query('patientId') patientId: string) {
    return await this.patientAIService.getPatientAnalyses(patientId);
  }

  // Business Intelligence Endpoints
  @Post('bi/generate-kpi')
  @ApiOperation({ summary: 'Gerar análise de KPI' })
  @ApiResponse({ status: 200, description: 'Análise de KPI gerada com sucesso.' })
  async generateKPIAnalysis() {
    return await this.businessIntelligenceService.generateKPIAnalysis();
  }

  @Post('bi/detect-anomalies')
  @ApiOperation({ summary: 'Detectar anomalias' })
  @ApiResponse({ status: 200, description: 'Anomalias detectadas com sucesso.' })
  async detectAnomalies() {
    return await this.businessIntelligenceService.detectAnomalies();
  }

  @Post('bi/predictive-report')
  @ApiOperation({ summary: 'Gerar relatório preditivo' })
  @ApiResponse({ status: 200, description: 'Relatório preditivo gerado com sucesso.' })
  async generatePredictiveReport() {
    return await this.businessIntelligenceService.generatePredictiveReport();
  }

  @Get('bi/insights')
  @ApiOperation({ summary: 'Obter os insights mais recentes' })
  @ApiResponse({ status: 200, description: 'Insights mais recentes retornados com sucesso.' })
  async getLatestInsights() {
    return await this.businessIntelligenceService.getLatestInsights();
  }
}