import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoWatchesService } from './video-watches.service';
import { VideoWatch } from './entities/video-watch.entity';
import { VideoWatchesController } from './video-watches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoWatch])],
  providers: [VideoWatchesService],
  controllers: [VideoWatchesController],
  exports: [VideoWatchesService],
})
export class VideoWatchesModule {} 