import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({
    description: 'Dados para criação de um novo usuário',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Jane Doe' },
        email: { type: 'string', example: 'jane.doe@example.com' },
        password: { type: 'string', example: 'securepassword123' },
      },
      required: ['name', 'email', 'password'],
    },
  })
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários retornada com sucesso.',
    schema: {
      example: [
        {
          id: '60d0fe4f5e2a7b001c8e4a1b',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '60d0fe4f5e2a7b001c8e4a1c',
          name: 'John Smith',
          email: 'john.smith@example.com',
          createdAt: '2024-01-15T10:35:00Z'
        }
      ]
    }
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de usuários por página' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Deslocamento para paginação' })
  async findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário encontrado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um usuário existente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário atualizado com sucesso.',
    schema: {
      example: {
        id: '60d0fe4f5e2a7b001c8e4a1b',
        name: 'Jane Doe Updated',
        email: 'jane.doe.updated@example.com',
        updatedAt: '2024-01-15T11:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser atualizado', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @ApiBody({
    description: 'Dados para atualização do usuário',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Jane Doe Updated' },
        email: { type: 'string', example: 'jane.doe.updated@example.com' },
        password: { type: 'string', example: 'newsecurepassword123' },
      },
      // Não são todos os campos que são obrigatórios na atualização
    },
  })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser removido', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Faz upload da foto do usuário' })
  @ApiResponse({ status: 200, description: 'Foto atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: String, example: '60d0fe4f5e2a7b001c8e4a1b' })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadPhoto(@Param('id') id: string, @UploadedFile() file: any) {
    return this.usersService.uploadPhoto(id, file.filename);
  }
}