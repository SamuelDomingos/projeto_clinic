import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleConfigService } from './schedule-config.service';
import { ScheduleConfig } from './schedule-config.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Schedule Config')
@Controller('schedule/config')
export class ScheduleConfigController {
  constructor(private readonly service: ScheduleConfigService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Lista todas as configurações de agenda',
    description: 'Retorna uma lista de todas as configurações de agendamento existentes no sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de configurações retornada com sucesso.',
    schema: {
      example: [
        {
          id: '60d0fe4f5e2a7b001c8e4a1b',
          name: 'Configuração Padrão',
          value: '{"startTime": "08:00", "endTime": "18:00", "interval": 30}',
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
    summary: 'Busca configuração de agenda pelo ID',
    description: 'Retorna os detalhes de uma configuração de agendamento específica pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuração encontrada com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Configuração Padrão',
        value: '{"startTime": "08:00", "endTime": "18:00", "interval": 30}',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da configuração de agenda', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria uma nova configuração de agenda',
    description: 'Cria uma nova configuração de agendamento com nome, valor e status de ativação.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuração criada com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1c',
        name: 'Configuração de Fim de Semana',
        value: '{"startTime": "10:00", "endTime": "16:00", "interval": 60}',
        isActive: true,
        createdAt: '2024-01-15T11:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    description: 'Dados para criação da configuração de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Configuração de Fim de Semana', description: 'Nome da configuração' },
        value: { type: 'string', example: '{"startTime": "10:00", "endTime": "16:00", "interval": 60}', description: 'Valor da configuração em formato JSON string' },
        isActive: { type: 'boolean', example: true, description: 'Status de ativação da configuração' }
      },
      required: ['name', 'value']
    }
  })
  create(@Body() dto: Partial<ScheduleConfig>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualiza uma configuração de agenda pelo ID',
    description: 'Atualiza os dados de uma configuração de agendamento existente pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuração atualizada com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Configuração Padrão Atualizada',
        value: '{"startTime": "09:00", "endTime": "17:00", "interval": 45}',
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiParam({ name: 'id', description: 'ID da configuração de agenda', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização da configuração de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Configuração Padrão Atualizada', description: 'Novo nome da configuração' },
        value: { type: 'string', example: '{"startTime": "09:00", "endTime": "17:00", "interval": 45}', description: 'Novo valor da configuração em formato JSON string' },
        isActive: { type: 'boolean', example: false, description: 'Novo status de ativação da configuração' }
      }
    }
  })
  update(@Param('id') id: string, @Body() dto: Partial<ScheduleConfig>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove uma configuração de agenda pelo ID',
    description: 'Remove uma configuração de agendamento do sistema pelo seu ID.'
  })
  @ApiResponse({ status: 200, description: 'Configuração removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da configuração de agenda', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}