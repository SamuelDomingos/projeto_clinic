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
import { PatientsService } from './patients.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso.' })
  @ApiBody({
    description: 'Dados para criação de um novo paciente',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Maria Silva' },
        dateOfBirth: { type: 'string', format: 'date', example: '1990-05-15' },
        gender: { type: 'string', example: 'Feminino' },
        address: { type: 'string', example: 'Rua Exemplo, 123' },
        phone: { type: 'string', example: '11987654321' },
        email: { type: 'string', example: 'maria.silva@example.com' },
      },
      required: ['name', 'dateOfBirth', 'gender', 'address', 'phone', 'email'],
    },
  })
  async create(@Body() body: any) {
    return this.patientsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada com sucesso.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de pacientes por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Deslocamento para paginação' })
  async findAll(@Query() query: any) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do paciente', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do paciente a ser atualizado', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização do paciente',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Maria Silva Atualizada' },
        dateOfBirth: { type: 'string', format: 'date', example: '1990-05-15' },
        gender: { type: 'string', example: 'Feminino' },
        address: { type: 'string', example: 'Nova Rua, 456' },
        phone: { type: 'string', example: '11998765432' },
        email: { type: 'string', example: 'maria.silva.atualizada@example.com' },
      },
    },
  })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do paciente a ser removido', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  @Get(':id/medical-history')
  @ApiOperation({ summary: 'Obter histórico médico completo do paciente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Histórico médico retornado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            birthDate: { type: 'string' },
            cpf: { type: 'string' },
            bloodType: { type: 'string' },
            allergies: { type: 'array' },
            insurance: { type: 'string' },
            totalSessions: { type: 'number' },
            lastVisit: { type: 'string', format: 'date-time' }
          }
        },
        history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              type: { type: 'string', enum: ['appointment', 'medical_record'] },
              title: { type: 'string' },
              description: { type: 'string' },
              doctorName: { type: 'string' },
              status: { type: 'string' },
              category: { type: 'string' }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalAppointments: { type: 'number' },
            completedAppointments: { type: 'number' },
            totalMedicalRecords: { type: 'number' },
            lastAppointment: { type: 'string', format: 'date-time' },
            lastMedicalRecord: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do paciente', 
    type: String, 
    example: '60d0fe4f5e2a7b001c8e4a1b' 
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    type: String, 
    description: 'Data de início do filtro (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    type: String, 
    description: 'Data de fim do filtro (YYYY-MM-DD)',
    example: '2024-12-31'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ['appointment', 'medical_record', 'all'], 
    description: 'Tipo de registro a filtrar',
    example: 'all'
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    type: String, 
    description: 'Categoria do registro médico',
    example: 'observation'
  })
  @ApiQuery({ 
    name: 'doctorId', 
    required: false, 
    type: String, 
    description: 'ID do médico para filtrar',
    example: '60d0fe4f5e2a7b001c8e4a1c'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Número da página',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Limite de registros por página',
    example: 50
  })
  async getMedicalHistory(
    @Param('id') id: string,
    @Query() query: any
  ) {
    return this.patientsService.getPatientMedicalHistory(id, query);
  }

  @Get(':id/history-summary')
  @ApiOperation({ summary: 'Obter resumo do histórico médico do paciente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumo do histórico retornado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        patient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            totalSessions: { type: 'number' },
            lastVisit: { type: 'string', format: 'date-time' }
          }
        },
        statistics: {
          type: 'object',
          properties: {
            totalAppointments: { type: 'number' },
            completedAppointments: { type: 'number' },
            totalMedicalRecords: { type: 'number' },
            recordsByCategory: { type: 'object' }
          }
        },
        lastRecords: {
          type: 'object',
          properties: {
            lastAppointment: { type: 'object' },
            lastMedicalRecord: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do paciente', 
    type: String, 
    example: '60d0fe4f5e2a7b001c8e4a1b' 
  })
  async getHistorySummary(@Param('id') id: string) {
    return this.patientsService.getPatientHistorySummary(id);
  }
}