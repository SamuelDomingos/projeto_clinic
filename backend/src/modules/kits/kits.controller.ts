import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { KitsService } from './kits.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Kits')
@Controller('kits')
export class KitsController {
  constructor(private readonly kitsService: KitsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Criar um novo kit',
    description: 'Cria um novo kit com produtos associados e suas quantidades'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'O kit foi criado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Kit Básico de Primeiros Socorros',
        description: 'Contém itens essenciais para pequenos ferimentos',
        products: [
          { productId: '60d0fe4f5e2a7b001c8e4a1c', quantity: 2 },
          { productId: '60d0fe4f5e2a7b001c8e4a1d', quantity: 1 }
        ],
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({
    description: 'Dados para criação do kit',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Kit Básico de Primeiros Socorros', description: 'Nome do kit' },
        description: { type: 'string', example: 'Contém itens essenciais para pequenos ferimentos', description: 'Descrição do kit' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1c', description: 'ID do produto' },
              quantity: { type: 'number', example: 2, description: 'Quantidade do produto no kit' }
            }
          }
        }
      },
      required: ['name', 'products']
    }
  })
  async create(@Body() body: any) {
    return this.kitsService.create(body);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obter todos os kits',
    description: 'Lista todos os kits disponíveis no sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kits retornados com sucesso.',
    schema: {
      example: [
        {
          id: '60d0fe4f5e2a7b001c8e4a1b',
          name: 'Kit Básico de Primeiros Socorros',
          description: 'Contém itens essenciais para pequenos ferimentos',
          products: [
            { productId: '60d0fe4f5e2a7b001c8e4a1c', quantity: 2 }
          ]
        }
      ]
    }
  })
  async findAll() {
    return this.kitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter um kit por ID',
    description: 'Retorna os detalhes completos de um kit específico'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kit retornado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Kit Básico de Primeiros Socorros',
        description: 'Contém itens essenciais para pequenos ferimentos',
        products: [
          { productId: '60d0fe4f5e2a7b001c8e4a1c', quantity: 2 },
          { productId: '60d0fe4f5e2a7b001c8e4a1d', quantity: 1 }
        ],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Kit não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do kit', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async findOne(@Param('id') id: string) {
    return this.kitsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Atualizar um kit por ID',
    description: 'Atualiza os dados de um kit existente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'O kit foi atualizado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Kit Básico de Primeiros Socorros Atualizado',
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Kit não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiParam({ name: 'id', description: 'ID do kit', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização do kit',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Kit Básico de Primeiros Socorros Atualizado', description: 'Novo nome do kit' },
        description: { type: 'string', example: 'Nova descrição do kit', description: 'Nova descrição do kit' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1c', description: 'ID do produto' },
              quantity: { type: 'number', example: 3, description: 'Nova quantidade do produto no kit' }
            }
          }
        }
      }
    }
  })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.kitsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Remover um kit por ID',
    description: 'Remove um kit do sistema (apenas se não estiver em uso)'
  })
  @ApiResponse({ status: 200, description: 'O kit foi removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Kit não encontrado.' })
  @ApiResponse({ status: 400, description: 'Não é possível remover kit em uso.' })
  @ApiParam({ name: 'id', description: 'ID do kit', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async remove(@Param('id') id: string) {
    return this.kitsService.remove(id);
  }

  @Post('remove-stock')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Remover estoque de um kit',
    description: 'Remove uma quantidade específica de um kit do estoque, registrando o usuário que realizou a operação.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estoque do kit removido com sucesso.',
    schema: {
      example: {
        kitId: '60d0fe4f5e2a7b001c8e4a1b',
        quantityRemoved: 1,
        newStock: 9,
        userId: '60d0fe4f5e2a7b001c8e4a20'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida ou usuário não autenticado.' })
  @ApiBody({
    description: 'Dados para remoção de estoque do kit',
    schema: {
      type: 'object',
      properties: {
        kitId: { type: 'string', example: '60d0fe4f5e2a7b001c8e4a1b', description: 'ID do kit' },
        quantity: { type: 'number', example: 1, description: 'Quantidade a ser removida do estoque' }
      },
      required: ['kitId', 'quantity']
    }
  })
  async removeKitStock(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    
    return this.kitsService.removeKitStock({
      ...body,
      userId,
    });
  }
}