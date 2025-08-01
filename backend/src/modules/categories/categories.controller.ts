import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém uma categoria pelo ID' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da categoria', type: 'string' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cria uma nova categoria' })
  @ApiResponse({ status: 201, description: 'A categoria foi criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiBody({ 
    description: 'Dados para criar uma nova categoria',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Exames de Rotina' },
        description: { type: 'string', example: 'Categoria para exames de rotina anuais' }
      }
    }
  })
  async create(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    return this.categoriesService.create(body, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma categoria existente' })
  @ApiResponse({ status: 200, description: 'A categoria foi atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiParam({ name: 'id', description: 'ID da categoria a ser atualizada', type: 'string' })
  @ApiBody({ 
    description: 'Dados para atualizar a categoria',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Exames Especializados' },
        description: { type: 'string', example: 'Nova descrição para a categoria' }
      }
    }
  })
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.id || null;
    return this.categoriesService.update(id, body, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui uma categoria' })
  @ApiResponse({ status: 200, description: 'A categoria foi excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @ApiParam({ name: 'id', description: 'ID da categoria a ser excluída', type: 'string' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}