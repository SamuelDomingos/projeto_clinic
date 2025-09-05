import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';

@ApiTags('medical-records')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({ status: 201, description: 'Medical record created successfully.' })
  @ApiBody({
    description: 'Dados para criação de um novo prontuário médico',
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1b', description: 'ID do paciente associado ao prontuário' },
        recordDate: { type: 'string', format: 'date', example: '2023-10-26', description: 'Data do registro' },
        diagnosis: { type: 'string', example: 'Gripe comum', description: 'Diagnóstico do paciente' },
        treatment: { type: 'string', example: 'Repouso e medicação', description: 'Tratamento prescrito' },
        notes: { type: 'string', example: 'Paciente apresentou febre e tosse.', description: 'Observações adicionais' },
        doctorId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1c', description: 'ID do médico (opcional se autenticado)' },
      },
      required: ['patientId', 'recordDate', 'diagnosis', 'treatment'],
    },
  })
  async create(@Body() body: any, @Req() req) {
    // Verificar se há usuário autenticado ou doctorId no body
    const userId = req.user?.id || body.doctorId;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado ou doctorId não fornecido');
    }
    return this.medicalRecordsService.createRecord(body, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical records' })
  @ApiResponse({ status: 200, description: 'List of medical records.' })
  @ApiQuery({ name: 'patientId', required: false, type: String, description: 'Filtrar por ID do paciente' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Deslocamento para paginação' })
  async findAll(@Query() query: any, @Req() req) {
    const userId = req.user?.id;
    return this.medicalRecordsService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medical record by ID' })
  @ApiResponse({ status: 200, description: 'Medical record found.' })
  @ApiResponse({ status: 404, description: 'Medical record not found.' })
  @ApiParam({ name: 'id', description: 'ID do prontuário médico', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    return this.medicalRecordsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a medical record by ID' })
  @ApiResponse({ status: 200, description: 'Medical record updated successfully.' })
  @ApiResponse({ status: 404, description: 'Medical record not found.' })
  @ApiParam({ name: 'id', description: 'ID do prontuário médico a ser atualizado', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização do prontuário médico',
    schema: {
      type: 'object',
      properties: {
        recordDate: { type: 'string', format: 'date', example: '2023-10-27', description: 'Nova data do registro' },
        diagnosis: { type: 'string', example: 'Recuperado de gripe', description: 'Novo diagnóstico' },
        treatment: { type: 'string', example: 'Alta médica', description: 'Novo tratamento' },
        notes: { type: 'string', example: 'Paciente sem sintomas.', description: 'Novas observações' },
        doctorId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1c', description: 'ID do médico (opcional se autenticado)' },
      },
    },
  })
  async update(@Param('id') id: string, @Body() body: any, @Req() req) {
    const userId = req.user?.id || body.doctorId;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado ou doctorId não fornecido');
    }
    return this.medicalRecordsService.update(id, body, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medical record by ID' })
  @ApiResponse({ status: 200, description: 'Medical record deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Medical record not found.' })
  @ApiParam({ name: 'id', description: 'ID do prontuário médico a ser removido', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async remove(@Param('id') id: string, @Req() req, @Body() body: any) {
    const userId = req.user?.id || body.doctorId;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado ou doctorId não fornecido');
    }
    return this.medicalRecordsService.remove(id, userId);
  }

  @Get('patients/:patientId/timeline')
  @ApiOperation({ summary: 'Get patient timeline' })
  @ApiResponse({ status: 200, description: 'Patient timeline retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiQuery({ name: 'recordCategory', required: false, type: String, description: 'Filtrar por categoria de registro' })
  @ApiQuery({ name: 'startDate', required: false, type: String, format: 'date', description: 'Filtrar por data inicial' })
  @ApiQuery({ name: 'endDate', required: false, type: String, format: 'date', description: 'Filtrar por data final' })
  async getPatientTimeline(@Param('patientId') patientId: string, @Query() query: any, @Req() req) {
      const userId = req.user?.id;
      return this.medicalRecordsService.getPatientTimeline(patientId, query, userId);
  }

  // Novos endpoints para Gestão de Pacientes
  @Get('patients')
  @ApiOperation({ summary: 'Get all patients with medical records' })
  @ApiResponse({ status: 200, description: 'List of patients with medical records.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Deslocamento para paginação' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome do paciente' })
  async getAllPatients(@Query() query: any, @Req() req) {
    const userId = req.user?.id;
    return this.medicalRecordsService.getAllPatients(query, userId);
  }

  @Get('patients/:patientId/summary')
  @ApiOperation({ summary: 'Get patient summary with statistics' })
  @ApiResponse({ status: 200, description: 'Patient summary retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async getPatientSummary(@Param('patientId') patientId: string, @Req() req) {
    const userId = req.user?.id;
    return this.medicalRecordsService.getPatientSummary(patientId, userId);
  }

  @Get('patients/:patientId/history')
  @ApiOperation({ summary: 'Get complete patient history' })
  @ApiResponse({ status: 200, description: 'Patient history retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiParam({ name: 'patientId', description: 'ID do paciente', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'startDate', required: false, type: String, format: 'date', description: 'Data inicial' })
  @ApiQuery({ name: 'endDate', required: false, type: String, format: 'date', description: 'Data final' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Deslocamento' })
  async getPatientHistory(@Param('patientId') patientId: string, @Query() query: any, @Req() req) {
    const userId = req.user?.id;
    return this.medicalRecordsService.getPatientHistory(patientId, query, userId);
  }
}