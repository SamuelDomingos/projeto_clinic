const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/MedicalRecordController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Rotas para registros médicos
router.post('/', 
  auth, 
  checkPermission('medical-records', 'create'),
  MedicalRecordController.createRecord
);

router.get('/patients/:patientId/timeline', 
  auth, 
  checkPermission('medical-records', 'read'),
  MedicalRecordController.getPatientTimeline
);

router.post('/:recordId/evolution', 
  auth, 
  checkPermission('medical-records', 'update'),
  MedicalRecordController.addEvolution
);

router.post('/:recordId/photos', 
  auth, 
  checkPermission('medical-records', 'update'),
  upload.single('photo'), 
  MedicalRecordController.uploadClinicalPhoto
);

router.get('/:recordId/report', 
  auth, 
  checkPermission('medical-records', 'read'),
  MedicalRecordController.generateMedicalReport
);

module.exports = router; 