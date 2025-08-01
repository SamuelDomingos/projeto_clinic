import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { VideoWatchesService } from './video-watches.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('video-watches')
@Controller('video-watches')
export class VideoWatchesController {
  constructor(private readonly service: VideoWatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os registros de visualização de vídeos' })
  @ApiResponse({ status: 200, description: 'Lista de registros retornada com sucesso.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um registro de visualização de vídeo pelo ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo registro de visualização de vídeo' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um registro de visualização de vídeo existente' })
  @ApiResponse({ status: 200, description: 'Registro atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado.' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um registro de visualização de vídeo' })
  @ApiResponse({ status: 200, description: 'Registro removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}