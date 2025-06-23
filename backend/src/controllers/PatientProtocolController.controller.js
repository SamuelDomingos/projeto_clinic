const { PatientProtocol, Patient, Protocol, PatientServiceSession, ProtocolService, Service } = require('../models');
const { Op } = require('sequelize');

const PatientProtocolController = {
  // Create a new PatientProtocol
  async createPatientProtocol(req, res) {
    try {
      const { patientId, protocolId } = req.body;

      if (!patientId || !protocolId) {
        return res.status(400).json({ error: 'Patient ID and Protocol ID are required.' });
      }

      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found.' });
      }

      const protocol = await Protocol.findByPk(protocolId);
      if (!protocol) {
        return res.status(404).json({ error: 'Protocol not found.' });
      }

      const patientProtocol = await PatientProtocol.create({ patientId, protocolId });
      res.status(201).json(patientProtocol);
    } catch (error) {
      console.error('Error creating patient protocol:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all PatientProtocols
  async getAllPatientProtocols(req, res) {
    try {
      const patientProtocols = await PatientProtocol.findAll({
        include: [Patient, Protocol]
      });
      res.status(200).json(patientProtocols);
    } catch (error) {
      console.error('Error fetching patient protocols:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get PatientProtocol by ID
  async getPatientProtocolById(req, res) {
    try {
      const { id } = req.params;
      const patientProtocol = await PatientProtocol.findByPk(id, {
        include: [Patient, Protocol]
      });
      if (!patientProtocol) {
        return res.status(404).json({ error: 'Patient Protocol not found' });
      }
      res.status(200).json(patientProtocol);
    } catch (error) {
      console.error('Error fetching patient protocol by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update a PatientProtocol
  async updatePatientProtocol(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const patientProtocol = await PatientProtocol.findByPk(id);
      if (!patientProtocol) {
        return res.status(404).json({ error: 'Patient Protocol not found' });
      }

      await patientProtocol.update({ status });
      res.status(200).json(patientProtocol);
    } catch (error) {
      console.error('Error updating patient protocol:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a PatientProtocol
  async deletePatientProtocol(req, res) {
    try {
      const { id } = req.params;
      const patientProtocol = await PatientProtocol.findByPk(id);
      if (!patientProtocol) {
        return res.status(404).json({ error: 'Patient Protocol not found' });
      }

      await patientProtocol.destroy();
      res.status(204).send(); // No Content
    } catch (error) {
      console.error('Error deleting patient protocol:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all PatientServiceSessions for a given PatientProtocol
  async getPatientServiceSessions(req, res) {
    try {
      const { id } = req.params; // id of PatientProtocol
      const patientServiceSessions = await PatientServiceSession.findAll({
        where: { patientProtocolId: id },
        include: [{
          model: ProtocolService,
          include: [Service]
        }]
      });
      res.status(200).json(patientServiceSessions);
    } catch (error) {
      console.error('Error fetching patient service sessions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PatientProtocolController; 