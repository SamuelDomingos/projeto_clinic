import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiResponse({ status: 201, description: 'Protocolo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() body: any) {
    return this.protocolsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista protocolos' })
  @ApiResponse({ status: 200, description: 'Lista de protocolos.' })
  async findAll(@Query() query: any) {
    return this.protocolsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um protocolo pelo ID' })
  @ApiResponse({ status: 200, description: 'Protocolo encontrado.' })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.protocolsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um protocolo pelo ID' })
  @ApiResponse({ status: 200, description: 'Protocolo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.protocolsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um protocolo pelo ID' })
  @ApiResponse({ status: 200, description: 'Protocolo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Protocolo não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.protocolsService.remove(id);
  }
}