import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Autentica um usuário e retorna um token de acesso
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Endereço de e-mail do usuário.
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Senha do usuário.
   *                 example: strongpassword
   *     responses:
   *       200:
   *         description: Login bem-sucedido.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 access_token:
   *                   type: string
   *                   description: Token de acesso JWT.
   *       401:
   *         description: Credenciais inválidas.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Credenciais inválidas
   *       500:
   *         description: Erro interno do servidor.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Erro interno do servidor
   */
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

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Registra um novo usuário
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome do usuário.
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Endereço de e-mail do usuário.
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Senha do usuário.
   *                 example: strongpassword
   *     responses:
   *       201:
   *         description: Usuário registrado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Usuário registrado com sucesso
   *       400:
   *         description: Dados de registro inválidos.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Dados de registro inválidos
   *       500:
   *         description: Erro interno do servidor.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Erro interno do servidor
   */
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

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Obtém informações do usuário autenticado
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Informações do usuário.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "1"
   *                 name:
   *                   type: string
   *                   example: "John Doe"
   *                 email:
   *                   type: string
   *                   example: "john.doe@example.com"
   *       401:
   *         description: Não autorizado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Não autorizado
   *       500:
   *         description: Erro interno do servidor.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Erro interno do servidor
   */
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