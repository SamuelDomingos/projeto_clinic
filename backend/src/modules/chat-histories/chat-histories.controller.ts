import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ChatHistoriesService } from './chat-histories.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('chat-histories')
@Controller('chat-histories')
export class ChatHistoriesController {
  constructor(private readonly service: ChatHistoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém todas as histórias de chat' })
  @ApiResponse({ status: 200, description: 'Lista de histórias de chat.', schema: { type: 'array', items: { type: 'object' } } })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém uma história de chat pelo ID' })
  @ApiResponse({ status: 200, description: 'História de chat encontrada.', schema: { type: 'object' } })
  @ApiResponse({ status: 404, description: 'História de chat não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da história de chat', type: 'number', example: 1 })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova história de chat' })
  @ApiResponse({ status: 201, description: 'A história de chat foi criada com sucesso.', schema: { type: 'object' } })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiBody({
    description: 'Dados para criar uma nova história de chat',
    schema: {
      type: 'object',
      properties: {
        // Exemplo de propriedades para uma história de chat
        userId: { type: 'number', example: 1 },
        message: { type: 'string', example: 'Olá, preciso de ajuda com meu agendamento.' },
        timestamp: { type: 'string', format: 'date-time', example: '2023-10-27T10:00:00Z' },
      },
    },
  })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma história de chat existente' })
  @ApiResponse({ status: 200, description: 'A história de chat foi atualizada com sucesso.', schema: { type: 'object' } })
  @ApiResponse({ status: 404, description: 'História de chat não encontrada.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiParam({ name: 'id', description: 'ID da história de chat a ser atualizada', type: 'number', example: 1 })
  @ApiBody({
    description: 'Dados para atualizar a história de chat',
    schema: {
      type: 'object',
      properties: {
        // Exemplo de propriedades para atualização
        message: { type: 'string', example: 'Minha consulta foi reagendada para amanhã.' },
        status: { type: 'string', example: 'resolved' },
      },
    },
  })
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui uma história de chat' })
  @ApiResponse({ status: 200, description: 'A história de chat foi excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'História de chat não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da história de chat a ser excluída', type: 'number', example: 1 })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}