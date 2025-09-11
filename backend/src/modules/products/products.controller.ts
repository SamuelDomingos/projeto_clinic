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
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo produto',
    description: 'Cria um novo produto no sistema com informações detalhadas'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Produto criado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Produto Médico A',
        description: 'Descrição detalhada do produto',
        price: 99.99,
        category: 'Medicamentos',
        stock: 100,
        sku: 'PROD-001',
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({
    description: 'Dados para criação do produto',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Produto Médico A', description: 'Nome do produto' },
        description: { type: 'string', example: 'Descrição detalhada do produto' },
        price: { type: 'number', example: 99.99, description: 'Preço do produto' },
        category: { type: 'string', example: 'Medicamentos', description: 'Categoria do produto' },
        stock: { type: 'number', example: 100, description: 'Quantidade em estoque' },
        sku: { type: 'string', example: 'PROD-001', description: 'Código SKU do produto' },
        supplier: { type: 'string', example: 'Fornecedor ABC', description: 'Nome do fornecedor' },
        minStock: { type: 'number', example: 10, description: 'Estoque mínimo' }
      },
      required: ['name', 'price', 'category']
    }
  })
  async create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os produtos',
    description: 'Lista todos os produtos com opções de filtro e paginação'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de produtos retornada com sucesso.',
    schema: {
      example: {
        data: [
          {
            id: '60d0fe4f5e2a7b001c8e4a1b',
            name: 'Produto Médico A',
            price: 99.99,
            category: 'Medicamentos',
            stock: 100,
            sku: 'PROD-001'
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros por página', example: 10 })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filtrar por nome do produto' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Preço mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Preço máximo' })
  async findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar produto por ID',
    description: 'Retorna os detalhes completos de um produto específico'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Produto retornado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Produto Médico A',
        description: 'Descrição detalhada do produto',
        price: 99.99,
        category: 'Medicamentos',
        stock: 100,
        sku: 'PROD-001',
        supplier: 'Fornecedor ABC',
        minStock: 10,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar produto por ID',
    description: 'Atualiza os dados de um produto existente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Produto atualizado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Produto Médico A Atualizado',
        price: 109.99,
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização do produto',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Produto Médico A Atualizado' },
        description: { type: 'string', example: 'Nova descrição do produto' },
        price: { type: 'number', example: 109.99 },
        category: { type: 'string', example: 'Medicamentos' },
        stock: { type: 'number', example: 150 },
        supplier: { type: 'string', example: 'Novo Fornecedor' },
        minStock: { type: 'number', example: 15 }
      }
    }
  })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remover produto por ID',
    description: 'Remove um produto do sistema (apenas se não estiver em uso)'
  })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @ApiResponse({ status: 400, description: 'Não é possível remover produto em uso.' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}