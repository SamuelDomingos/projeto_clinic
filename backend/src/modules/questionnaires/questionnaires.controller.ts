import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Questionnaires')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly service: QuestionnairesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os questionários' })
  @ApiResponse({ status: 200, description: 'Lista de questionários.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um questionário pelo ID' })
  @ApiResponse({ status: 200, description: 'Questionário encontrado.' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo questionário' })
  @ApiResponse({ status: 201, description: 'Questionário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post('gerar-com-ia')
  @ApiOperation({ summary: 'Gera questionário com IA' })
  @ApiResponse({ status: 201, description: 'Questionário gerado com IA.' })
  async gerarQuestionarioComIA(
    @Body() data: { prompt: string; category_id?: string },
  ) {
    return this.service.gerarQuestionarioComIA(data.prompt, data.category_id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um questionário pelo ID' })
  @ApiResponse({ status: 200, description: 'Questionário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado.' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um questionário pelo ID' })
  @ApiResponse({ status: 200, description: 'Questionário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Questionário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
