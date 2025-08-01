import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Questionnaire]),
    QuestionsModule // Add this import
  ],
  providers: [QuestionnairesService],
  controllers: [QuestionnairesController],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}