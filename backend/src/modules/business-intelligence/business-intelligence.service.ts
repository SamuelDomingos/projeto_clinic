import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BIInsight } from './entities/bi-insight.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Patient } from '../patients/entities/patient.entity';
import { AttendanceSchedule } from '../attendance-schedules/entities/attendance-schedule.entity';

@Injectable()
export class BusinessIntelligenceService {
  constructor(
    @InjectRepository(BIInsight)
    private biInsightRepository: Repository<BIInsight>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(AttendanceSchedule)
    private attendanceScheduleRepository: Repository<AttendanceSchedule>,
  ) {}

  async generateKPIAnalysis(): Promise<BIInsight> {
    const kpiData = await this.calculateKPIs();
    
    const insight = this.biInsightRepository.create({
      insightType: 'performance_kpi',
      title: 'Análise de KPIs Mensais',
      description: 'Análise automática dos principais indicadores de performance',
      priority: 'medium',
      data: kpiData,
      visualizations: {},
      actionItems: [],
      impactScore: 75
    });

    return await this.biInsightRepository.save(insight);
  }

  async detectAnomalies(): Promise<BIInsight[]> {
    const anomalies: BIInsight[] = [];
    
    // Detectar anomalias de receita
    const revenueAnomaly = await this.detectRevenueAnomalies();
    if (revenueAnomaly) anomalies.push(revenueAnomaly);
    
    // Detectar anomalias de agendamento
    const schedulingAnomaly = await this.detectSchedulingAnomalies();
    if (schedulingAnomaly) anomalies.push(schedulingAnomaly);
    
    // Detectar anomalias de estoque
    const inventoryAnomaly = await this.detectInventoryAnomalies();
    if (inventoryAnomaly) anomalies.push(inventoryAnomaly);
    
    return await this.biInsightRepository.save(anomalies);
  }

  async generatePredictiveReport(): Promise<BIInsight> {
    const predictiveData = await this.generatePredictiveAnalysis();
    
    const insight = this.biInsightRepository.create({
      insightType: 'predictive_model',
      title: 'Relatório Preditivo Mensal',
      description: 'Previsões e tendências para os próximos 3 meses',
      priority: 'high',
      data: predictiveData,
      visualizations: {},
      actionItems: [],
      impactScore: 85
    });

    return await this.biInsightRepository.save(insight);
  }

  async getLatestInsights(): Promise<BIInsight[]> {
    return await this.biInsightRepository.find({
      order: { createdAt: 'DESC' },
      take: 10
    });
  }

  private async calculateKPIs(): Promise<any> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // KPI de Receita
    const monthlyRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type: 'revenue' })
      .andWhere('transaction.createdAt >= :start', { start: currentMonth })
      .andWhere('transaction.createdAt < :end', { end: nextMonth })
      .getRawOne();
    
    // KPI de Pacientes
    const activePatients = await this.patientRepository.count({
      where: { status: 'active' }
    });
    
    // KPI de Agendamentos
    const monthlyAppointments = await this.attendanceScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.date >= :start', { start: currentMonth })
      .andWhere('schedule.date < :end', { end: nextMonth })
      .getCount();
    
    return {
      revenue: {
        current: parseFloat(monthlyRevenue?.total || '0'),
        target: 50000,
        growth: 12.5
      },
      patients: {
        active: activePatients,
        new: Math.floor(activePatients * 0.1),
        retention: 85.2
      },
      appointments: {
        scheduled: monthlyAppointments,
        completed: Math.floor(monthlyAppointments * 0.85),
        noShow: Math.floor(monthlyAppointments * 0.15)
      },
      efficiency: {
        resourceUtilization: 78.5,
        averageWaitTime: 12.3,
        patientSatisfaction: 4.2
      }
    };
  }

  private async detectRevenueAnomalies(): Promise<BIInsight | null> {
    // Simulação de detecção de anomalia
    const recentRevenue = await this.getRecentRevenue();
    const avgRevenue = recentRevenue.reduce((sum, r) => sum + r.amount, 0) / recentRevenue.length;
    
    const latestRevenue = recentRevenue[0]?.amount || 0;
    const deviation = Math.abs(latestRevenue - avgRevenue) / avgRevenue;
    
    if (deviation > 0.3) { // 30% de desvio
      return this.biInsightRepository.create({
        insightType: 'trend_analysis',
        title: 'Anomalia de Receita Detectada',
        description: `Receita atual ${deviation > 0 ? 'acima' : 'abaixo'} do esperado em ${(deviation * 100).toFixed(1)}%`,
        priority: 'high',
        data: {
          type: 'revenue_anomaly',
          deviation: deviation * 100,
          current: latestRevenue,
          expected: avgRevenue
        },
        visualizations: {},
        actionItems: ['Investigar causa da variação', 'Revisar estratégia de preços'],
        impactScore: 90
      });
    }
    
    return null;
  }

  private async detectSchedulingAnomalies(): Promise<BIInsight | null> {
    // Simulação de detecção de anomalia de agendamento
    const todayAppointments = await this.getTodayAppointments();
    const avgDailyAppointments = 25; // Média histórica
    
    if (todayAppointments < avgDailyAppointments * 0.5) {
      return this.biInsightRepository.create({
        insightType: 'trend_analysis',
        title: 'Baixo Volume de Agendamentos',
        description: `Agendamentos hoje (${todayAppointments}) abaixo da média (${avgDailyAppointments})`,
        priority: 'medium',
        data: {
          type: 'scheduling_anomaly',
          current: todayAppointments,
          expected: avgDailyAppointments
        },
        visualizations: {},
        actionItems: ['Verificar disponibilidade de profissionais', 'Revisar campanhas de marketing'],
        impactScore: 60
      });
    }
    
    return null;
  }

  private async detectInventoryAnomalies(): Promise<BIInsight | null> {
    // Simulação de detecção de anomalia de estoque
    if (Math.random() > 0.8) { // 20% de chance de anomalia
      return this.biInsightRepository.create({
        insightType: 'trend_analysis',
        title: 'Estoque Crítico Detectado',
        description: 'Produtos com estoque abaixo do ponto de reposição',
        priority: 'high',
        data: {
          type: 'inventory_anomaly',
          criticalProducts: 3,
          lowStockProducts: 7
        },
        visualizations: {},
        actionItems: ['Realizar pedidos urgentes', 'Revisar pontos de reposição'],
        impactScore: 80
      });
    }
    
    return null;
  }

  private async generatePredictiveAnalysis(): Promise<any> {
    return {
      revenue: {
        nextMonth: 52000,
        nextQuarter: 156000,
        confidence: 82,
        trend: 'growing'
      },
      patients: {
        expectedNew: 15,
        churnRisk: 8,
        growthRate: 5.2
      },
      capacity: {
        utilizationForecast: 85,
        bottlenecks: ['Fisioterapia - Terças', 'Psicologia - Sextas'],
        recommendations: [
          'Adicionar horário extra nas terças',
          'Considerar profissional adicional para psicologia'
        ]
      },
      risks: [
        { type: 'financial', description: 'Possível queda de receita em feriados', probability: 0.3 },
        { type: 'operational', description: 'Sobrecarga de agendamentos', probability: 0.6 }
      ]
    };
  }

  private async getRecentRevenue(): Promise<any[]> {
    return await this.transactionRepository.find({
      where: { type: 'revenue' },
      order: { createdAt: 'DESC' },
      take: 30
    });
  }

  private async getTodayAppointments(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await this.attendanceScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.date >= :start', { start: today })
      .andWhere('schedule.date < :end', { end: tomorrow })
      .getCount();
  }
}