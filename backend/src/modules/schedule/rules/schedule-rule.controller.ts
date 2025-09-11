import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleRuleService } from './schedule-rule.service';
import { ScheduleRule } from './schedule-rule.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Schedule Rules')
@Controller('schedule/rules')
export class ScheduleRuleController {
  constructor(private readonly service: ScheduleRuleService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Lista todas as regras de agenda',
    description: 'Retorna uma lista de todas as regras de agendamento existentes no sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de regras retornada com sucesso.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Regra de Fim de Semana',
          description: 'Não permitir agendamentos aos sábados e domingos',
          isActive: true,
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
    summary: 'Busca regra de agenda pelo ID',
    description: 'Retorna os detalhes de uma regra de agendamento específica pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Regra encontrada com sucesso.',
    schema: {
      example: {
        id: 1,
        name: 'Regra de Fim de Semana',
        description: 'Não permitir agendamentos aos sábados e domingos',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Regra não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da regra de agenda', type: Number, example: 1 })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria uma nova regra de agenda',
    description: 'Cria uma nova regra de agendamento com nome, descrição e status de ativação.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Regra criada com sucesso.',
    schema: {
      example: {
        id: 2,
        name: 'Regra de Horário de Almoço',
        description: 'Bloquear agendamentos entre 12:00 e 13:00',
        isActive: true,
        createdAt: '2024-01-15T11:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    description: 'Dados para criação da regra de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Regra de Horário de Almoço', description: 'Nome da regra' },
        description: { type: 'string', example: 'Bloquear agendamentos entre 12:00 e 13:00', description: 'Descrição da regra' },
        isActive: { type: 'boolean', example: true, description: 'Status de ativação da regra' }
      },
      required: ['name', 'description']
    }
  })
  create(@Body() dto: Partial<ScheduleRule>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualiza uma regra de agenda pelo ID',
    description: 'Atualiza os dados de uma regra de agendamento existente pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Regra atualizada com sucesso.',
    schema: {
      example: {
        id: 1,
        name: 'Regra de Fim de Semana Atualizada',
        description: 'Não permitir agendamentos aos sábados e domingos (atualizada)',
        isActive: false,
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Regra não encontrada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiParam({ name: 'id', description: 'ID da regra de agenda', type: Number, example: 1 })
  @ApiBody({
    description: 'Dados para atualização da regra de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Regra de Fim de Semana Atualizada', description: 'Novo nome da regra' },
        description: { type: 'string', example: 'Não permitir agendamentos aos sábados e domingos (atualizada)', description: 'Nova descrição da regra' },
        isActive: { type: 'boolean', example: false, description: 'Novo status de ativação da regra' }
      }
    }
  })
  update(@Param('id') id: number, @Body() dto: Partial<ScheduleRule>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove uma regra de agenda pelo ID',
    description: 'Remove uma regra de agendamento do sistema pelo seu ID.'
  })
  @ApiResponse({ status: 200, description: 'Regra removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da regra de agenda', type: Number, example: 1 })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}