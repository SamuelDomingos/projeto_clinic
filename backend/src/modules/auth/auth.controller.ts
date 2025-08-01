import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário e retorna um token de acesso' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiBody({
    description: 'Credenciais de login',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'strongpassword' },
      },
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de registro inválidos.' })
  @ApiBody({
    description: 'Dados de registro do usuário',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'strongpassword' },
      },
    },
  })
  async register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth() // Adiciona a indicação de que este endpoint requer um token de autenticação
  @ApiOperation({ summary: 'Obtém informações do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Informações do usuário.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async me(@Request() req) {
    return this.authService.me(req.user.id);
  }
}