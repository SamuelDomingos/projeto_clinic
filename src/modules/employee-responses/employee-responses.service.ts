import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeResponse } from './entities/employee-response.entity';

@Injectable()
export class EmployeeResponsesService {
  constructor(
    @InjectRepository(EmployeeResponse)
    private readonly repo: Repository<EmployeeResponse>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<EmployeeResponse>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<EmployeeResponse>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 