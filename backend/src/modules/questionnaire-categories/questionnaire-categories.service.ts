import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionnaireCategory } from './entities/questionnaire-category.entity';

@Injectable()
export class QuestionnaireCategoriesService {
  constructor(
    @InjectRepository(QuestionnaireCategory)
    private readonly repo: Repository<QuestionnaireCategory>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['questions'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ 
      where: { id },
      relations: ['questions'] 
    });
  }

  create(data: Partial<QuestionnaireCategory>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<QuestionnaireCategory>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}