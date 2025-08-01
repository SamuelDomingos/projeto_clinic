import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FinancialAIService } from './financial-ai.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('financial-ai')
@Controller('financial-ai')
export class FinancialAIController {
  constructor(
    private readonly financialAIService: FinancialAIService,
  ) {}

  @Get('latest-analysis')
  @ApiOperation({ summary: 'Obtém a análise financeira mais recente' })
  @ApiResponse({ status: 200, description: 'Análise financeira mais recente.' })
  async getLatestAnalysis() {
    return this.financialAIService.getLatestAnalysis();
  }

  @Get('cash-flow-prediction')
  @ApiOperation({ summary: 'Gera uma previsão de fluxo de caixa' })
  @ApiResponse({ status: 200, description: 'Previsão de fluxo de caixa gerada com sucesso.' })
  async getCashFlowPrediction(
    @Query('months') months: number = 6,
  ) {
    return this.financialAIService.generateCashFlowPrediction(+months);
  }

  @Get('revenue-prediction')
  @ApiOperation({ summary: 'Prevê a receita com base no período' })
  @ApiResponse({ status: 200, description: 'Previsão de receita gerada com sucesso.' })
  async getRevenuePrediction(
    @Query('period') period: string = 'monthly',
  ) {
    return this.financialAIService.predictRevenue(period);
  }

  @Get('expense-optimization')
  @ApiOperation({ summary: 'Otimiza as despesas' })
  @ApiResponse({ status: 200, description: 'Otimização de despesas realizada com sucesso.' })
  async getExpenseOptimization() {
    return this.financialAIService.optimizeExpenses();
  }
}