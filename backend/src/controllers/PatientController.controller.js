const { Op } = require('sequelize');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { validationResult } = require('express-validator');

class PatientController {
  // CRUD Operations
  async getActivePatients(req, res) {
    try {
      const patients = await Patient.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']]
      });

      return res.json(patients);
    } catch (error) {
      console.error('Error listing patients:', error);
      return res.status(500).json({ error: 'Erro ao listar pacientes' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const patient = await Patient.findByPk(id);

      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      return res.json(patient);
    } catch (error) {
      console.error('Error getting patient:', error);
      return res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
  }

  async create(req, res) {
    try {
      const { 
        name, 
        email, 
        phone, 
        birthDate, 
        cpf,
        rg,
        address, 
        emergencyContact,
        profession,
        maritalStatus,
        bloodType,
        allergies,
        insurance
      } = req.body;

      // Verificar se já existe um paciente com o mesmo CPF
      const existingPatient = await Patient.findOne({ where: { cpf } });
      if (existingPatient) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }

      const patient = await Patient.create({
        name,
        email,
        phone,
        birthDate,
        cpf,
        rg,
        address,
        emergencyContact,
        profession,
        maritalStatus,
        bloodType,
        allergies: allergies || [],
        insurance,
        status: 'active'
      });

      return res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          details: error.errors.map(e => e.message)
        });
      }
      return res.status(500).json({ error: 'Erro ao criar paciente' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        email, 
        phone, 
        birthDate, 
        cpf,
        rg,
        address, 
        emergencyContact,
        profession,
        maritalStatus,
        bloodType,
        allergies,
        insurance,
        status 
      } = req.body;

      const patient = await Patient.findByPk(id);
      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      // Se o CPF está sendo alterado, verificar se já existe
      if (cpf && cpf !== patient.cpf) {
        const existingPatient = await Patient.findOne({ where: { cpf } });
        if (existingPatient) {
          return res.status(400).json({ error: 'CPF já cadastrado' });
        }
      }

      await patient.update({
        name: name || patient.name,
        email: email || patient.email,
        phone: phone || patient.phone,
        birthDate: birthDate || patient.birthDate,
        cpf: cpf || patient.cpf,
        rg: rg || patient.rg,
        address: address || patient.address,
        emergencyContact: emergencyContact || patient.emergencyContact,
        profession: profession || patient.profession,
        maritalStatus: maritalStatus || patient.maritalStatus,
        bloodType: bloodType || patient.bloodType,
        allergies: allergies || patient.allergies,
        insurance: insurance || patient.insurance,
        status: status || patient.status
      });

      return res.json(patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          details: error.errors.map(e => e.message)
        });
      }
      return res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const patient = await Patient.findByPk(id);
      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      await patient.update({ status: 'inactive' });
      return res.json({ message: 'Paciente desativado com sucesso' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      return res.status(500).json({ error: 'Erro ao desativar paciente' });
    }
  }

  // Specific Functionalities
  async getPatientWithHistory(req, res) {
    try {
      const patient = await Patient.findByPk(req.params.id, {
        include: [
          {
            model: MedicalRecord,
            order: [['date', 'DESC']]
          },
          {
            model: Appointment,
            order: [['date', 'DESC']]
          }
        ]
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching patient history' });
    }
  }

  async searchPatients(req, res) {
    try {
      const { name, status, startDate, endDate } = req.query;
      const where = {};

      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }

      if (status) {
        where.status = status;
      }

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const patients = await Patient.findAll({ where });
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Error searching patients' });
    }
  }

  async updateLastVisit(req, res) {
    try {
      const patient = await Patient.findByPk(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      await patient.update({
        lastVisit: new Date(),
        totalSessions: patient.totalSessions + 1
      });

      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Error updating last visit' });
    }
  }

  async getPatientStats(req, res) {
    try {
      const patient = await Patient.findByPk(req.params.id, {
        include: [
          {
            model: Appointment,
            attributes: ['status', 'date']
          },
          {
            model: MedicalRecord,
            attributes: ['type', 'date']
          }
        ]
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const stats = {
        totalAppointments: patient.Appointments.length,
        completedAppointments: patient.Appointments.filter(a => a.status === 'completed').length,
        totalRecords: patient.MedicalRecords.length,
        lastVisit: patient.lastVisit,
        totalSessions: patient.totalSessions
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching patient stats' });
    }
  }

  async uploadPatientPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const patient = await Patient.findByPk(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      await patient.update({
        photo: req.file.path
      });

      res.json({ message: 'Photo uploaded successfully', photo: req.file.path });
    } catch (error) {
      res.status(500).json({ error: 'Error uploading photo' });
    }
  }

  async addMedicalRecord(req, res) {
    try {
      const { type, description, date } = req.body;
      const patient = await Patient.findByPk(req.params.id);

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const record = await MedicalRecord.create({
        patientId: patient.id,
        type,
        description,
        date: date || new Date()
      });

      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error adding medical record' });
    }
  }
}

module.exports = new PatientController(); 