import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAAnalysis } from './entities/ia-analysis.entity';

@Injectable()
export class IAAnalysesService {
  constructor(
    @InjectRepository(IAAnalysis)
    private readonly repo: Repository<IAAnalysis>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<IAAnalysis>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<IAAnalysis>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 