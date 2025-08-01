import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chat-history.entity';

@Injectable()
export class ChatHistoriesService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly repo: Repository<ChatHistory>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<ChatHistory>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<ChatHistory>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 