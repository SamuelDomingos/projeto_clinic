import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('questionnaire_categories')
export class QuestionnaireCategory {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, nullable: true })
  icon: string;

  @Column({ length: 20, nullable: true })
  color: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 