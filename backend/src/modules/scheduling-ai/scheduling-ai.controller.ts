import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SchedulingAIService } from './scheduling-ai.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Scheduling AI')
@Controller('scheduling-ai')
export class SchedulingAIController {
  constructor(
    private readonly schedulingAIService: SchedulingAIService,
  ) {}

  @Get('optimization-summary')
  @ApiOperation({ summary: 'Resumo da otimização de agendamento' })
  @ApiResponse({ status: 200, description: 'Resumo retornado com sucesso.' })
  async getOptimizationSummary() {
    return this.schedulingAIService.getOptimizationSummary();
  }

  @Post('predict-no-show')
  @ApiOperation({ summary: 'Prediz ausência de paciente em consulta' })
  @ApiResponse({ status: 201, description: 'Probabilidade de falta retornada.' })
  async predictNoShow(
    @Body() params: { patientId: string; appointmentDate: string }
  ) {
    const date = new Date(params.appointmentDate);
    const probability = await this.schedulingAIService.predictNoShow(params.patientId, date);
    
    return {
      patientId: params.patientId,
      appointmentDate: params.appointmentDate,
      noShowProbability: probability,
      riskLevel: probability > 0.5 ? 'high' : probability > 0.3 ? 'medium' : 'low',
      recommendations: this.generateNoShowRecommendations(probability)
    };
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Otimiza agenda para uma data' })
  @ApiResponse({ status: 201, description: 'Agenda otimizada.' })
  async optimizeSchedule(
    @Body() params: { date: string }
  ) {
    const date = new Date(params.date);
    return this.schedulingAIService.optimizeSchedule(date);
  }

  @Get('optimization/:id')
  @ApiOperation({ summary: 'Busca otimização por ID' })
  @ApiResponse({ status: 200, description: 'Otimização encontrada.' })
  async getOptimizationById(@Param('id') id: string) {
    // Método para buscar otimização específica por ID
    // Você pode implementar este método no serviço se necessário
    return { message: 'Método para buscar otimização por ID - implementar no serviço se necessário' };
  }

  @Post('batch-predict-no-show')
  @ApiOperation({ summary: 'Prediz ausência em lote' })
  @ApiResponse({ status: 201, description: 'Resultados de predição em lote.' })
  async batchPredictNoShow(
    @Body() params: { predictions: Array<{ patientId: string; appointmentDate: string }> }
  ) {
    const results = await Promise.all(
      params.predictions.map(async (prediction) => {
        const date = new Date(prediction.appointmentDate);
        const probability = await this.schedulingAIService.predictNoShow(prediction.patientId, date);
        
        return {
          patientId: prediction.patientId,
          appointmentDate: prediction.appointmentDate,
          noShowProbability: probability,
          riskLevel: probability > 0.5 ? 'high' : probability > 0.3 ? 'medium' : 'low'
        };
      })
    );
    
    return {
      predictions: results,
      summary: {
        total: results.length,
        highRisk: results.filter(r => r.riskLevel === 'high').length,
        mediumRisk: results.filter(r => r.riskLevel === 'medium').length,
        lowRisk: results.filter(r => r.riskLevel === 'low').length
      }
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Analytics de agendamento' })
  @ApiResponse({ status: 200, description: 'Analytics retornado.' })
  async getSchedulingAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const summary = await this.schedulingAIService.getOptimizationSummary();
    
    return {
      period: {
        startDate: startDate || 'last-30-days',
        endDate: endDate || 'today'
      },
      metrics: {
        resourceUtilization: summary.resourceUtilization,
        expectedWaitTime: summary.expectedWaitTime,
        recommendations: summary.recommendations
      },
      insights: [
        'Análise de padrões de agendamento',
        'Identificação de horários de pico',
        'Sugestões de otimização de recursos'
      ]
    };
  }

  private generateNoShowRecommendations(probability: number): string[] {
    const recommendations: string[] = [];
    
    if (probability > 0.5) {
      recommendations.push('Confirmar agendamento 24h antes');
      recommendations.push('Enviar lembrete por SMS/WhatsApp');
      recommendations.push('Considerar overbooking controlado');
    } else if (probability > 0.3) {
      recommendations.push('Enviar lembrete no dia anterior');
      recommendations.push('Confirmar por telefone');
    } else {
      recommendations.push('Paciente com baixo risco de falta');
      recommendations.push('Lembrete padrão é suficiente');
    }
    
    return recommendations;
  }
}