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

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment', description: 'Cria um novo agendamento. O corpo deve conter os dados do paciente, médico, data e hora.' })
  @ApiBody({
    description: 'Dados do agendamento',
    schema: {
      example: {
        patient: 'João Silva',
        doctor: 'Dra. Maria',
        date: '2024-06-01',
        time: '14:00'
      }
    }
  })
  @ApiResponse({ status: 201, description: 'O agendamento foi criado com sucesso.', schema: { example: { id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '14:00' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida. Verifique os dados enviados.' })
  async create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all appointments', description: 'Recupera todos os agendamentos. Pode receber filtros via query params.' })
  @ApiQuery({ name: 'patient', required: false, description: 'Filtrar por nome do paciente' })
  @ApiQuery({ name: 'doctor', required: false, description: 'Filtrar por nome do médico' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrar por data (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos recuperada com sucesso.', schema: { example: [{ id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '14:00' }] } })
  async findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an appointment by ID', description: 'Recupera um agendamento específico pelo seu ID.' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: '1' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado.', schema: { example: { id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '14:00' } } })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an appointment by ID', description: 'Atualiza os dados de um agendamento existente pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: '1' })
  @ApiBody({
    description: 'Novos dados do agendamento',
    schema: {
      example: {
        patient: 'João Silva',
        doctor: 'Dra. Maria',
        date: '2024-06-01',
        time: '15:00'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'O agendamento foi atualizado com sucesso.', schema: { example: { id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '15:00' } } })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment by ID', description: 'Remove um agendamento pelo seu ID.' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: '1' })
  @ApiResponse({ status: 200, description: 'O agendamento foi removido com sucesso.', schema: { example: { message: 'Agendamento removido.' } } })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}