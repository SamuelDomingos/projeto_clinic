import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ScheduleConfigService } from './schedule-config.service';
import { ScheduleConfig } from './schedule-config.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Schedule Config')
@Controller('schedule/config')
export class ScheduleConfigController {
  constructor(private readonly service: ScheduleConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as configurações de agenda' })
  @ApiResponse({ status: 200, description: 'Lista de configurações.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca configuração de agenda pelo ID' })
  @ApiResponse({ status: 200, description: 'Configuração encontrada.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova configuração de agenda' })
  @ApiResponse({ status: 201, description: 'Configuração criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: Partial<ScheduleConfig>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma configuração de agenda pelo ID' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  update(@Param('id') id: string, @Body() dto: Partial<ScheduleConfig>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma configuração de agenda pelo ID' })
  @ApiResponse({ status: 200, description: 'Configuração removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}