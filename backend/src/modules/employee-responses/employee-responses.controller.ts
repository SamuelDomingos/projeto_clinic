import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EmployeeResponsesService } from './employee-responses.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('employee-responses')
@Controller('employee-responses')
export class EmployeeResponsesController {
  constructor(private readonly service: EmployeeResponsesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém todas as respostas dos funcionários' })
  @ApiResponse({ status: 200, description: 'Lista de respostas dos funcionários.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém uma resposta de funcionário pelo ID' })
  @ApiResponse({ status: 200, description: 'Resposta do funcionário encontrada.' })
  @ApiResponse({ status: 404, description: 'Resposta do funcionário não encontrada.' })
  findOne(@Param('id') id: string) { // Alterado de number para string
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova resposta de funcionário' })
  @ApiResponse({ status: 201, description: 'A resposta do funcionário foi criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma resposta de funcionário existente' })
  @ApiResponse({ status: 200, description: 'A resposta do funcionário foi atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Resposta do funcionário não encontrada.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui uma resposta de funcionário' })
  @ApiResponse({ status: 200, description: 'A resposta do funcionário foi excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Resposta do funcionário não encontrada.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtém estatísticas das respostas dos funcionários' })
  @ApiResponse({ status: 200, description: 'Estatísticas das respostas dos funcionários.' })
  getStatistics() {
    return this.service.getStatistics();
  }
}