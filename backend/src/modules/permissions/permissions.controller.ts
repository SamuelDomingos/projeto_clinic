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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova permissão' })
  @ApiBody({
    description: 'Dados para criar uma nova permissão',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'admin' },
        description: { type: 'string', example: 'Permissão de administrador' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Permissão criada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-permission-1' },
        name: { type: 'string', example: 'admin' },
        description: { type: 'string', example: 'Permissão de administrador' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async create(@Body() body: any) {
    return this.permissionsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filtrar por nome da permissão',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-permission-1' },
          name: { type: 'string', example: 'admin' },
          description: {
            type: 'string',
            example: 'Permissão de administrador',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll(@Query() query: any) {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar permissão por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da permissão',
    type: String,
    example: 'uuid-permission-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissão retornada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-permission-1' },
        name: { type: 'string', example: 'admin' },
        description: { type: 'string', example: 'Permissão de administrador' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar permissão por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da permissão',
    type: String,
    example: 'uuid-permission-1',
  })
  @ApiBody({
    description: 'Dados para atualizar a permissão',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'super-admin' },
        description: {
          type: 'string',
          example: 'Permissão de super administrador',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permissão atualizada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-permission-1' },
        name: { type: 'string', example: 'super-admin' },
        description: {
          type: 'string',
          example: 'Permissão de super administrador',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.permissionsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover permissão por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da permissão',
    type: String,
    example: 'uuid-permission-1',
  })
  @ApiResponse({ status: 200, description: 'Permissão removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}