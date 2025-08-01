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
import { PatientServiceSessionsService } from './patient-service-sessions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Patient Service Sessions')
@Controller('patient-service-sessions')
export class PatientServiceSessionsController {
  constructor(private readonly patientServiceSessionsService: PatientServiceSessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova sessão de serviço do paciente' })
  @ApiResponse({ status: 201, description: 'Sessão de serviço do paciente criada com sucesso.' })
  async create(@Body() body: any) {
    return this.patientServiceSessionsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as sessões de serviço do paciente' })
  @ApiResponse({ status: 200, description: 'Lista de sessões de serviço do paciente retornada com sucesso.' })
  async findAll(@Query() query: any) {
    return this.patientServiceSessionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sessão de serviço do paciente por ID' })
  @ApiResponse({ status: 200, description: 'Sessão de serviço do paciente retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sessão de serviço do paciente não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.patientServiceSessionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar sessão de serviço do paciente por ID' })
  @ApiResponse({ status: 200, description: 'Sessão de serviço do paciente atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sessão de serviço do paciente não encontrada.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.patientServiceSessionsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover sessão de serviço do paciente por ID' })
  @ApiResponse({ status: 200, description: 'Sessão de serviço do paciente removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Sessão de serviço do paciente não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.patientServiceSessionsService.remove(id);
  }

  @Get('progress/:patientProtocolId/:protocolServiceId')
  @ApiOperation({ summary: 'Obter progresso da sessão de serviço do paciente' })
  @ApiResponse({ status: 200, description: 'Progresso da sessão retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Progresso da sessão não encontrado.' })
  async getSessionProgress(
    @Param('patientProtocolId') patientProtocolId: string,
    @Param('protocolServiceId') protocolServiceId: string
  ) {
    const completedSessions = await this.patientServiceSessionsService.getCompletedSessionsCount(
      patientProtocolId,
      protocolServiceId
    );
    
    const totalSessions = await this.patientServiceSessionsService.getTotalSessionsCount(
      patientProtocolId,
      protocolServiceId
    );
    
    return {
      completed: completedSessions,
      total: totalSessions,
      progress: `${completedSessions}/${totalSessions}`
    };
  }
}