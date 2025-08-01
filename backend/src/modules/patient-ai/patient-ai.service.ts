import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientAnalysis } from './entities/patient-analysis.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { AttendanceSchedule } from '../attendance-schedules/entities/attendance-schedule.entity';
import { conversarComIA } from '../../services/groq.service';

@Injectable()
export class PatientAIService {
  constructor(
    @InjectRepository(PatientAnalysis)
    private patientAnalysisRepository: Repository<PatientAnalysis>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Protocol)
    private protocolRepository: Repository<Protocol>,
    @InjectRepository(AttendanceSchedule)
    private attendanceScheduleRepository: Repository<AttendanceSchedule>,
  ) {}

  async analyzeTreatmentSuccess(patientId: string, protocolId: string): Promise<PatientAnalysis> {
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    const protocol = await this.protocolRepository.findOne({ where: { id: protocolId } });
    
    if (!patient || !protocol) {
      throw new Error('Patient or Protocol not found');
    }

    const riskFactors = await this.identifyRiskFactors(patient);
    const successProbability = await this.calculateSuccessProbability(patient, protocol, riskFactors);
    const adherenceScore = await this.predictAdherence(patient);
    const recommendations = await this.generatePersonalizedRecommendations(patient, protocol, riskFactors);
    const treatmentHistory = await this.getTreatmentHistory(patientId);
    const progressMetrics = await this.calculateProgressMetrics(patientId);

    const analysis = this.patientAnalysisRepository.create({
      patientId,
      patient,
      analysisType: 'treatment_progress',
      treatmentHistory,
      adherenceScore,
      progressMetrics,
      riskFactors,
      recommendations,
      successProbability
    });

    return await this.patientAnalysisRepository.save(analysis);
  }

  async getPatientAnalyses(patientId: string): Promise<PatientAnalysis[]> {
    return await this.patientAnalysisRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient'],
      order: { createdAt: 'DESC' }
    });
  }

  private async identifyRiskFactors(patient: any): Promise<string[]> {
    const riskFactors: string[] = [];
    
    // Análise de idade
    const age = this.calculateAge(patient.birthDate);
    if (age > 65) riskFactors.push('Idade avançada');
    if (age < 18) riskFactors.push('Paciente pediátrico');
    
    // Análise de histórico
    const attendanceHistory = await this.getAttendanceHistory(patient.id);
    const noShowRate = this.calculateNoShowRate(attendanceHistory);
    if (noShowRate > 0.3) riskFactors.push('Alto índice de faltas');
    
    // Outros fatores simulados
    if (Math.random() > 0.7) riskFactors.push('Comorbidades identificadas');
    if (Math.random() > 0.8) riskFactors.push('Baixa aderência histórica');
    
    return riskFactors;
  }

  private async calculateSuccessProbability(patient: any, protocol: any, riskFactors: string[]): Promise<number> {
    let baseProbability = 0.75; // 75% base
    
    // Reduzir probabilidade baseado em fatores de risco
    const riskReduction = riskFactors.length * 0.1;
    baseProbability -= riskReduction;
    
    // Ajustar baseado no protocolo (simulação)
    if (Math.random() > 0.7) baseProbability -= 0.15; // protocolo difícil
    if (Math.random() > 0.3) baseProbability += 0.1; // protocolo fácil
    
    return Math.max(0.1, Math.min(0.95, baseProbability));
  }

  private async predictAdherence(patient: any): Promise<number> {
    const attendanceHistory = await this.getAttendanceHistory(patient.id);
    const attendanceRate = this.calculateAttendanceRate(attendanceHistory);
    
    // Simular aderência baseada no histórico
    return Math.max(0.1, Math.min(0.95, attendanceRate * 0.9 + 0.1));
  }

  async generatePersonalizedRecommendations(patient: any, protocol: any, riskFactors: string[]): Promise<string[]> {
    const prompt = `
      Paciente:
      - Idade: ${patient.age || 'N/A'}
      - Histórico: ${JSON.stringify(patient.medicalHistory || {})}
      
      Protocolo de Tratamento:
      ${JSON.stringify(protocol)}
      
      Fatores de Risco Identificados:
      ${riskFactors.join(', ')}
      
      Gere recomendações personalizadas para este paciente, considerando:
      1. Seu perfil específico
      2. Os fatores de risco
      3. O protocolo de tratamento
      
      Forneça recomendações práticas e específicas.
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      if (response.success) {
        return response.content.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
      }
    } catch (error) {
      console.error('Erro ao gerar recomendações com IA:', error);
    }
    
    // Fallback
    return ['Seguir protocolo padrão', 'Monitorar evolução', 'Agendar retorno'];
  }

  async generateTreatmentPlan(patient: any, diagnosis: string): Promise<string> {
    const prompt = `
      Crie um plano de tratamento detalhado para:
      
      Paciente: ${JSON.stringify(patient)}
      Diagnóstico: ${diagnosis}
      
      O plano deve incluir:
      1. Objetivos do tratamento
      2. Etapas do tratamento
      3. Cronograma sugerido
      4. Cuidados especiais
      5. Indicadores de progresso
    `;
    
    try {
      const response = await conversarComIA([
        { role: 'user', content: prompt }
      ]);
      
      return response.success ? response.content : 'Plano de tratamento padrão aplicável.';
    } catch (error) {
      return 'Erro ao gerar plano de tratamento.';
    }
  }

  private async getTreatmentHistory(patientId: string): Promise<any> {
    const schedules = await this.attendanceScheduleRepository.find({
      where: { patient: { id: patientId } },
      order: { date: 'DESC' },
      take: 20
    });
    
    return {
      totalSessions: schedules.length,
      completedSessions: schedules.filter(s => !s.isBlocked && s.observation !== 'No-show' && s.observation !== 'Cancelado').length,
      cancelledSessions: schedules.filter(s => s.observation === 'Cancelado').length,
      noShowSessions: schedules.filter(s => s.observation === 'No-show').length
    };
  }

  private async getAttendanceHistory(patientId: string): Promise<any[]> {
    return await this.attendanceScheduleRepository.find({
      where: { patient: { id: patientId } },
      order: { date: 'DESC' },
      take: 20
    });
  }

  private calculateNoShowRate(history: any[]): number {
    if (history.length === 0) return 0;
    
    const noShows = history.filter(h => h.observation === 'No-show').length;
    return (noShows / history.length) * 100;
  }

  private calculateAttendanceRate(history: any[]): number {
    if (history.length === 0) return 100;
    
    const attended = history.filter(h => !h.isBlocked && h.observation !== 'No-show' && h.observation !== 'Cancelado').length;
    return (attended / history.length) * 100;
  }

  private async getPatientScheduleHistory(patientId: string): Promise<any[]> {
    const schedules = await this.attendanceScheduleRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'professional'],
      order: { date: 'DESC' },
      take: 50
    });

    return schedules.map(schedule => ({
      id: schedule.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      attendanceType: schedule.attendanceType,
      isBlocked: schedule.isBlocked,
      observation: schedule.observation
    }));
  }

  private calculateAdherenceMetrics(schedules: any[]): any {
    const totalScheduled = schedules.length;
    // Usar isBlocked e observation para determinar status das sessões
    const completedSessions = schedules.filter(s => !s.isBlocked && s.observation !== 'No-show' && s.observation !== 'Cancelado').length;
    const cancelledSessions = schedules.filter(s => s.observation === 'Cancelado').length;
    const noShowSessions = schedules.filter(s => s.observation === 'No-show').length;
    
    return {
      totalSessions: totalScheduled,
      completedSessions: completedSessions,
      cancelledSessions: cancelledSessions,
      noShowSessions: noShowSessions,
      adherenceRate: totalScheduled > 0 ? (completedSessions / totalScheduled) * 100 : 0
    };
  }

  private async getPatientTreatmentHistory(patientId: string): Promise<any[]> {
    const schedules = await this.attendanceScheduleRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'professional', 'patientProtocol'],
      order: { date: 'DESC' },
      take: 100
    });

    return schedules.map(schedule => ({
      id: schedule.id,
      date: schedule.date,
      attendanceType: schedule.attendanceType,
      professional: schedule.professional,
      protocol: schedule.patientProtocol,
      observation: schedule.observation,
      isBlocked: schedule.isBlocked
    }));
  }

  private async calculateProgressMetrics(patientId: string): Promise<any> {
    // Simulação de métricas de progresso baseadas no histórico do paciente
    const attendanceHistory = await this.getAttendanceHistory(patientId);
    const attendanceRate = this.calculateAttendanceRate(attendanceHistory);
    const noShowRate = this.calculateNoShowRate(attendanceHistory);
    
    return {
      improvementRate: Math.max(0, 100 - noShowRate), // Melhoria baseada na redução de faltas
      adherenceRate: attendanceRate,
      consistencyScore: attendanceHistory.length > 0 ? Math.random() * 100 : 0,
      progressTrend: attendanceRate > 80 ? 'positive' : attendanceRate > 60 ? 'stable' : 'negative'
    };
  }

  private calculateAge(birthDate: Date): number {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}