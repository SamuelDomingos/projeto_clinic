import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export type AnalysisType = 'treatment_progress' | 'adherence_prediction' | 'outcome_forecast' | 'risk_assessment';

@Entity('patient_analyses')
export class PatientAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'enum', enum: ['treatment_progress', 'adherence_prediction', 'outcome_forecast', 'risk_assessment'] })
  analysisType: AnalysisType;

  @Column({ type: 'json' })
  treatmentHistory: any; // Histórico de tratamentos

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  adherenceScore: number; // Score de aderência (0-100)

  @Column({ type: 'json' })
  progressMetrics: any; // Métricas de progresso

  @Column({ type: 'json' })
  riskFactors: any; // Fatores de risco identificados

  @Column({ type: 'json' })
  recommendations: any; // Recomendações personalizadas

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  successProbability: number; // Probabilidade de sucesso do tratamento

  @CreateDateColumn()
  createdAt: Date;
}