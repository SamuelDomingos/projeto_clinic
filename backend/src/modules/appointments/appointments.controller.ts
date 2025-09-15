import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BlockedTime } from './entities/blocked-time.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo agendamento', 
    description: 'Cria um novo agendamento médico. Verifica automaticamente conflitos de horário e disponibilidade do médico.' 
  })
  @ApiBody({
    description: 'Dados do agendamento',
    schema: {
      type: 'object',
      required: ['patientId', 'doctorId', 'date', 'startTime'],
      properties: {
        patientId: {
          type: 'string',
          description: 'ID do paciente',
          example: 'uuid-do-paciente'
        },
        doctorId: {
          type: 'string',
          description: 'ID do médico',
          example: 'uuid-do-medico'
        },
        date: {
          type: 'string',
          format: 'date',
          description: 'Data do agendamento (YYYY-MM-DD)',
          example: '2024-01-15'
        },
        startTime: {
          type: 'string',
          description: 'Hora de início (HH:MM)',
          example: '09:00'
        },
        duration: {
          type: 'number',
          description: 'Duração em minutos',
          example: 30,
          default: 30
        },
        procedure: {
          type: 'string',
          description: 'Procedimento a ser realizado',
          example: 'Consulta de rotina'
        },
        notes: {
          type: 'string',
          description: 'Observações adicionais',
          example: 'Paciente com histórico de alergia'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Agendamento criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-do-agendamento' },
        patientId: { type: 'string', example: 'uuid-do-paciente' },
        doctorId: { type: 'string', example: 'uuid-do-medico' },
        date: { type: 'string', example: '2024-01-15' },
        startTime: { type: 'string', example: '09:00' },
        duration: { type: 'number', example: 30 },
        procedure: { type: 'string', example: 'Consulta de rotina' },
        status: { type: 'string', example: 'scheduled' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou conflito de horário',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Já existe um agendamento para este médico neste horário' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  async create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  @Post('blocked-times')
  @ApiOperation({ 
    summary: 'Bloquear horário para médico', 
    description: 'Cria um bloqueio de horário para um médico específico, impedindo agendamentos no período definido.' 
  })
  @ApiBody({
    description: 'Dados do bloqueio de horário',
    schema: {
      type: 'object',
      required: ['doctorId', 'startDateTime', 'endDateTime'],
      properties: {
        doctorId: {
          type: 'string',
          description: 'ID do médico',
          example: 'uuid-do-medico'
        },
        startDateTime: {
          type: 'string',
          format: 'date-time',
          description: 'Data e hora de início do bloqueio',
          example: '2024-01-15T09:00:00Z'
        },
        endDateTime: {
          type: 'string',
          format: 'date-time',
          description: 'Data e hora de fim do bloqueio',
          example: '2024-01-15T12:00:00Z'
        },
        type: {
          type: 'string',
          enum: ['vacation', 'break', 'meeting', 'personal', 'maintenance'],
          description: 'Tipo do bloqueio',
          example: 'break'
        },
        reason: {
          type: 'string',
          description: 'Motivo do bloqueio',
          example: 'Pausa para almoço'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Horário bloqueado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-do-bloqueio' },
        doctorId: { type: 'string', example: 'uuid-do-medico' },
        startDateTime: { type: 'string', format: 'date-time' },
        endDateTime: { type: 'string', format: 'date-time' },
        type: { type: 'string', example: 'break' },
        reason: { type: 'string', example: 'Pausa para almoço' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  createBlockedTime(@Body() body: Partial<BlockedTime>) {
    return this.appointmentsService.createBlockedTime(body);
  }

  @Get('blocked-times/:doctorId')
  @ApiOperation({ 
    summary: 'Listar horários bloqueados', 
    description: 'Recupera todos os horários bloqueados de um médico específico, com filtros opcionais por período.' 
  })
  @ApiParam({ 
    name: 'doctorId', 
    description: 'ID do médico',
    example: 'uuid-do-medico'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    type: 'string', 
    format: 'date',
    description: 'Data de início do filtro (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    type: 'string', 
    format: 'date',
    description: 'Data de fim do filtro (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de horários bloqueados',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-do-bloqueio' },
          doctorId: { type: 'string', example: 'uuid-do-medico' },
          startDateTime: { type: 'string', format: 'date-time' },
          endDateTime: { type: 'string', format: 'date-time' },
          type: { type: 'string', example: 'break' },
          reason: { type: 'string', example: 'Pausa para almoço' }
        }
      }
    }
  })
  getBlockedTimes(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.appointmentsService.getBlockedTimes(doctorId, start, end);
  }

  @Delete('blocked-times/:id')
  @ApiOperation({ 
    summary: 'Remover bloqueio de horário', 
    description: 'Remove um bloqueio de horário específico pelo ID.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do horário bloqueado',
    example: 'uuid-do-bloqueio'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bloqueio removido com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Bloqueio removido com sucesso' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Bloqueio não encontrado' })
  removeBlockedTime(@Param('id') id: string) {
    return this.appointmentsService.removeBlockedTime(id);
  }

  @Get('availability/:doctorId')
  @ApiOperation({ 
    summary: 'Verificar disponibilidade', 
    description: 'Verifica se um médico está disponível em um horário específico, considerando agendamentos existentes e horários bloqueados.' 
  })
  @ApiParam({ 
    name: 'doctorId', 
    description: 'ID do médico',
    example: 'uuid-do-medico'
  })
  @ApiQuery({ 
    name: 'date', 
    type: 'string', 
    format: 'date',
    description: 'Data para verificar disponibilidade (YYYY-MM-DD)',
    example: '2024-01-15'
  })
  @ApiQuery({ 
    name: 'startTime', 
    type: 'string',
    description: 'Hora de início (HH:MM)',
    example: '09:00'
  })
  @ApiQuery({ 
    name: 'duration', 
    required: false, 
    type: 'number',
    description: 'Duração em minutos (padrão: 30)',
    example: 30
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado da verificação de disponibilidade',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
        conflicts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'appointment' },
              startTime: { type: 'string', example: '09:00' },
              endTime: { type: 'string', example: '09:30' },
              reason: { type: 'string', example: 'Agendamento existente' }
            }
          }
        }
      }
    }
  })
  checkAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('duration') duration?: number
  ) {
    return this.appointmentsService.checkAvailability(
      doctorId, 
      new Date(date), 
      startTime, 
      duration || 30
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar agendamentos', 
    description: 'Recupera todos os agendamentos com filtros opcionais por paciente, médico, data e status.' 
  })
  @ApiQuery({ 
    name: 'patientId', 
    required: false, 
    description: 'Filtrar por ID do paciente',
    example: 'uuid-do-paciente'
  })
  @ApiQuery({ 
    name: 'doctorId', 
    required: false, 
    description: 'Filtrar por ID do médico',
    example: 'uuid-do-medico'
  })
  @ApiQuery({ 
    name: 'date', 
    required: false, 
    type: 'string',
    format: 'date',
    description: 'Filtrar por data (YYYY-MM-DD)',
    example: '2024-01-15'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    description: 'Filtrar por status do agendamento'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de agendamentos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-do-agendamento' },
          patientId: { type: 'string', example: 'uuid-do-paciente' },
          doctorId: { type: 'string', example: 'uuid-do-medico' },
          date: { type: 'string', example: '2024-01-15' },
          startTime: { type: 'string', example: '09:00' },
          duration: { type: 'number', example: 30 },
          procedure: { type: 'string', example: 'Consulta de rotina' },
          status: { type: 'string', example: 'scheduled' },
          patient: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: 'João Silva' },
              email: { type: 'string', example: 'joao@email.com' }
            }
          },
          doctor: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: 'Dra. Maria Santos' },
              specialty: { type: 'string', example: 'Cardiologia' }
            }
          }
        }
      }
    }
  })
  async findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar agendamento por ID', 
    description: 'Recupera um agendamento específico pelo seu ID, incluindo dados do paciente e médico.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do agendamento',
    example: 'uuid-do-agendamento'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agendamento encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-do-agendamento' },
        patientId: { type: 'string', example: 'uuid-do-paciente' },
        doctorId: { type: 'string', example: 'uuid-do-medico' },
        date: { type: 'string', example: '2024-01-15' },
        startTime: { type: 'string', example: '09:00' },
        duration: { type: 'number', example: 30 },
        procedure: { type: 'string', example: 'Consulta de rotina' },
        status: { type: 'string', example: 'scheduled' },
        notes: { type: 'string', example: 'Paciente com histórico de alergia' },
        patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' }
          }
        },
        doctor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Dra. Maria Santos' },
            specialty: { type: 'string', example: 'Cardiologia' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar agendamento', 
    description: 'Atualiza os dados de um agendamento existente. Verifica automaticamente conflitos de horário se data/hora forem alteradas.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do agendamento',
    example: 'uuid-do-agendamento'
  })
  @ApiBody({
    description: 'Dados para atualização (todos os campos são opcionais)',
    schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date',
          description: 'Nova data do agendamento',
          example: '2024-01-16'
        },
        startTime: {
          type: 'string',
          description: 'Nova hora de início',
          example: '10:00'
        },
        duration: {
          type: 'number',
          description: 'Nova duração em minutos',
          example: 45
        },
        procedure: {
          type: 'string',
          description: 'Novo procedimento',
          example: 'Consulta de retorno'
        },
        notes: {
          type: 'string',
          description: 'Novas observações',
          example: 'Paciente apresentou melhora'
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
          description: 'Novo status do agendamento'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agendamento atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-do-agendamento' },
        patientId: { type: 'string', example: 'uuid-do-paciente' },
        doctorId: { type: 'string', example: 'uuid-do-medico' },
        date: { type: 'string', example: '2024-01-16' },
        startTime: { type: 'string', example: '10:00' },
        duration: { type: 'number', example: 45 },
        procedure: { type: 'string', example: 'Consulta de retorno' },
        status: { type: 'string', example: 'confirmed' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Cancelar agendamento', 
    description: 'Cancela um agendamento específico pelo ID. O agendamento não é removido fisicamente, apenas marcado como cancelado.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do agendamento',
    example: 'uuid-do-agendamento'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agendamento cancelado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Agendamento cancelado com sucesso' },
        appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-do-agendamento' },
            status: { type: 'string', example: 'cancelled' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  // Endpoints adicionais para gerenciamento de status
  @Put(':id/confirm')
  @ApiOperation({ 
    summary: 'Confirmar agendamento', 
    description: 'Confirma um agendamento, alterando seu status para "confirmed".' 
  })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento confirmado com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async confirm(@Param('id') id: string) {
    return this.appointmentsService.confirm(id);
  }

  @Put(':id/complete')
  @ApiOperation({ 
    summary: 'Marcar agendamento como concluído', 
    description: 'Marca um agendamento como concluído, alterando seu status para "completed".' 
  })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento marcado como concluído' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async complete(@Param('id') id: string) {
    return this.appointmentsService.complete(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ 
    summary: 'Cancelar agendamento', 
    description: 'Cancela um agendamento, alterando seu status para "cancelled".' 
  })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento cancelado com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }
}