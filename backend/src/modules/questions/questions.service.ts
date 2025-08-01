import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly repo: Repository<Question>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async findByQuestionnaire(questionnaireId: string) {
    return this.repo.find({ where: { questionnaire_id: questionnaireId } });
  }

  create(data: Partial<Question>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<Question>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}