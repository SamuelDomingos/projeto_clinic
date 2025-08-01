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
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova permissão' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso.' })
  async create(@Body() body: any) {
    return this.permissionsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiResponse({ status: 200, description: 'Lista de permissões retornada com sucesso.' })
  async findAll(@Query() query: any) {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar permissão por ID' })
  @ApiResponse({ status: 200, description: 'Permissão retornada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar permissão por ID' })
  @ApiResponse({ status: 200, description: 'Permissão atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.permissionsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover permissão por ID' })
  @ApiResponse({ status: 200, description: 'Permissão removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}