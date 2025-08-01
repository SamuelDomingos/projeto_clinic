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
import { ServicesService } from './services.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiProperty, // Import ApiProperty
} from '@nestjs/swagger';

// Define a classe para o corpo da requisição de criação de serviço diretamente aqui
class CreateServiceBody {
  @ApiProperty({ description: 'Nome do serviço', example: 'Consulta Médica' })
  name: string;

  @ApiProperty({ description: 'Descrição do serviço', example: 'Consulta geral com um médico' })
  description: string;

  @ApiProperty({ description: 'Preço do serviço', example: 150.00 })
  price: number;
}

// Define a classe para o corpo da requisição de atualização de serviço diretamente aqui
class UpdateServiceBody {
  @ApiProperty({ description: 'Nome do serviço', example: 'Consulta Médica Atualizada', required: false })
  name?: string;

  @ApiProperty({ description: 'Descrição do serviço', example: 'Nova descrição do serviço', required: false })
  description?: string;

  @ApiProperty({ description: 'Preço do serviço', example: 160.00, required: false })
  price?: number;
}

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo serviço' })
  @ApiBody({
    type: CreateServiceBody, // Usando a classe definida localmente
    description: 'Dados para criar um novo serviço',
    examples: {
      example1: {
        value: {
          name: 'Consulta Médica',
          description: 'Consulta geral com um médico',
          price: 150.00,
        },
        summary: 'Exemplo de criação de serviço',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() body: any) { // O tipo 'any' é mantido aqui para não forçar o uso de DTOs no código
    return this.servicesService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista serviços' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filtrar serviços pelo nome',
  })
  @ApiQuery({
    name: 'price',
    required: false,
    type: Number,
    description: 'Filtrar serviços pelo preço',
  })
  @ApiResponse({ status: 200, description: 'Lista de serviços.' })
  async findAll(@Query() query: any) {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um serviço pelo ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do serviço a ser buscado',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Serviço encontrado.' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um serviço pelo ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do serviço a ser atualizado',
    type: String,
  })
  @ApiBody({
    type: UpdateServiceBody, // Usando a classe definida localmente
    description: 'Dados para atualizar o serviço',
    examples: {
      example1: {
        value: {
          name: 'Consulta Médica Atualizada',
          price: 160.00,
        },
        summary: 'Exemplo de atualização de serviço',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) { // O tipo 'any' é mantido aqui para não forçar o uso de DTOs no código
    return this.servicesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um serviço pelo ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do serviço a ser removido',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Serviço removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
