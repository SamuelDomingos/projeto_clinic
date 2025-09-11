import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleTypeService } from './schedule-type.service';
import { ScheduleType } from './schedule-type.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Schedule Types')
@Controller('schedule/types')
export class ScheduleTypeController {
  constructor(private readonly service: ScheduleTypeService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Lista todos os tipos de agenda',
    description: 'Retorna uma lista de todos os tipos de agendamento existentes no sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tipos retornada com sucesso.',
    schema: {
      example: [
        {
          id: '60d0fe4f5e2a7b001c8e4a1d',
          name: 'Consulta',
          description: 'Tipo de agendamento para consultas médicas',
          duration: 30,
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
    summary: 'Busca tipo de agenda pelo ID',
    description: 'Retorna os detalhes de um tipo de agendamento específico pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo encontrado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1d',
        name: 'Consulta',
        description: 'Tipo de agendamento para consultas médicas',
        duration: 30,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do tipo de agenda', type: String, example: '60d0fe4f5e2a7b001c8e4a1d' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria um novo tipo de agenda',
    description: 'Cria um novo tipo de agendamento com nome, descrição e duração.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tipo criado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1e',
        name: 'Exame',
        description: 'Tipo de agendamento para exames laboratoriais',
        duration: 60,
        createdAt: '2024-01-15T11:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    description: 'Dados para criação do tipo de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Exame', description: 'Nome do tipo de agendamento' },
        description: { type: 'string', example: 'Tipo de agendamento para exames laboratoriais', description: 'Descrição do tipo de agendamento' },
        duration: { type: 'number', example: 60, description: 'Duração padrão do agendamento em minutos' }
      },
      required: ['name', 'duration']
    }
  })
  create(@Body() dto: Partial<ScheduleType>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualiza um tipo de agenda pelo ID',
    description: 'Atualiza os dados de um tipo de agendamento existente pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo atualizado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1d',
        name: 'Consulta Médica',
        description: 'Tipo de agendamento para consultas médicas gerais',
        duration: 45,
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiParam({ name: 'id', description: 'ID do tipo de agenda', type: String, example: '60d0fe4f5e2a7b001c8e4a1d' })
  @ApiBody({
    description: 'Dados para atualização do tipo de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Consulta Médica', description: 'Novo nome do tipo de agendamento' },
        description: { type: 'string', example: 'Tipo de agendamento para consultas médicas gerais', description: 'Nova descrição do tipo de agendamento' },
        duration: { type: 'number', example: 45, description: 'Nova duração padrão do agendamento em minutos' }
      }
    }
  })
  update(@Param('id') id: string, @Body() dto: Partial<ScheduleType>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove um tipo de agenda pelo ID',
    description: 'Remove um tipo de agendamento do sistema pelo seu ID.'
  })
  @ApiResponse({ status: 200, description: 'Tipo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Tipo não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do tipo de agenda', type: String, example: '60d0fe4f5e2a7b001c8e4a1d' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}