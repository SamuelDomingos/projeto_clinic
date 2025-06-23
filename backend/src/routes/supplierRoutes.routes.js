const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/SupplierController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { body } = require('express-validator');

// Validation middleware
const supplierValidation = [
  body('name').notEmpty().withMessage('Name is required')
];

// Routes
router.get('/', auth, checkPermission('suppliers', 'read'), SupplierController.searchSuppliers);

router.post('/', 
  auth, 
  checkPermission('suppliers', 'create'),
  supplierValidation,
  SupplierController.create
);

router.get('/:id', 
  auth, 
  checkPermission('suppliers', 'read'),
  SupplierController.read
);

router.put('/:id', 
  auth, 
  checkPermission('suppliers', 'update'),
  supplierValidation,
  SupplierController.update
);

router.delete('/:id', 
  auth, 
  checkPermission('suppliers', 'delete'),
  SupplierController.delete
);

router.put('/:id/status', 
  auth, 
  checkPermission('suppliers', 'update'),
  body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
  SupplierController.updateSupplierStatus
);

module.exports = router; 