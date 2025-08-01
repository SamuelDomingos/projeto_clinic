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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Kits')
@Controller('kits')
export class KitsController {
  constructor(private readonly kitsService: KitsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Criar um novo kit' })
  @ApiResponse({ status: 201, description: 'O kit foi criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async create(@Body() body: any) {
    return this.kitsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Obter todos os kits' })
  @ApiResponse({ status: 200, description: 'Kits retornados com sucesso.' })
  async findAll() {
    return this.kitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um kit por ID' })
  @ApiResponse({ status: 200, description: 'Kit retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Kit não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.kitsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar um kit por ID' })
  @ApiResponse({ status: 200, description: 'O kit foi atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Kit não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.kitsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remover um kit por ID' })
  @ApiResponse({ status: 200, description: 'O kit foi removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Kit não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.kitsService.remove(id);
  }

  @Post('remove-stock')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remover estoque de um kit' })
  @ApiResponse({ status: 200, description: 'Estoque do kit removido com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida ou usuário não autenticado.' })
  async removeKitStock(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    
    return this.kitsService.removeKitStock({
      ...body,
      userId,
    });
  }
}