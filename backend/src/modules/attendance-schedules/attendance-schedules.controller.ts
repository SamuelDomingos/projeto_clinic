import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AttendanceSchedulesService } from './attendance-schedules.service';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('attendance-schedules')
@Controller('attendance-schedules')
export class AttendanceSchedulesController {
  constructor(private readonly attendanceSchedulesService: AttendanceSchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance schedule', description: 'Cria um novo horário de atendimento. O corpo deve conter dados como dia da semana, hora de início e fim.' })
  @ApiBody({
    description: 'Dados do horário de atendimento',
    schema: {
      type: 'object',
      properties: {
        doctorId: { type: 'string', example: '1' },
        dayOfWeek: { type: 'string', example: 'Monday' },
        startTime: { type: 'string', example: '09:00' },
        endTime: { type: 'string', example: '17:00' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'O horário de atendimento foi criado com sucesso.', schema: { example: { id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  create(@Body() data: Partial<AttendanceSchedule>) {
    return this.attendanceSchedulesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all attendance schedules', description: 'Recupera todos os horários de atendimento.' })
  @ApiResponse({ status: 200, description: 'Lista de horários recuperada com sucesso.', schema: { example: [{ id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }] } })
  findAll() {
    return this.attendanceSchedulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an attendance schedule by ID', description: 'Recupera um horário de atendimento específico pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do horário de atendimento', example: '1' })
  @ApiResponse({ status: 200, description: 'Horário encontrado.', schema: { example: { id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' } } })
  @ApiResponse({ status: 404, description: 'Horário não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.attendanceSchedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance schedule by ID', description: 'Atualiza os dados de um horário de atendimento pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do horário de atendimento', example: '1' })
  @ApiBody({
    description: 'Novos dados do horário de atendimento',
    schema: {
      type: 'object',
      properties: {
        startTime: { type: 'string', example: '10:00' },
        endTime: { type: 'string', example: '18:00' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'O horário foi atualizado com sucesso.', schema: { example: { id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00' } } })
  @ApiResponse({ status: 404, description: 'Horário não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  update(@Param('id') id: string, @Body() data: Partial<AttendanceSchedule>) {
    return this.attendanceSchedulesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance schedule by ID', description: 'Remove um horário de atendimento pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do horário de atendimento', example: '1' })
  @ApiResponse({ status: 200, description: 'O horário foi removido com sucesso.', schema: { example: { message: 'Horário removido.' } } })
  @ApiResponse({ status: 404, description: 'Horário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.attendanceSchedulesService.remove(id);
  }
}