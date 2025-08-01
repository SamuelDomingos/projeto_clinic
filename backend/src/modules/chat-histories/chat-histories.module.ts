import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistory } from './entities/chat-history.entity';
import { ChatHistoriesService } from './chat-histories.service';
import { ChatHistoriesController } from './chat-histories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatHistory])],
  providers: [ChatHistoriesService],
  controllers: [ChatHistoriesController],
  exports: [ChatHistoriesService],
})
export class ChatHistoriesModule {} 