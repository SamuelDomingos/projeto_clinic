import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulingOptimization } from './entities/scheduling-optimization.entity';
import { AttendanceSchedule } from '../attendance-schedules/entities/attendance-schedule.entity';
import { Patient } from '../patients/entities/patient.entity';
import { conversarComIA } from '../../services/groq.service';

@Injectable()
export class SchedulingAIService {
  constructor(
    @InjectRepository(SchedulingOptimization)
    private schedulingOptimizationRepository: Repository<SchedulingOptimization>,
    @InjectRepository(AttendanceSchedule)
    private attendanceScheduleRepository: Repository<AttendanceSchedule>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async predictNoShow(patientId: string, appointmentDate: Date): Promise<number> {
    // Buscar histórico do paciente
    const patientHistory = await this.getPatientHistory(patientId);
    
    // Aplicar modelo de ML para prever no-show
    const noShowProbability = await this.applyNoShowML(patientHistory, appointmentDate);
    
    return noShowProbability;
  }

  async optimizeSchedule(date: Date): Promise<SchedulingOptimization> {
    // Buscar agendamentos do dia
    const currentSchedule = await this.getDaySchedule(date);
    
    // Aplicar algoritmos de otimização
    const optimizedSchedule = await this.applyScheduleOptimization(currentSchedule);
    
    // Calcular utilização de recursos
    const resourceUtilization = this.calculateResourceUtilization(optimizedSchedule);
    
    const optimization = this.schedulingOptimizationRepository.create({
      optimizationType: 'capacity',
      currentSchedule,
      optimizedSchedule,
      noShowProbability: 0,
      resourceUtilization,
      recommendations: this.generateSchedulingRecommendations(optimizedSchedule),
      expectedWaitTime: this.calculateExpectedWaitTime(optimizedSchedule)
    });
    
    return await this.schedulingOptimizationRepository.save(optimization);
  }

  async getOptimizationSummary(): Promise<any> {
    const latest = await this.schedulingOptimizationRepository.findOne({
      order: { createdAt: 'DESC' }
    });
    
    return {
      resourceUtilization: latest?.resourceUtilization || 0,
      expectedWaitTime: latest?.expectedWaitTime || 0,
      recommendations: latest?.recommendations || []
    };
  }

  private async getPatientHistory(patientId: string): Promise<any> {
    const schedules = await this.attendanceScheduleRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient'],
      order: { date: 'DESC' },
      take: 20
    });
    
    return { schedules, totalAppointments: schedules.length };
  }

  private async applyNoShowML(history: any, appointmentDate: Date): Promise<number> {
    // Simulação de algoritmo de ML
    const { schedules } = history;
    const noShows = schedules.filter((s: any) => s.observation === 'No-show').length;
    const totalAppointments = schedules.length;
    
    const baseRate = totalAppointments > 0 ? noShows / totalAppointments : 0.1;
    
    // Ajustar baseado no dia da semana
    const dayOfWeek = appointmentDate.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    
    return Math.min(baseRate * weekendMultiplier, 0.8);
  }

  private async getDaySchedule(date: Date): Promise<any> {
    const dateString = date.toISOString().split('T')[0];
    
    const schedules = await this.attendanceScheduleRepository.find({
      where: {
        date: dateString
      },
      relations: ['patient', 'professional']
    });

    return {
      schedules,
      totalSlots: schedules.length,
      availableSlots: schedules.filter(s => !s.isBlocked).length
    };
  }

  async generateSchedulingRecommendations(schedule: any): Promise<string[]> {
    const prompt = `
      Analise a agenda atual:
      ${JSON.stringify(schedule)}
      
      Gere recomendações para otimizar:
      1. Distribuição de horários
      2. Redução de tempo de espera
      3. Maximização da utilização
      4. Prevenção de no-shows
      5. Balanceamento de carga de trabalho
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      if (response.success) {
        return response.content.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações de agendamento:', error);
    }
    
    return ['Otimizar distribuição de horários', 'Reduzir intervalos', 'Implementar lembretes'];
  }

  async predictOptimalScheduling(patientData: any, preferences: any): Promise<any> {
    const prompt = `
      Baseado nos dados do paciente e preferências:
      
      Paciente: ${JSON.stringify(patientData)}
      Preferências: ${JSON.stringify(preferences)}
      
      Sugira:
      1. Melhor horário para agendamento
      2. Tipo de consulta recomendado
      3. Duração estimada
      4. Preparativos necessários
      
      Responda em JSON estruturado.
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      if (response.success) {
        try {
          return JSON.parse(response.content);
        } catch {
          return { suggestion: response.content };
        }
      }
    } catch (error) {
      console.error('Erro ao prever agendamento ótimo:', error);
    }
    
    return { error: 'Previsão não disponível' };
  }

  private async applyScheduleOptimization(currentSchedule: any): Promise<any> {
    // Algoritmo de otimização de agendamento
    const optimized = {
      ...currentSchedule,
      optimizedSlots: currentSchedule.schedules?.map((schedule: any) => ({
        ...schedule,
        optimizedTime: this.calculateOptimalTime(schedule),
        priority: this.calculatePriority(schedule)
      })) || []
    };
    
    return optimized;
  }

  private calculateResourceUtilization(schedule: any): number {
    if (!schedule.schedules || schedule.schedules.length === 0) {
      return 0;
    }
    
    const totalSlots = schedule.totalSlots || schedule.schedules.length;
    const occupiedSlots = schedule.schedules.filter((s: any) => !s.isBlocked).length;
    
    return totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
  }

  private calculateExpectedWaitTime(schedule: any): number {
    if (!schedule.schedules || schedule.schedules.length === 0) {
      return 0;
    }
    
    // Simular tempo de espera baseado na densidade de agendamentos
    const averageSessionTime = 30; // minutos
    const occupiedSlots = schedule.schedules.filter((s: any) => !s.isBlocked).length;
    const utilizationRate = this.calculateResourceUtilization(schedule) / 100;
    
    // Fórmula simplificada: maior utilização = maior tempo de espera
    return Math.round(averageSessionTime * utilizationRate * 0.3);
  }

  private calculateOptimalTime(schedule: any): string {
    // Lógica para calcular horário ótimo
    return schedule.time || '09:00';
  }

  private calculatePriority(schedule: any): number {
    // Lógica para calcular prioridade (1-5)
    if (schedule.observation?.includes('urgente')) return 5;
    if (schedule.observation?.includes('retorno')) return 3;
    return 2;
  }
}