import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiProperty, // Import ApiProperty
} from '@nestjs/swagger';
import { PatientProtocolsService } from './patient-protocols.service';

// Define a classe para o corpo da requisição de criação de protocolo de paciente diretamente aqui
class CreatePatientProtocolBody {
  @ApiProperty({ description: 'ID do paciente', example: '654321098765432109876543' })
  patientId: string;

  @ApiProperty({ description: 'ID do serviço de protocolo', example: '123456789012345678901234' })
  protocolServiceId: string;

  @ApiProperty({ description: 'Data de início do protocolo', example: '2023-10-27T10:00:00Z' })
  startDate: Date;

  @ApiProperty({ description: 'Data de término do protocolo (opcional)', example: '2024-10-27T10:00:00Z', required: false })
  endDate?: Date;

  @ApiProperty({ description: 'Status do protocolo', example: 'Ativo' })
  status: string;
}

// Define a classe para o corpo da requisição de atualização de protocolo de paciente diretamente aqui
class UpdatePatientProtocolBody {
  @ApiProperty({ description: 'ID do paciente', example: '654321098765432109876543', required: false })
  patientId?: string;

  @ApiProperty({ description: 'ID do serviço de protocolo', example: '123456789012345678901234', required: false })
  protocolServiceId?: string;

  @ApiProperty({ description: 'Data de início do protocolo', example: '2023-10-27T10:00:00Z', required: false })
  startDate?: Date;

  @ApiProperty({ description: 'Data de término do protocolo (opcional)', example: '2024-10-27T10:00:00Z', required: false })
  endDate?: Date;

  @ApiProperty({ description: 'Status do protocolo', example: 'Concluído', required: false })
  status?: string;
}

@ApiTags('patient-protocols')
@Controller('patient-protocols')
export class PatientProtocolsController {
  constructor(private readonly patientProtocolsService: PatientProtocolsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient protocol' })
  @ApiBody({
    type: CreatePatientProtocolBody, // Usando a classe definida localmente
    description: 'Dados para criar um novo protocolo de paciente',
    examples: {
      example1: {
        value: {
          patientId: '654321098765432109876543',
          protocolServiceId: '123456789012345678901234',
          startDate: '2023-10-27T10:00:00Z',
          endDate: '2024-10-27T10:00:00Z',
          status: 'Ativo',
        },
        summary: 'Exemplo de criação de protocolo de paciente',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Patient protocol created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async create(@Body() body: any) { // O tipo 'any' é mantido aqui para não forçar o uso de DTOs no código
    return this.patientProtocolsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patient protocols' })
  @ApiQuery({
    name: 'patientId',
    required: false,
    type: String,
    description: 'Filtrar protocolos de paciente pelo ID do paciente',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar protocolos de paciente pelo status',
  })
  @ApiResponse({ status: 200, description: 'List of patient protocols.' })
  async findAll(@Query() query: any) {
    return this.patientProtocolsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient protocol by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do protocolo de paciente a ser buscado',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Patient protocol found.' })
  @ApiResponse({ status: 404, description: 'Patient protocol not found.' })
  async findOne(@Param('id') id: string) {
    return this.patientProtocolsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a patient protocol by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do protocolo de paciente a ser atualizado',
    type: String,
  })
  @ApiBody({
    type: UpdatePatientProtocolBody, // Usando a classe definida localmente
    description: 'Dados para atualizar o protocolo de paciente',
    examples: {
      example1: {
        value: {
          status: 'Concluído',
        },
        summary: 'Exemplo de atualização de protocolo de paciente',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Patient protocol updated successfully.' })
  @ApiResponse({ status: 404, description: 'Patient protocol not found.' })
  async update(@Param('id') id: string, @Body() body: any) { // O tipo 'any' é mantido aqui para não forçar o uso de DTOs no código
    return this.patientProtocolsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient protocol by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do protocolo de paciente a ser removido',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Patient protocol deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Patient protocol not found.' })
  async remove(@Param('id') id: string) {
    return this.patientProtocolsService.remove(id);
  }
}