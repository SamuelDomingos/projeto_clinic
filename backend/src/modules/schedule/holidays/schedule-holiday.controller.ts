import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleHolidayService } from './schedule-holiday.service';
import { ScheduleHoliday } from './schedule-holiday.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Schedule Holidays')
@Controller('schedule/holidays')
export class ScheduleHolidayController {
  constructor(private readonly service: ScheduleHolidayService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Lista todos os feriados de agenda',
    description: 'Retorna uma lista de todos os feriados de agendamento existentes no sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de feriados retornada com sucesso.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Natal',
          date: '2024-12-25',
          isRecurring: true,
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
    summary: 'Busca feriado de agenda pelo ID',
    description: 'Retorna os detalhes de um feriado de agendamento específico pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Feriado encontrado com sucesso.',
    schema: {
      example: {
        id: 1,
        name: 'Natal',
        date: '2024-12-25',
        isRecurring: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Feriado não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do feriado de agenda', type: Number, example: 1 })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria um novo feriado de agenda',
    description: 'Cria um novo feriado de agendamento com nome, data e status de recorrência.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Feriado criado com sucesso.',
    schema: {
      example: {
        id: 2,
        name: 'Ano Novo',
        date: '2025-01-01',
        isRecurring: true,
        createdAt: '2024-01-15T11:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBody({
    description: 'Dados para criação do feriado de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Ano Novo', description: 'Nome do feriado' },
        date: { type: 'string', format: 'date', example: '2025-01-01', description: 'Data do feriado no formato YYYY-MM-DD' },
        isRecurring: { type: 'boolean', example: true, description: 'Indica se o feriado é recorrente anualmente' }
      },
      required: ['name', 'date']
    }
  })
  create(@Body() dto: Partial<ScheduleHoliday>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualiza um feriado de agenda pelo ID',
    description: 'Atualiza os dados de um feriado de agendamento existente pelo seu ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Feriado atualizado com sucesso.',
    schema: {
      example: {
        id: 1,
        name: 'Natal Atualizado',
        date: '2024-12-25',
        isRecurring: false,
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Feriado não encontrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiParam({ name: 'id', description: 'ID do feriado de agenda', type: Number, example: 1 })
  @ApiBody({
    description: 'Dados para atualização do feriado de agenda',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Natal Atualizado', description: 'Novo nome do feriado' },
        date: { type: 'string', format: 'date', example: '2024-12-25', description: 'Nova data do feriado no formato YYYY-MM-DD' },
        isRecurring: { type: 'boolean', example: false, description: 'Novo status de recorrência do feriado' }
      }
    }
  })
  update(@Param('id') id: number, @Body() dto: Partial<ScheduleHoliday>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove um feriado de agenda pelo ID',
    description: 'Remove um feriado de agendamento do sistema pelo seu ID.'
  })
  @ApiResponse({ status: 200, description: 'Feriado removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Feriado não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do feriado de agenda', type: Number, example: 1 })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}