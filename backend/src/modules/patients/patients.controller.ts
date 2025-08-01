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
}