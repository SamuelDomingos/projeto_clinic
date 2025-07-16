import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'text_free'
  | 'star_rating'
  | 'numeric';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  questionnaire_id: number;

  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;

  @Column({ type: 'text' })
  question_text: string;

  @Column({
    type: 'enum',
    enum: ['single_choice', 'multiple_choice', 'text_free', 'star_rating', 'numeric'],
  })
  question_type: QuestionType;

  @Column({ type: 'json', nullable: true })
  options: any;

  @Column({ type: 'varchar', nullable: true })
  placeholder: string;

  @Column({ type: 'int', nullable: true })
  min_value: number;

  @Column({ type: 'int', nullable: true })
  max_value: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  weight: number;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 