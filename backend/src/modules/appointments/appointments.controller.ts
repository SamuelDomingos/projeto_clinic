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
import { AppointmentsService } from './appointments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * @swagger
   * /appointments:
   *   post:
   *     summary: Cria um novo agendamento
   *     tags: [Appointments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patient
   *               - doctor
   *               - date
   *               - time
   *             properties:
   *               patient:
   *                 type: string
   *                 description: Nome do paciente
   *                 example: João Silva
   *               doctor:
   *                 type: string
   *                 description: Nome do médico
   *                 example: Dra. Maria
   *               date:
   *                 type: string
   *                 format: date
   *                 description: Data do agendamento (YYYY-MM-DD)
   *                 example: 2024-06-01
   *               time:
   *                 type: string
   *                 description: Hora do agendamento (HH:MM)
   *                 example: 14:00
   *     responses:
   *       201:
   *         description: Agendamento criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: 1
   *                 patient:
   *                   type: string
   *                   example: João Silva
   *                 doctor:
   *                   type: string
   *                   example: Dra. Maria
   *                 date:
   *                   type: string
   *                   example: 2024-06-01
   *                 time:
   *                   type: string
   *                   example: 14:00
   *       400:
   *         description: Requisição inválida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Campos obrigatórios
   *                 message:
   *                   type: string
   *                   example: Paciente, médico, data e hora são obrigatórios
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Erro ao criar agendamento
   *                 message:
   *                   type: string
   *                   example: Ocorreu um erro ao criar o agendamento
   */
  @Post()
  @ApiOperation({ summary: 'Create a new appointment', description: 'Cria um novo agendamento. O corpo deve conter os dados do paciente, médico, data e hora.' })
  @ApiBody({
    description: 'Dados do agendamento',
    schema: {
      example: {
        patient: 'João Silva',
        doctor: 'Dra. Maria',
        date: '2024-06-01',
        time: '14:00'
      }
    }
  })
  @ApiResponse({ status: 201, description: 'O agendamento foi criado com sucesso.', schema: { example: { id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '14:00' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida. Verifique os dados enviados.' })
  async create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  /**
   * @swagger
   * /appointments:
   *   get:
   *     summary: Lista todos os agendamentos
   *     tags: [Appointments]
   *     parameters:
   *       - in: query
   *         name: patient
   *         schema:
   *           type: string
   *         description: Filtro por nome do paciente
   *       - in: query
   *         name: doctor
   *         schema:
   *           type: string
   *         description: Filtro por nome do médico
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtro por data (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Lista de agendamentos recuperada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     example: 1
   *                   patient:
   *                     type: string
   *                     example: João Silva
   *                   doctor:
   *                     type: string
   *                     example: Dra. Maria
   *                   date:
   *                     type: string
   *                     example: 2024-06-01
   *                   time:
   *                     type: string
   *                     example: 14:00
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Erro ao buscar agendamentos
   *                 message:
   *                   type: string
   *                   example: Ocorreu um erro ao buscar os agendamentos
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all appointments', description: 'Recupera todos os agendamentos. Pode receber filtros via query params.' })
  @ApiQuery({ name: 'patient', required: false, description: 'Filtrar por nome do paciente' })
  @ApiQuery({ name: 'doctor', required: false, description: 'Filtrar por nome do médico' })
  @ApiQuery({ name: 'date', required: false, description: 'Filtrar por data (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos recuperada com sucesso.', schema: { example: [{ id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '14:00' }] } })
  async findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  /**
   * @swagger
   * /appointments/{id}:
   *   get:
   *     summary: Obtém um agendamento pelo ID
   *     tags: [Appointments]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do agendamento
   *     responses:
   *       200:
   *         description: Agendamento encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: 1
   *                 patient:
   *                   type: string
   *                   example: João Silva
   *                 doctor:
   *                   type: string
   *                   example: Dra. Maria
   *                 date:
   *                   type: string
   *                   example: 2024-06-01
   *                 time:
   *                   type: string
   *                   example: 14:00
   *       404:
   *         description: Agendamento não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Agendamento não encontrado
   *                 message:
   *                   type: string
   *                   example: Não foi possível encontrar o agendamento com o ID fornecido
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Erro ao buscar agendamento
   *                 message:
   *                   type: string
   *                   example: Ocorreu um erro ao buscar o agendamento
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an appointment by ID', description: 'Recupera um agendamento específico pelo seu ID.' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: '1' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado.', schema: { example: { id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '14:00' } } })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /**
   * @swagger
   * /appointments/{id}:
   *   put:
   *     summary: Atualiza um agendamento pelo ID
   *     tags: [Appointments]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do agendamento
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               patient:
   *                 type: string
   *                 description: Novo nome do paciente
   *                 example: João Silva
   *               doctor:
   *                 type: string
   *                 description: Novo nome do médico
   *                 example: Dra. Maria
   *               date:
   *                 type: string
   *                 format: date
   *                 description: Nova data do agendamento (YYYY-MM-DD)
   *                 example: 2024-06-01
   *               time:
   *                 type: string
   *                 description: Nova hora do agendamento (HH:MM)
   *                 example: 15:00
   *     responses:
   *       200:
   *         description: Agendamento atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: 1
   *                 patient:
   *                   type: string
   *                   example: João Silva
   *                 doctor:
   *                   type: string
   *                   example: Dra. Maria
   *                 date:
   *                   type: string
   *                   example: 2024-06-01
   *                 time:
   *                   type: string
   *                   example: 15:00
   *       400:
   *         description: Requisição inválida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Dados inválidos
   *                 message:
   *                   type: string
   *                   example: Verifique os dados enviados
   *       404:
   *         description: Agendamento não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Agendamento não encontrado
   *                 message:
   *                   type: string
   *                   example: Não foi possível encontrar o agendamento com o ID fornecido
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Erro ao atualizar agendamento
   *                 message:
   *                   type: string
   *                   example: Ocorreu um erro ao atualizar o agendamento
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update an appointment by ID', description: 'Atualiza os dados de um agendamento existente pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: '1' })
  @ApiBody({
    description: 'Novos dados do agendamento',
    schema: {
      example: {
        patient: 'João Silva',
        doctor: 'Dra. Maria',
        date: '2024-06-01',
        time: '15:00'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'O agendamento foi atualizado com sucesso.', schema: { example: { id: '1', patient: 'João Silva', doctor: 'Dra. Maria', date: '2024-06-01', time: '15:00' } } })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(id, body);
  }

  /**
   * @swagger
   * /appointments/{id}:
   *   delete:
   *     summary: Remove um agendamento pelo ID
   *     tags: [Appointments]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do agendamento
   *     responses:
   *       200:
   *         description: Agendamento removido com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Agendamento removido com sucesso
   *       404:
   *         description: Agendamento não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Agendamento não encontrado
   *                 message:
   *                   type: string
   *                   example: Não foi possível encontrar o agendamento com o ID fornecido
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Erro ao remover agendamento
   *                 message:
   *                   type: string
   *                   example: Ocorreu um erro ao remover o agendamento
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment by ID', description: 'Remove um agendamento pelo seu ID.' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: '1' })
  @ApiResponse({ status: 200, description: 'O agendamento foi removido com sucesso.', schema: { example: { message: 'Agendamento removido.' } } })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}