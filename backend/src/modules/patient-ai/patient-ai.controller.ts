import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PatientAIService } from './patient-ai.service';
import { PatientAnalysis } from './entities/patient-analysis.entity';

@ApiTags('patient-ai')
@Controller('patient-ai')
export class PatientAIController {
  constructor(
    private readonly patientAIService: PatientAIService,
  ) {}

  @Get('analyses/:patientId')
  @ApiOperation({ summary: 'Get analyses for a patient by ID' })
  @ApiResponse({ status: 200, description: 'List of patient analyses.' })
  async getPatientAnalyses(@Param('patientId') patientId: string): Promise<PatientAnalysis[]> {
    return await this.patientAIService.getPatientAnalyses(patientId);
  }

  @Post('analyze-treatment')
  @ApiOperation({ summary: 'Analyze treatment success for a patient' })
  @ApiResponse({ status: 201, description: 'Treatment analysis created.' })
  async analyzeTreatmentSuccess(
    @Body() params: { patientId: string; protocolId: string }
  ): Promise<PatientAnalysis> {
    return await this.patientAIService.analyzeTreatmentSuccess(params.patientId, params.protocolId);
  }

  @Post('batch-analyze')
  @ApiOperation({ summary: 'Batch analyze treatments for multiple patients' })
  @ApiResponse({ status: 201, description: 'Batch treatment analyses created.' })
  async batchAnalyzeTreatments(
    @Body() params: { analyses: Array<{ patientId: string; protocolId: string }> }
  ): Promise<PatientAnalysis[]> {
    const results: PatientAnalysis[] = [];
    
    for (const analysis of params.analyses) {
      try {
        const result = await this.patientAIService.analyzeTreatmentSuccess(
          analysis.patientId, 
          analysis.protocolId
        );
        results.push(result);
      } catch (error) {
        console.error(`Erro ao analisar paciente ${analysis.patientId}:`, error);
      }
    }
    
    return results;
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics summary for patient treatments' })
  @ApiResponse({ status: 200, description: 'Analytics summary data.' })
  async getPatientAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('riskLevel') riskLevel?: string
  ) {
    // Implementation remains unchanged
    const allAnalyses = await this.patientAIService.getPatientAnalyses('');
    const totalAnalyses = allAnalyses.length;
    const highRiskPatients = allAnalyses.filter(a => 
      a.successProbability < 0.5
    ).length;
    const lowAdherencePatients = allAnalyses.filter(a => 
      a.adherenceScore < 0.6
    ).length;
    const avgSuccessProbability = allAnalyses.reduce((sum, a) => 
      sum + a.successProbability, 0
    ) / Math.max(totalAnalyses, 1);
    const avgAdherenceScore = allAnalyses.reduce((sum, a) => 
      sum + a.adherenceScore, 0
    ) / Math.max(totalAnalyses, 1);
    const commonRiskFactors = this.getCommonRiskFactors(allAnalyses);
    return {
      summary: {
        totalAnalyses,
        highRiskPatients,
        lowAdherencePatients,
        avgSuccessProbability: Math.round(avgSuccessProbability * 100) / 100,
        avgAdherenceScore: Math.round(avgAdherenceScore * 100) / 100,
        riskDistribution: {
          low: allAnalyses.filter(a => a.successProbability >= 0.7).length,
          medium: allAnalyses.filter(a => a.successProbability >= 0.5 && a.successProbability < 0.7).length,
          high: allAnalyses.filter(a => a.successProbability < 0.5).length
        }
      },
      insights: {
        commonRiskFactors,
        recommendations: this.generateGlobalRecommendations(allAnalyses),
        trends: {
          adherenceTrend: 'stable',
          successTrend: 'improving',
          criticalPatients: allAnalyses
            .filter(a => a.successProbability < 0.4 || a.adherenceScore < 0.5)
            .map(a => ({
              patientId: a.patientId,
              patientName: a.patient?.name || 'Nome não disponível',
              successProbability: a.successProbability,
              adherenceScore: a.adherenceScore,
              riskFactors: a.riskFactors,
              urgency: a.successProbability < 0.3 ? 'critical' : 'high'
            }))
        }
      }
    };
  }

  @Get('patient-risk/:patientId')
  @ApiOperation({ summary: 'Get risk assessment for a patient' })
  @ApiResponse({ status: 200, description: 'Patient risk assessment data.' })
  async getPatientRiskAssessment(@Param('patientId') patientId: string) {
    const analyses = await this.patientAIService.getPatientAnalyses(patientId);
    if (analyses.length === 0) {
      return {
        patientId,
        message: 'Nenhuma análise encontrada para este paciente',
        recommendation: 'Realizar análise inicial de tratamento'
      };
    }
    const latestAnalysis = analyses[0];
    return {
      patientId,
      currentRisk: this.calculateRiskLevel(latestAnalysis.successProbability),
      successProbability: latestAnalysis.successProbability,
      adherenceScore: latestAnalysis.adherenceScore,
      riskFactors: latestAnalysis.riskFactors,
      recommendations: latestAnalysis.recommendations,
      analysisHistory: analyses.map(a => ({
        date: a.createdAt,
        successProbability: a.successProbability,
        adherenceScore: a.adherenceScore,
        analysisType: a.analysisType
      })),
      trends: {
        successTrend: this.calculateTrend(analyses.map(a => a.successProbability)),
        adherenceTrend: this.calculateTrend(analyses.map(a => a.adherenceScore))
      }
    };
  }

  @Get('recommendations/:patientId')
  @ApiOperation({ summary: 'Get personalized recommendations for a patient' })
  @ApiResponse({ status: 200, description: 'Personalized recommendations data.' })
  async getPersonalizedRecommendations(@Param('patientId') patientId: string) {
    const analyses = await this.patientAIService.getPatientAnalyses(patientId);
    if (analyses.length === 0) {
      return {
        patientId,
        recommendations: ['Realizar análise inicial de tratamento'],
        priority: 'medium'
      };
    }
    const latestAnalysis = analyses[0];
    const priority = latestAnalysis.successProbability < 0.5 ? 'high' : 
                    latestAnalysis.successProbability < 0.7 ? 'medium' : 'low';
    return {
      patientId,
      recommendations: latestAnalysis.recommendations,
      priority,
      riskFactors: latestAnalysis.riskFactors,
      actionItems: this.generateActionItems(latestAnalysis),
      followUpSchedule: this.suggestFollowUpSchedule(latestAnalysis)
    };
  }

  private getCommonRiskFactors(analyses: PatientAnalysis[]): Array<{ factor: string; frequency: number }> {
    const factorCount: { [key: string]: number } = {};
    
    analyses.forEach(analysis => {
      analysis.riskFactors.forEach(factor => {
        factorCount[factor] = (factorCount[factor] || 0) + 1;
      });
    });
    
    return Object.entries(factorCount)
      .map(([factor, frequency]) => ({ factor, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  private generateGlobalRecommendations(analyses: PatientAnalysis[]): string[] {
    const recommendations: string[] = [];
    
    const highRiskCount = analyses.filter(a => a.successProbability < 0.5).length;
    const lowAdherenceCount = analyses.filter(a => a.adherenceScore < 0.6).length;
    
    if (highRiskCount > analyses.length * 0.3) {
      recommendations.push('Implementar programa de monitoramento intensivo');
      recommendations.push('Revisar protocolos de tratamento atuais');
    }
    
    if (lowAdherenceCount > analyses.length * 0.4) {
      recommendations.push('Desenvolver estratégias de engajamento do paciente');
      recommendations.push('Implementar sistema de lembretes automatizados');
    }
    
    recommendations.push('Manter acompanhamento regular dos indicadores');
    recommendations.push('Capacitar equipe em identificação precoce de riscos');
    
    return recommendations;
  }

  private calculateRiskLevel(successProbability: number): string {
    if (successProbability >= 0.7) return 'low';
    if (successProbability >= 0.5) return 'medium';
    return 'high';
  }

  private calculateTrend(values: number[]): string {
    if (values.length < 2) return 'insufficient_data';
    
    const recent = values.slice(0, Math.min(3, values.length));
    const older = values.slice(Math.min(3, values.length));
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  private generateActionItems(analysis: PatientAnalysis): string[] {
    const actionItems: string[] = [];
    
    if (analysis.successProbability < 0.5) {
      actionItems.push('Agendar consulta de reavaliação urgente');
      actionItems.push('Revisar plano de tratamento atual');
    }
    
    if (analysis.adherenceScore < 0.6) {
      actionItems.push('Implementar estratégias de melhoria da aderência');
      actionItems.push('Agendar sessão de educação do paciente');
    }
    
    if (analysis.riskFactors.includes('Alto índice de faltas')) {
      actionItems.push('Configurar lembretes automáticos');
      actionItems.push('Considerar teleconsulta como alternativa');
    }
    
    return actionItems;
  }

  private suggestFollowUpSchedule(analysis: PatientAnalysis): string {
    if (analysis.successProbability < 0.4) return '1 semana';
    if (analysis.successProbability < 0.6) return '2 semanas';
    if (analysis.successProbability < 0.8) return '1 mês';
    return '3 meses';
  }
}