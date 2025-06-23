const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

class AppointmentController {
  // Criar novo agendamento
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { patientId, doctorId, date, startTime, duration, procedure, notes } = req.body;

      // Verificar se o horário está disponível
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          date,
          startTime,
          status: {
            [Op.notIn]: ['cancelled']
          }
        }
      });

      if (existingAppointment) {
        return res.status(400).json({ error: 'Horário já está ocupado' });
      }

      const appointment = await Appointment.create({
        patientId,
        doctorId,
        date,
        startTime,
        duration,
        procedure,
        notes,
        status: 'scheduled'
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }

  // Listar agendamentos
  static async list(req, res) {
    try {
      const { startDate, endDate, doctorId, patientId, status } = req.query;
      
      const where = {};
      
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;
      if (status) where.status = status;

      const appointments = await Appointment.findAll({
        where,
        include: [
          {
            model: Patient,
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['date', 'ASC'], ['startTime', 'ASC']]
      });

      res.json(appointments);
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  // Atualizar agendamento
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { date, startTime, duration, procedure, status, notes } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Se estiver mudando a data/hora, verificar disponibilidade
      if (date && startTime) {
        const existingAppointment = await Appointment.findOne({
          where: {
            doctorId: appointment.doctorId,
            date,
            startTime,
            id: { [Op.ne]: id },
            status: {
              [Op.notIn]: ['cancelled']
            }
          }
        });

        if (existingAppointment) {
          return res.status(400).json({ error: 'Horário já está ocupado' });
        }
      }

      await appointment.update({
        date: date || appointment.date,
        startTime: startTime || appointment.startTime,
        duration: duration || appointment.duration,
        procedure: procedure || appointment.procedure,
        status: status || appointment.status,
        notes: notes || appointment.notes
      });

      res.json(appointment);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
  }

  // Cancelar agendamento
  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      await appointment.update({
        status: 'cancelled',
        notes: reason ? `${appointment.notes}\nCancelado: ${reason}` : appointment.notes
      });

      res.json(appointment);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      res.status(500).json({ error: 'Erro ao cancelar agendamento' });
    }
  }

  // Confirmar agendamento
  static async confirm(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      await appointment.update({ status: 'confirmed' });
      res.json(appointment);
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      res.status(500).json({ error: 'Erro ao confirmar agendamento' });
    }
  }

  // Completar agendamento
  static async complete(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      await appointment.update({
        status: 'completed',
        notes: notes ? `${appointment.notes}\nConcluído: ${notes}` : appointment.notes
      });

      res.json(appointment);
    } catch (error) {
      console.error('Erro ao completar agendamento:', error);
      res.status(500).json({ error: 'Erro ao completar agendamento' });
    }
  }
}

module.exports = AppointmentController; 