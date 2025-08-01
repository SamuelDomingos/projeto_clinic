import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SupplierValidationPipe } from './pipes/supplier-validation.pipe';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo fornecedor' })
  @ApiResponse({ status: 201, description: 'Fornecedor criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @UsePipes(SupplierValidationPipe)
  async create(@Body() body: any) {
    return this.suppliersService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um fornecedor pelo ID' })
  @ApiResponse({ status: 200, description: 'Fornecedor encontrado.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um fornecedor pelo ID' })
  @ApiResponse({ status: 200, description: 'Fornecedor atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  @UsePipes(SupplierValidationPipe)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um fornecedor pelo ID' })
  @ApiResponse({ status: 200, description: 'Fornecedor removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista e busca fornecedores' })
  @ApiResponse({ status: 200, description: 'Lista de fornecedores.' })
  async search(@Query() query: any) {
    return this.suppliersService.search(query);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualiza o status de um fornecedor' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.suppliersService.updateStatus(id, status);
  }
}