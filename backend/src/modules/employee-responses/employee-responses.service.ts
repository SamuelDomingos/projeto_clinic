import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeResponse } from './entities/employee-response.entity';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class EmployeeResponsesService {
  constructor(
    @InjectRepository(EmployeeResponse)
    private readonly repo: Repository<EmployeeResponse>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) { // Alterado de number para string
    return this.repo.findOneBy({ id });
  }

  async create(data: Partial<EmployeeResponse>) {
    if (data.responses) {
      data.responses = data.responses.map(res => ({
        ...res,
        question_id: res.question_id || null
      }));
    }
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<EmployeeResponse>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  async getStatistics() {
    try {
      const questionnaires = await this.repo.query(
        'SELECT DISTINCT questionnaire_id FROM employee_responses'
      );
      
      let total_responses = 0;
      const unique_employees_set = new Set<string>();
      let recent_responses_30_days = 0;
      let total_questions = 0;
      let total_completion_rates = 0;
      let count_completion_rates = 0;
  
      for (const {questionnaire_id} of questionnaires) {
        const responses = await this.repo.find({ 
          where: { questionnaire_id } 
        });
        total_responses += responses.length;
  
        responses.forEach(r => unique_employees_set.add(r.employee_id));
  
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recent = await this.repo.count({
          where: {
            questionnaire_id,
            submitted_at: MoreThanOrEqual(thirtyDaysAgo)
          }
        });
        recent_responses_30_days += recent;
  
        // Assuming you have a questions repository/service
        const questions = await this.repo.query(
          'SELECT COUNT(*) FROM questions WHERE questionnaire_id = $1', 
          [questionnaire_id]
        );
        total_questions += parseInt(questions[0].count);
  
        if (questions[0].count > 0 && responses.length > 0) {
          total_completion_rates += 100;
        } else {
          total_completion_rates += 0;
        }
        count_completion_rates++;
      }
  
      const average_completion_rate = count_completion_rates > 0 
        ? (total_completion_rates / count_completion_rates) 
        : 0;
  
      return {
        total_responses,
        unique_employees: unique_employees_set.size,
        recent_responses_30_days,
        total_questions,
        average_completion_rate
      };
    } catch (error) {
      console.error('Erro ao gerar estatísticas gerais:', error);
      return {
        total_responses: 0,
        unique_employees: 0,
        recent_responses_30_days: 0,
        total_questions: 0,
        average_completion_rate: 0
      };
    }
  }
}