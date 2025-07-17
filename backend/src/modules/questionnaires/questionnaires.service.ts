import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly repo: Repository<Questionnaire>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Questionnaire>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<Questionnaire>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 