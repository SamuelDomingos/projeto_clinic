import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AttendanceSchedulesService } from './attendance-schedules.service';
import { AttendanceSchedule } from './entities/attendance-schedule.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('attendance-schedules')
@Controller('attendance-schedules')
export class AttendanceSchedulesController {
  constructor(private readonly attendanceSchedulesService: AttendanceSchedulesService) {}

  /**
   * @swagger
   * /attendance-schedules:
   *   post:
   *     summary: Cria um novo horário de atendimento
   *     tags: [AttendanceSchedules]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - doctorId
   *               - dayOfWeek
   *               - startTime
   *               - endTime
   *             properties:
   *               doctorId:
   *                 type: string
   *                 description: ID do médico
   *                 example: "1"
   *               dayOfWeek:
   *                 type: string
   *                 description: Dia da semana
   *                 example: "Monday"
   *               startTime:
   *                 type: string
   *                 description: Hora de início (HH:MM)
   *                 example: "09:00"
   *               endTime:
   *                 type: string
   *                 description: Hora de término (HH:MM)
   *                 example: "17:00"
   *     responses:
   *       201:
   *         description: Horário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "1"
   *                 doctorId:
   *                   type: string
   *                   example: "1"
   *                 dayOfWeek:
   *                   type: string
   *                   example: "Monday"
   *                 startTime:
   *                   type: string
   *                   example: "09:00"
   *                 endTime:
   *                   type: string
   *                   example: "17:00"
   *       400:
   *         description: Requisição inválida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Campos obrigatórios"
   *                 message:
   *                   type: string
   *                   example: "doctorId, dayOfWeek, startTime e endTime são obrigatórios"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Erro ao criar horário"
   *                 message:
   *                   type: string
   *                   example: "Ocorreu um erro ao criar o horário de atendimento"
   */
  @Post()
  @ApiOperation({ summary: 'Create a new attendance schedule', description: 'Cria um novo horário de atendimento. O corpo deve conter dados como dia da semana, hora de início e fim.' })
  @ApiBody({
    description: 'Dados do horário de atendimento',
    schema: {
      type: 'object',
      properties: {
        doctorId: { type: 'string', example: '1' },
        dayOfWeek: { type: 'string', example: 'Monday' },
        startTime: { type: 'string', example: '09:00' },
        endTime: { type: 'string', example: '17:00' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'O horário de atendimento foi criado com sucesso.', schema: { example: { id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' } } })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  create(@Body() data: Partial<AttendanceSchedule>) {
    return this.attendanceSchedulesService.create(data);
  }

  /**
   * @swagger
   * /attendance-schedules:
   *   get:
   *     summary: Lista todos os horários de atendimento
   *     tags: [AttendanceSchedules]
   *     responses:
   *       200:
   *         description: Lista de horários recuperada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     example: "1"
   *                   doctorId:
   *                     type: string
   *                     example: "1"
   *                   dayOfWeek:
   *                     type: string
   *                     example: "Monday"
   *                   startTime:
   *                     type: string
   *                     example: "09:00"
   *                   endTime:
   *                     type: string
   *                     example: "17:00"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Erro ao buscar horários"
   *                 message:
   *                   type: string
   *                   example: "Ocorreu um erro ao buscar os horários de atendimento"
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all attendance schedules', description: 'Recupera todos os horários de atendimento.' })
  @ApiResponse({ status: 200, description: 'Lista de horários recuperada com sucesso.', schema: { example: [{ id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }] } })
  findAll() {
    return this.attendanceSchedulesService.findAll();
  }

  /**
   * @swagger
   * /attendance-schedules/{id}:
   *   get:
   *     summary: Obtém um horário de atendimento pelo ID
   *     tags: [AttendanceSchedules]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do horário
   *     responses:
   *       200:
   *         description: Horário encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "1"
   *                 doctorId:
   *                   type: string
   *                   example: "1"
   *                 dayOfWeek:
   *                   type: string
   *                   example: "Monday"
   *                 startTime:
   *                   type: string
   *                   example: "09:00"
   *                 endTime:
   *                   type: string
   *                   example: "17:00"
   *       404:
   *         description: Horário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Horário não encontrado"
   *                 message:
   *                   type: string
   *                   example: "Não foi possível encontrar o horário com o ID fornecido"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Erro ao buscar horário"
   *                 message:
   *                   type: string
   *                   example: "Ocorreu um erro ao buscar o horário de atendimento"
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an attendance schedule by ID', description: 'Recupera um horário de atendimento específico pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do horário de atendimento', example: '1' })
  @ApiResponse({ status: 200, description: 'Horário encontrado.', schema: { example: { id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' } } })
  @ApiResponse({ status: 404, description: 'Horário não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.attendanceSchedulesService.findOne(id);
  }

  /**
   * @swagger
   * /attendance-schedules/{id}:
   *   patch:
   *     summary: Atualiza um horário de atendimento pelo ID
   *     tags: [AttendanceSchedules]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do horário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               startTime:
   *                 type: string
   *                 description: Nova hora de início (HH:MM)
   *                 example: "10:00"
   *               endTime:
   *                 type: string
   *                 description: Nova hora de término (HH:MM)
   *                 example: "18:00"
   *     responses:
   *       200:
   *         description: Horário atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "1"
   *                 doctorId:
   *                   type: string
   *                   example: "1"
   *                 dayOfWeek:
   *                   type: string
   *                   example: "Monday"
   *                 startTime:
   *                   type: string
   *                   example: "10:00"
   *                 endTime:
   *                   type: string
   *                   example: "18:00"
   *       400:
   *         description: Requisição inválida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Dados inválidos"
   *                 message:
   *                   type: string
   *                   example: "Verifique os dados enviados"
   *       404:
   *         description: Horário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Horário não encontrado"
   *                 message:
   *                   type: string
   *                   example: "Não foi possível encontrar o horário com o ID fornecido"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Erro ao atualizar horário"
   *                 message:
   *                   type: string
   *                   example: "Ocorreu um erro ao atualizar o horário de atendimento"
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance schedule by ID', description: 'Atualiza os dados de um horário de atendimento pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do horário de atendimento', example: '1' })
  @ApiBody({
    description: 'Novos dados do horário de atendimento',
    schema: {
      type: 'object',
      properties: {
        startTime: { type: 'string', example: '10:00' },
        endTime: { type: 'string', example: '18:00' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'O horário foi atualizado com sucesso.', schema: { example: { id: '1', doctorId: '1', dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00' } } })
  @ApiResponse({ status: 404, description: 'Horário não encontrado.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  update(@Param('id') id: string, @Body() data: Partial<AttendanceSchedule>) {
    return this.attendanceSchedulesService.update(id, data);
  }

  /**
   * @swagger
   * /attendance-schedules/{id}:
   *   delete:
   *     summary: Remove um horário de atendimento pelo ID
   *     tags: [AttendanceSchedules]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do horário
   *     responses:
   *       200:
   *         description: Horário removido com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Horário removido com sucesso"
   *       404:
   *         description: Horário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Horário não encontrado"
   *                 message:
   *                   type: string
   *                   example: "Não foi possível encontrar o horário com o ID fornecido"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Erro ao remover horário"
   *                 message:
   *                   type: string
   *                   example: "Ocorreu um erro ao remover o horário de atendimento"
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance schedule by ID', description: 'Remove um horário de atendimento pelo ID.' })
  @ApiParam({ name: 'id', description: 'ID do horário de atendimento', example: '1' })
  @ApiResponse({ status: 200, description: 'O horário foi removido com sucesso.', schema: { example: { message: 'Horário removido.' } } })
  @ApiResponse({ status: 404, description: 'Horário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.attendanceSchedulesService.remove(id);
  }
}