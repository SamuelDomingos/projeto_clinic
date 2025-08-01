import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type InsightType = 'performance_kpi' | 'trend_analysis' | 'comparative_analysis' | 'predictive_model';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

@Entity('bi_insights')
export class BIInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['performance_kpi', 'trend_analysis', 'comparative_analysis', 'predictive_model'] })
  insightType: InsightType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  data: any; // Dados do insight

  @Column({ type: 'json' })
  visualizations: any; // Configurações de visualização

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'urgent'] })
  priority: Priority;

  @Column({ type: 'json' })
  actionItems: any; // Itens de ação recomendados

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  impactScore: number; // Score de impacto (0-100)

  @CreateDateColumn()
  createdAt: Date;
}