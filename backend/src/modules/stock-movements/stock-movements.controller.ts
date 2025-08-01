import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Stock Movements')
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo movimento de estoque' })
  @ApiResponse({ status: 201, description: 'Movimento de estoque criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Usuário não autenticado ou dados inválidos.' })
  @UseGuards(AuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    console.log('req.user:', req.user);
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    return this.stockMovementsService.create(body, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista movimentos de estoque' })
  @ApiResponse({ status: 200, description: 'Lista de movimentos de estoque.' })
  async findAll(@Query() query: any) {
    return this.stockMovementsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um movimento de estoque pelo ID' })
  @ApiResponse({ status: 200, description: 'Movimento de estoque encontrado.' })
  @ApiResponse({ status: 404, description: 'Movimento de estoque não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um movimento de estoque pelo ID' })
  @ApiResponse({ status: 200, description: 'Movimento de estoque atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Movimento de estoque não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.stockMovementsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um movimento de estoque pelo ID' })
  @ApiResponse({ status: 200, description: 'Movimento de estoque removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Movimento de estoque não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.stockMovementsService.remove(id);
  }
}