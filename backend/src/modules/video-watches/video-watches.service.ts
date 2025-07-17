import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoWatch } from './entities/video-watch.entity';

@Injectable()
export class VideoWatchesService {
  constructor(
    @InjectRepository(VideoWatch)
    private readonly repo: Repository<VideoWatch>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<VideoWatch>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<VideoWatch>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
} 