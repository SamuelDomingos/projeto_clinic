import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type OptimizationType = 'capacity' | 'no_show_prediction' | 'resource_allocation' | 'waiting_time';

@Entity('scheduling_optimizations')
export class SchedulingOptimization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['capacity', 'no_show_prediction', 'resource_allocation', 'waiting_time'] })
  optimizationType: OptimizationType;

  @Column({ type: 'json' })
  currentSchedule: any; // Agendamentos atuais

  @Column({ type: 'json' })
  optimizedSchedule: any; // Sugestão otimizada

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  noShowProbability: number; // Probabilidade de falta

  @Column({ type: 'json' })
  resourceUtilization: any; // Utilização de recursos

  @Column({ type: 'json' })
  recommendations: any; // Recomendações de melhoria

  @Column({ type: 'int' })
  expectedWaitTime: number; // Tempo de espera previsto

  @CreateDateColumn()
  createdAt: Date;
}