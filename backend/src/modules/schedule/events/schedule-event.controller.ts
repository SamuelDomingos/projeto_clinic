import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleEventService } from './schedule-event.service';
import { ScheduleEvent } from './schedule-event.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Schedule Events')
@Controller('schedule/events')
export class ScheduleEventController {
  constructor(private readonly service: ScheduleEventService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Lista todos os eventos de agenda',
    description: 'Retorna uma lista de todos os eventos de agendamento existentes no sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de eventos retornada com sucesso.',
    schema: {
      example: [
        {
          id: 1,
          title: 'Consulta Médica',
          description: 'Consulta de rotina com o Dr. Silva',
          start: '2024-01-20T10:00:00Z',
          end: '2024-01-20T11:00:00Z',
          allDay: false,
          createdAt: '2024-01-15T10:30:00Z'
        }
      ]
    }
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Busca evento de agenda pelo ID',
    description: 'Retorna os detalhes de um evento de agendamento específico pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Evento encontrado com sucesso.',
    schema: {
      example: {
        id: 1,
        title: 'Consulta Médica',
        description: 'Consulta de rotina com o Dr. Silva',
        start: '2024-01-20T10:00:00Z',
        end: '2024-01-20T11:00:00Z',
        allDay: false,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do evento de agenda', type: Number, example: 1 })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria um novo evento de agenda',
    description: 'Cria um novo evento de agendamento com título, descrição, datas de início e fim.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Evento criado com sucesso.',
    schema: {
      example: {
        id: 2,
        title: 'Reunião de Equipe',
        description: 'Reunião semanal de planejamento',
        start: '2024-01-22T09:00:00Z',
        end: '2024-01-22T10:00:00Z',
        allDay: false,
        createdAt: '2024-01-15T11:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    description: 'Dados para criação do evento de agenda',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Reunião de Equipe', description: 'Título do evento' },
        description: { type: 'string', example: 'Reunião semanal de planejamento', description: 'Descrição do evento' },
        start: { type: 'string', format: 'date-time', example: '2024-01-22T09:00:00Z', description: 'Data e hora de início do evento' },
        end: { type: 'string', format: 'date-time', example: '2024-01-22T10:00:00Z', description: 'Data e hora de término do evento' },
        allDay: { type: 'boolean', example: false, description: 'Indica se o evento dura o dia inteiro' }
      },
      required: ['title', 'start', 'end']
    }
  })
  create(@Body() dto: Partial<ScheduleEvent>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualiza um evento de agenda pelo ID',
    description: 'Atualiza os dados de um evento de agendamento existente pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Evento atualizado com sucesso.',
    schema: {
      example: {
        id: 1,
        title: 'Consulta Médica Atualizada',
        description: 'Consulta de rotina com o Dr. Silva (atualizada)',
        start: '2024-01-20T10:00:00Z',
        end: '2024-01-20T11:30:00Z',
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiParam({ name: 'id', description: 'ID do evento de agenda', type: Number, example: 1 })
  @ApiBody({
    description: 'Dados para atualização do evento de agenda',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Consulta Médica Atualizada', description: 'Novo título do evento' },
        description: { type: 'string', example: 'Consulta de rotina com o Dr. Silva (atualizada)', description: 'Nova descrição do evento' },
        start: { type: 'string', format: 'date-time', example: '2024-01-20T10:00:00Z', description: 'Nova data e hora de início do evento' },
        end: { type: 'string', format: 'date-time', example: '2024-01-20T11:30:00Z', description: 'Nova data e hora de término do evento' },
        allDay: { type: 'boolean', example: false, description: 'Novo status de dia inteiro do evento' }
      }
    }
  })
  update(@Param('id') id: number, @Body() dto: Partial<ScheduleEvent>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove um evento de agenda pelo ID',
    description: 'Remove um evento de agendamento do sistema pelo seu ID.'
  })
  @ApiResponse({ status: 200, description: 'Evento removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do evento de agenda', type: Number, example: 1 })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}