const express = require('express');
const router = express.Router();
const patientController = require('../controllers/PatientController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/patients');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Validation middleware
const patientValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('birthDate').isDate().withMessage('Valid birth date is required'),
  body('cpf').isLength({ min: 11, max: 11 }).withMessage('CPF must be 11 digits'),
];

// Routes
router.get('/', auth, checkPermission('patients', 'read'), patientController.getActivePatients);
router.get('/search', auth, checkPermission('patients', 'read'), patientController.searchPatients);
router.get('/stats', auth, checkPermission('patients', 'read'), patientController.getPatientStats);

router.post('/', 
  auth, 
  checkPermission('patients', 'create'),
  patientValidation,
  patientController.create
);

router.get('/:id', 
  auth, 
  checkPermission('patients', 'read'),
  patientController.getById
);

router.get('/:id/full', 
  auth, 
  checkPermission('patients', 'read'),
  patientController.getPatientWithHistory
);

router.put('/:id', 
  auth, 
  checkPermission('patients', 'update'),
  patientValidation,
  patientController.update
);

router.delete('/:id', 
  auth, 
  checkPermission('patients', 'delete'),
  patientController.delete
);

router.get('/:id/medical-history', 
  auth, 
  checkPermission('patients', 'read'),
  patientController.getPatientWithHistory
);

router.post('/:id/medical-records', 
  auth, 
  checkPermission('patients', 'create'),
  patientController.addMedicalRecord
);

router.get('/:id/appointments', 
  auth, 
  checkPermission('patients', 'read'),
  patientController.getPatientWithHistory
);

router.post('/:id/photos', 
  auth, 
  checkPermission('patients', 'update'),
  upload.single('photo'),
  patientController.uploadPatientPhoto
);

router.put('/:id/last-visit', 
  auth, 
  checkPermission('patients', 'update'),
  patientController.updateLastVisit
);

module.exports = router; 