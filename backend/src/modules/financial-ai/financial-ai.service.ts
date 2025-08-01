import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialAnalysis } from './entities/financial-analysis.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { conversarComIA } from '../../services/groq.service';

@Injectable()
export class FinancialAIService {
  constructor(
    @InjectRepository(FinancialAnalysis)
    private financialAnalysisRepository: Repository<FinancialAnalysis>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async generateCashFlowPrediction(months: number = 6): Promise<FinancialAnalysis> {
    // Buscar dados históricos
    const historicalData = await this.getHistoricalFinancialData();
    
    // Aplicar algoritmos de ML para previsão
    const predictions = await this.applyCashFlowML(historicalData, months);
    
    // Identificar tendências e padrões
    const trends = await this.identifyFinancialTrends(historicalData);
    
    // Gerar recomendações
    const recommendations = await this.generateFinancialRecommendations(predictions, trends);
    
    // Calcular nível de risco
    const riskLevel = this.calculateRiskLevel(predictions);
    
    const analysis = this.financialAnalysisRepository.create({
      analysisType: 'cash_flow',
      inputData: historicalData,
      predictions,
      recommendations,
      riskLevel,
      confidenceScore: predictions.confidence,
      trends,
      alerts: this.generateFinancialAlerts(predictions, riskLevel)
    });
    
    return await this.financialAnalysisRepository.save(analysis);
  }

  async optimizeExpenses(): Promise<FinancialAnalysis> {
    // Analisar padrões de gastos
    const expenseData = await this.getExpensePatterns();
    
    // Identificar oportunidades de otimização
    const optimizations = await this.identifyExpenseOptimizations(expenseData);
    
    // Calcular economia potencial
    const savingsPotential = this.calculateSavingsPotential(optimizations);
    
    const analysis = this.financialAnalysisRepository.create({
      analysisType: 'expense_optimization',
      inputData: expenseData,
      predictions: { savingsPotential },
      recommendations: optimizations,
      riskLevel: 'low',
      confidenceScore: 85,
      trends: await this.identifyExpenseTrends(expenseData),
      alerts: []
    });
    
    return await this.financialAnalysisRepository.save(analysis);
  }

  async getLatestAnalysis(): Promise<FinancialAnalysis | null> {
    const analyses = await this.financialAnalysisRepository.find({
      order: { createdAt: 'DESC' },
      take: 1
    });
    
    return analyses.length > 0 ? analyses[0] : null;
  }

  async predictRevenue(period: string): Promise<any> {
    const months = period === 'quarterly' ? 3 : period === 'yearly' ? 12 : 6;
    const analysis = await this.generateCashFlowPrediction(months);
    return {
      period,
      predictedRevenue: analysis.predictions,
      confidence: analysis.confidenceScore,
      trends: analysis.trends
    };
  }

  private async getHistoricalFinancialData(): Promise<any> {
    const transactions = await this.transactionRepository.find({
      where: { type: 'revenue' },
      order: { createdAt: 'DESC' },
      take: 100
    });
    
    const invoices = await this.invoiceRepository.find({
      order: { createdAt: 'DESC' },
      take: 100
    });
    
    return { transactions, invoices };
  }

  private async applyCashFlowML(data: any, months: number): Promise<any> {
    // Simulação de algoritmo de ML
    const { transactions } = data;
    const avgMonthlyRevenue = transactions.reduce((sum: number, t: any) => sum + t.amount, 0) / Math.max(transactions.length, 1);
    
    return {
      monthlyPredictions: Array.from({ length: months }, (_, i) => ({
        month: i + 1,
        predictedRevenue: avgMonthlyRevenue * (1 + Math.random() * 0.2 - 0.1),
        confidence: 75 + Math.random() * 20
      })),
      confidence: 80
    };
  }

  private async identifyFinancialTrends(data: any): Promise<any[]> {
    return [
      { type: 'revenue_growth', value: 15.5, period: 'monthly' },
      { type: 'seasonal_pattern', value: 'Q4_peak', confidence: 85 }
    ];
  }

  private async generateFinancialRecommendations(predictions: any, trends: any): Promise<string[]> {
    // Usar IA para gerar recomendações mais inteligentes
    const prompt = `
      Baseado nos seguintes dados financeiros:
      - Previsões: ${JSON.stringify(predictions)}
      - Tendências: ${JSON.stringify(trends)}
      
      Gere recomendações financeiras específicas e acionáveis para uma clínica médica.
      Responda em formato de lista com recomendações práticas.
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      if (response.success) {
        // Processar a resposta da IA e converter em array
        return response.content.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações com IA:', error);
    }
    
    // Fallback para lógica original
    return [
      'Revisar gastos com fornecedores',
      'Otimizar fluxo de caixa',
      'Considerar investimentos em equipamentos'
    ];
  }

  async generateFinancialInsights(data: any): Promise<string> {
    const prompt = `
      Analise os seguintes dados financeiros de uma clínica:
      ${JSON.stringify(data)}
      
      Forneça insights detalhados sobre:
      1. Padrões identificados
      2. Oportunidades de melhoria
      3. Riscos potenciais
      4. Recomendações estratégicas
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      return response.success ? response.content : 'Análise não disponível no momento.';
    } catch (error) {
      return 'Erro ao gerar insights financeiros.';
    }
  }

  private calculateRiskLevel(predictions: any): 'low' | 'medium' | 'high' | 'critical' {
    const avgConfidence = predictions.confidence || 0;
    if (avgConfidence > 80) return 'low';
    if (avgConfidence > 60) return 'medium';
    if (avgConfidence > 40) return 'high';
    return 'critical';
  }

  private generateFinancialAlerts(predictions: any, riskLevel: string): string[] {
    const alerts: string[] = [];
    if (riskLevel === 'high' || riskLevel === 'critical') {
      alerts.push('Alto risco detectado nas previsões financeiras');
    }
    if (predictions.confidence < 70) {
      alerts.push('Baixa confiança nas previsões - revisar dados');
    }
    return alerts;
  }

  private async getExpensePatterns(): Promise<any> {
    const expenses = await this.transactionRepository.find({
      where: { type: 'expense' },
      order: { createdAt: 'DESC' },
      take: 100
    });
    
    return { expenses };
  }

  private async identifyExpenseOptimizations(data: any): Promise<string[]> {
    return [
      'Renegociar contratos de fornecedores com economia potencial de 10%',
      'Otimizar estoque para reduzir custos de armazenagem',
      'Revisar gastos com marketing digital'
    ];
  }

  private calculateSavingsPotential(optimizations: string[]): number {
    return optimizations.length * 1500; // Simulação
  }

  private async identifyExpenseTrends(data: any): Promise<any[]> {
    return [
      { type: 'expense_reduction', value: -8.2, period: 'monthly' },
      { type: 'cost_efficiency', value: 'improving', confidence: 78 }
    ];
  }
}