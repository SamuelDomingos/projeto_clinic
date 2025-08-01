import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { IAAnalysesService } from './ia-analyses.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('IA Analyses')
@Controller('ia-analyses')
export class IAAnalysesController {
  constructor(private readonly service: IAAnalysesService) {}

  @Get()
  @ApiOperation({ summary: 'Obter todas as análises de IA' })
  @ApiResponse({ status: 200, description: 'Análises de IA retornadas com sucesso.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma análise de IA por ID' })
  @ApiResponse({ status: 200, description: 'Análise de IA retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Análise de IA não encontrada.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova análise de IA' })
  @ApiResponse({ status: 201, description: 'A análise de IA foi criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma análise de IA por ID' })
  @ApiResponse({ status: 200, description: 'A análise de IA foi atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Análise de IA não encontrada.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma análise de IA por ID' })
  @ApiResponse({ status: 200, description: 'A análise de IA foi removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Análise de IA não encontrada.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}