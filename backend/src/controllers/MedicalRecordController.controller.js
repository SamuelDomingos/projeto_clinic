const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class MedicalRecordController {
  static async createRecord(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const record = await MedicalRecord.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error creating medical record' });
    }
  }

  static async updateRecord(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      await record.update(req.body);
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error updating medical record' });
    }
  }

  static async deleteRecord(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      await record.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting medical record' });
    }
  }

  static async getPatientTimeline(req, res) {
    try {
      const { patientId } = req.params;
      const patient = await Patient.findByPk(patientId);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const records = await MedicalRecord.findAll({
        where: { patientId },
        order: [['date', 'DESC']],
        include: [{
          model: Patient,
          attributes: ['name', 'id']
        }]
      });

      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching patient timeline' });
    }
  }

  static async addEvolution(req, res) {
    try {
      const record = await MedicalRecord.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      const { evolution } = req.body;
      const updatedEvolution = record.evolution 
        ? `${record.evolution}\n\n${new Date().toLocaleString()}: ${evolution}`
        : `${new Date().toLocaleString()}: ${evolution}`;

      await record.update({ evolution: updatedEvolution });
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Error adding evolution' });
    }
  }

  static async uploadClinicalPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const record = await MedicalRecord.findByPk(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      const attachments = record.attachments || [];
      attachments.push({
        type: 'photo',
        path: req.file.path,
        uploadedAt: new Date()
      });

      await record.update({ attachments });
      res.json({ message: 'Photo uploaded successfully', attachments });
    } catch (error) {
      res.status(500).json({ error: 'Error uploading clinical photo' });
    }
  }

  static async generateMedicalReport(req, res) {
    try {
      const { patientId } = req.params;
      const { startDate, endDate } = req.query;

      const where = { patientId };
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const records = await MedicalRecord.findAll({
        where,
        order: [['date', 'ASC']],
        include: [{
          model: Patient,
          attributes: ['name', 'id', 'birthDate', 'bloodType']
        }]
      });

      if (records.length === 0) {
        return res.status(404).json({ error: 'No records found for the specified period' });
      }

      const report = {
        patient: records[0].Patient,
        period: {
          start: startDate || records[0].date,
          end: endDate || records[records.length - 1].date
        },
        records: records.map(record => ({
          date: record.date,
          type: record.type,
          procedure: record.procedure,
          doctorName: record.doctorName,
          notes: record.notes,
          evolution: record.evolution,
          attachments: record.attachments
        })),
        summary: {
          totalRecords: records.length,
          procedures: records.map(r => r.procedure),
          doctors: [...new Set(records.map(r => r.doctorName))]
        }
      };

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: 'Error generating medical report' });
    }
  }
}

module.exports = MedicalRecordController; 