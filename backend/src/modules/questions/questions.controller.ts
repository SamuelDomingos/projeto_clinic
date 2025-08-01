import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as perguntas' })
  @ApiResponse({ status: 200, description: 'Lista de perguntas.' })
  findAll() {
    return this.service.findAll();
  }

  @Get('questionnaire/:questionnaireId')
  @ApiOperation({ summary: 'Busca perguntas por questionário' })
  @ApiResponse({ status: 200, description: 'Perguntas do questionário.' })
  findByQuestionnaire(@Param('questionnaireId') questionnaireId: string) {
    return this.service.findByQuestionnaire(questionnaireId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma pergunta pelo ID' })
  @ApiResponse({ status: 200, description: 'Pergunta encontrada.' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova pergunta' })
  @ApiResponse({ status: 201, description: 'Pergunta criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma pergunta pelo ID' })
  @ApiResponse({ status: 200, description: 'Pergunta atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada.' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma pergunta pelo ID' })
  @ApiResponse({ status: 200, description: 'Pergunta removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}