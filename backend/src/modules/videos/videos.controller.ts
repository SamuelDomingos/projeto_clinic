import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { VideosService } from './videos.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly service: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os vídeos' })
  @ApiResponse({ status: 200, description: 'Lista de vídeos retornada com sucesso.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um vídeo pelo ID' })
  @ApiResponse({ status: 200, description: 'Vídeo encontrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Vídeo não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo vídeo' })
  @ApiResponse({ status: 201, description: 'Vídeo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um vídeo existente' })
  @ApiResponse({ status: 200, description: 'Vídeo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Vídeo não encontrado.' })
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um vídeo' })
  @ApiResponse({ status: 200, description: 'Vídeo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Vídeo não encontrado.' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}