import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProtocolsService } from './protocols.service';
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

@ApiTags('Protocols')
@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo protocolo' })
  @ApiBody({
    description: 'Dados para criar um novo protocolo',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Protocolo de Atendimento Padrão' },
        description: { type: 'string', example: 'Descrição detalhada do protocolo.' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Protocolo criado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-protocol-1' },
        name: { type: 'string', example: 'Protocolo de Atendimento Padrão' },
        description: { type: 'string', example: 'Descrição detalhada do protocolo.' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() body: any) {
    return this.protocolsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista protocolos' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filtrar por nome do protocolo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de protocolos.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-protocol-1' },
          name: { type: 'string', example: 'Protocolo de Atendimento Padrão' },
          description: { type: 'string', example: 'Descrição detalhada do protocolo.' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll(@Query() query: any) {
    return this.protocolsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um protocolo pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do protocolo',
    type: String,
    example: 'uuid-protocol-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Protocolo encontrado.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-protocol-1' },
        name: { type: 'string', example: 'Protocolo de Atendimento Padrão' },
        description: { type: 'string', example: 'Descrição detalhada do protocolo.' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.protocolsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um protocolo pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do protocolo',
    type: String,
    example: 'uuid-protocol-1',
  })
  @ApiBody({
    description: 'Dados para atualizar o protocolo',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Protocolo de Atendimento Revisado' },
        description: { type: 'string', example: 'Nova descrição do protocolo.' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Protocolo atualizado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-protocol-1' },
        name: { type: 'string', example: 'Protocolo de Atendimento Revisado' },
        description: { type: 'string', example: 'Nova descrição do protocolo.' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.protocolsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um protocolo pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do protocolo',
    type: String,
    example: 'uuid-protocol-1',
  })
  @ApiResponse({ status: 200, description: 'Protocolo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.protocolsService.remove(id);
  }
}