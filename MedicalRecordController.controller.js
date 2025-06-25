const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class MedicalRecordController {
  static async createRecord(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recordData = {
        ...req.body,
        doctorId: req.user?.id || req.body.doctorId,
        createdBy: req.user?.id || req.body.createdBy
      };

      const record = await MedicalRecord.create(recordData);
      
      const createdRecord = await MedicalRecord.findByPk(record.id, {
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id'] },
          { model: User, as: 'doctor', attributes: ['name', 'id'] }
        ]
      });

      res.status(201).json(createdRecord);
    } catch (error) {
      console.error('Error creating medical record:', error);
      res.status(500).json({ error: 'Error creating medical record' });
    }
  }

  static async getRecordById(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.id, {
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id', 'birthDate', 'gender'] },
          { model: User, as: 'doctor', attributes: ['name', 'id'] }
        ]
      });
      
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      // Verificar se o registro é privado e se o usuário tem permissão
      if (record.isPrivate && record.createdBy !== req.user?.id) {
        return res.status(403).json({ error: 'Access denied to private record' });
      }

      res.json(record);
    } catch (error) {
      console.error('Error fetching medical record:', error);
      res.status(500).json({ error: 'Error fetching medical record' });
    }
  }

  static async getAllRecords(req, res) {
    try {
      const { 
        patientId, 
        doctorId, 
        recordCategory, 
        isPrivate, 
        startDate, 
        endDate
      } = req.query;
      
      const where = {};
      
      if (patientId) {
        where.patientId = patientId;
      }
      
      if (doctorId) {
        where.doctorId = doctorId;
      }
      
      if (recordCategory) {
        where.recordCategory = recordCategory;
      }
      
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      // Filtrar registros privados baseado no usuário
      if (req.user) {
        where[Op.or] = [
          { isPrivate: false },
          { createdBy: req.user.id }
        ];
      } else {
        where.isPrivate = false;
      }

      const records = await MedicalRecord.findAll({
        where,
        order: [['date', 'DESC']],
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id'] },
          { model: User, as: 'doctor', attributes: ['name', 'id'] }
        ]
      });

      res.json(records);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      res.status(500).json({ error: 'Error fetching medical records' });
    }
  }

  static async updateRecord(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      // Verificar permissão para editar
      if (record.createdBy && record.createdBy !== req.user?.id) {
        return res.status(403).json({ error: 'Access denied to edit this record' });
      }

      await record.update(req.body);
      
      const updatedRecord = await MedicalRecord.findByPk(record.id, {
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id'] },
          { model: User, as: 'doctor', attributes: ['name', 'id'] }
        ]
      });

      res.json(updatedRecord);
    } catch (error) {
      console.error('Error updating medical record:', error);
      res.status(500).json({ error: 'Error updating medical record' });
    }
  }

  static async deleteRecord(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      // Verificar permissão para deletar
      if (record.createdBy && record.createdBy !== req.user?.id) {
        return res.status(403).json({ error: 'Access denied to delete this record' });
      }

      await record.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting medical record:', error);
      res.status(500).json({ error: 'Error deleting medical record' });
    }
  }

  static async getPatientTimeline(req, res) {
    try {
      const { patientId } = req.params;
      const { recordCategory, startDate, endDate } = req.query;
      
      const patient = await Patient.findByPk(patientId);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const where = { patientId };
      if (recordCategory) {
        where.recordCategory = recordCategory;
      }
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Filtrar registros privados baseado no usuário
      if (req.user) {
        where[Op.or] = [
          { isPrivate: false },
          { createdBy: req.user.id }
        ];
      } else {
        where.isPrivate = false;
      }

      const records = await MedicalRecord.findAll({
        where,
        order: [['date', 'DESC']],
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id', 'birthDate', 'gender'] },
          { model: User, as: 'doctor', attributes: ['name', 'id'] }
        ]
      });

      res.json(records);
    } catch (error) {
      console.error('Error fetching patient timeline:', error);
      res.status(500).json({ error: 'Error fetching patient timeline' });
    }
  }

  static async addEvolution(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.recordId);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      const { content } = req.body;
      const updatedContent = record.content 
        ? `${record.content}\n\n${new Date().toLocaleString()}: ${content}`
        : `${new Date().toLocaleString()}: ${content}`;

      await record.update({ content: updatedContent });
      res.json(record);
    } catch (error) {
      console.error('Error adding evolution:', error);
      res.status(500).json({ error: 'Error adding evolution' });
    }
  }

  static async uploadClinicalPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const record = await MedicalRecord.findByPk(req.params.recordId);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      const attachments = record.attachments || [];
      attachments.push({
        type: 'photo',
        path: req.file.path,
        filename: req.file.originalname,
        uploadedAt: new Date()
      });

      await record.update({ attachments });
      res.json({ message: 'Photo uploaded successfully', attachments });
    } catch (error) {
      console.error('Error uploading clinical photo:', error);
      res.status(500).json({ error: 'Error uploading clinical photo' });
    }
  }

  static async generateMedicalReport(req, res) {
    try {
      const { patientId } = req.params;
      const { startDate, endDate, recordCategory } = req.query;

      const where = { patientId };
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      if (recordCategory) {
        where.recordCategory = recordCategory;
      }

      // Filtrar registros privados baseado no usuário
      if (req.user) {
        where[Op.or] = [
          { isPrivate: false },
          { createdBy: req.user.id }
        ];
      } else {
        where.isPrivate = false;
      }

      const records = await MedicalRecord.findAll({
        where,
        order: [['date', 'ASC']],
        include: [
          { model: Patient, as: 'patient', attributes: ['name', 'id', 'birthDate'] },
          { model: User, as: 'doctor', attributes: ['name', 'id'] }
        ]
      });

      if (records.length === 0) {
        return res.status(404).json({ error: 'No records found for the specified period' });
      }

      const report = {
        patient: records[0].patient,
        period: {
          start: startDate || records[0].date,
          end: endDate || records[records.length - 1].date
        },
        records: records.map(record => ({
          id: record.id,
          date: record.date,
          recordCategory: record.recordCategory,
          doctorName: record.doctor?.name,
          content: record.content,
          isPrivate: record.isPrivate,
          prescriptionData: record.prescriptionData,
          examRequestData: record.examRequestData,
          attachments: record.attachments
        })),
        summary: {
          totalRecords: records.length,
          categories: records.reduce((acc, record) => {
            acc[record.recordCategory] = (acc[record.recordCategory] || 0) + 1;
            return acc;
          }, {}),
          doctors: [...new Set(records.map(r => r.doctor?.name).filter(Boolean))]
        }
      };

      res.json(report);
    } catch (error) {
      console.error('Error generating medical report:', error);
      res.status(500).json({ error: 'Error generating medical report' });
    }
  }
}

module.exports = MedicalRecordController; 