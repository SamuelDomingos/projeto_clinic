import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionnaireCategory } from './entities/questionnaire-category.entity';
import { QuestionnaireCategoriesService } from './questionnaire-categories.service';
import { QuestionnaireCategoriesController } from './questionnaire-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionnaireCategory])],
  providers: [QuestionnaireCategoriesService],
  controllers: [QuestionnaireCategoriesController],
  exports: [QuestionnaireCategoriesService],
})
export class QuestionnaireCategoriesModule {} 