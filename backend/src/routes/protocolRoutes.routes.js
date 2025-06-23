const express = require('express');
const router = express.Router();
const ProtocolController = require('../controllers/ProtocolController.controller');

// Create a new protocol
router.post('/', ProtocolController.createProtocol);

// Get all protocols
router.get('/', ProtocolController.getAllProtocols);

// Get a single protocol by ID
router.get('/:id', ProtocolController.getProtocolById);

// Update a protocol by ID
router.put('/:id', ProtocolController.updateProtocol);

// Delete a protocol by ID
router.delete('/:id', ProtocolController.deleteProtocol);

module.exports = router; 