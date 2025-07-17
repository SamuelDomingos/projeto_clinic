import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {} 