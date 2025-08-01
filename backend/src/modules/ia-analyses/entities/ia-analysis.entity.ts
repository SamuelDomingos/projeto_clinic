import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ia_analyses')
export class IAAnalysis {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: true })
  questionnaire_id: number;

  @Column({ type: 'json' })
  responses_snapshot: any;

  @Column({ type: 'json' })
  ia_statistics: any;

  @Column({ type: 'text' })
  ia_diagnostic: string;

  @Column({ type: 'json', nullable: true })
  ia_action_plan: any;

  @Column({ nullable: true })
  chat_history_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
} 