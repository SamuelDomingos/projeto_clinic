import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type AnalysisType = 'cash_flow' | 'revenue_prediction' | 'expense_optimization' | 'profitability';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

@Entity('financial_analyses')
export class FinancialAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['cash_flow', 'revenue_prediction', 'expense_optimization', 'profitability'] })
  analysisType: AnalysisType;

  @Column({ type: 'json' })
  inputData: any; // Dados das transações, faturas, etc.

  @Column({ type: 'json' })
  predictions: any; // Previsões de receita, fluxo de caixa

  @Column({ type: 'json' })
  recommendations: any; // Recomendações de otimização

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'critical'] })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  confidenceScore: number; // 0-100%

  @Column({ type: 'json' })
  trends: any; // Tendências identificadas

  @Column({ type: 'json' })
  alerts: any; // Alertas automáticos

  @CreateDateColumn()
  createdAt: Date;
}