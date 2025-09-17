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
import { ProtocolServicesService } from './protocol-services.service'; 
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiProperty, // Import ApiProperty
} from '@nestjs/swagger';

// Define a classe para o corpo da requisição de criação de serviço de protocolo diretamente aqui
class CreateProtocolServiceBody {
  @ApiProperty({ description: 'ID do serviço', example: '654321098765432109876543' })
  serviceId: string;

  @ApiProperty({ description: 'ID do paciente', example: '123456789012345678901234' })
  patientId: string;

  @ApiProperty({ description: 'Data do protocolo', example: '2023-10-27T10:00:00Z' })
  protocolDate: Date;

  @ApiProperty({ description: 'Observações do protocolo', example: 'Protocolo inicial para tratamento X' })
  observations: string;
}

// Define a classe para o corpo da requisição de atualização de serviço de protocolo diretamente aqui
class UpdateProtocolServiceBody {
  @ApiProperty({ description: 'ID do serviço', example: '654321098765432109876543', required: false })
  serviceId?: string;

  @ApiProperty({ description: 'ID do paciente', example: '123456789012345678901234', required: false })
  patientId?: string;

  @ApiProperty({ description: 'Data do protocolo', example: '2023-10-27T10:00:00Z', required: false })
  protocolDate?: Date;

  @ApiProperty({ description: 'Observações do protocolo', example: 'Observações atualizadas', required: false })
  observations?: string;
}

@ApiTags('Protocol Services')
@Controller('protocol-services')
export class ProtocolServicesController {
  constructor(private readonly protocolServicesService: ProtocolServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo serviço de protocolo' })
  @ApiBody({
    type: CreateProtocolServiceBody, // Usando a classe definida localmente
    description: 'Dados para criar um novo serviço de protocolo',
    examples: {
      example1: {
        value: {
          serviceId: '654321098765432109876543',
          patientId: '123456789012345678901234',
          protocolDate: '2023-10-27T10:00:00Z',
          observations: 'Protocolo inicial para tratamento X',
        },
        summary: 'Exemplo de criação de serviço de protocolo',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Serviço de protocolo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() body: any) { // O tipo 'any' é mantido aqui para não forçar o uso de DTOs no código
    return this.protocolServicesService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços de protocolo' })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    type: String,
    description: 'Filtrar serviços de protocolo pelo ID do serviço',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    type: String,
    description: 'Filtrar serviços de protocolo pelo ID do paciente',
  })
  @ApiResponse({ status: 200, description: 'Lista de serviços de protocolo retornada com sucesso.' })
  async findAll(@Query() query: any) {
    return this.protocolServicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço de protocolo por ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do serviço de protocolo a ser buscado',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Serviço de protocolo retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Serviço de protocolo não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.protocolServicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar serviço de protocolo por ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do serviço de protocolo a ser atualizado',
    type: String,
  })
  @ApiBody({
    type: UpdateProtocolServiceBody, // Usando a classe definida localmente
    description: 'Dados para atualizar o serviço de protocolo',
    examples: {
      example1: {
        value: {
          observations: 'Observações atualizadas para o protocolo X',
        },
        summary: 'Exemplo de atualização de serviço de protocolo',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Serviço de protocolo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Serviço de protocolo não encontrado.' })
  async update(@Param('id') id: string, @Body() body: any) { // O tipo 'any' é mantido aqui para não forçar o uso de DTOs no código
    return this.protocolServicesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover serviço de protocolo por ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do serviço de protocolo a ser removido',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Serviço de protocolo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Serviço de protocolo não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.protocolServicesService.remove(id);
  }
}