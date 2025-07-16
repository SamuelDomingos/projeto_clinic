import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

@Entity('employee_responses')
export class EmployeeResponse {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  questionnaire_id: number;

  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;

  @Column({ length: 100, nullable: true })
  employee_id: string;

  @Column({ type: 'json' })
  responses: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submitted_at: Date;
} 