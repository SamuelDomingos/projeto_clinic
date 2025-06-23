const express = require('express');
const router = express.Router();
const PatientProtocolController = require('../controllers/PatientProtocolController.controller');

// Create a new patient protocol
router.post('/', PatientProtocolController.createPatientProtocol);

// Get all patient protocols
router.get('/', PatientProtocolController.getAllPatientProtocols);

// Get a single patient protocol by ID
router.get('/:id', PatientProtocolController.getPatientProtocolById);

// Update a patient protocol by ID
router.put('/:id', PatientProtocolController.updatePatientProtocol);

// Delete a patient protocol by ID
router.delete('/:id', PatientProtocolController.deletePatientProtocol);

// Get all patient service sessions for a given patient protocol
router.get('/:id/sessions', PatientProtocolController.getPatientServiceSessions);

module.exports = router; 