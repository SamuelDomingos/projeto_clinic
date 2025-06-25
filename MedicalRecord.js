const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Patient = require('./Patient');
const User = require('./User');

// Definindo categorias como constante reutilizável
const RECORD_CATEGORIES = [
  'observation',
  'evolution',
  'private_note',
  'attachment',
  'prescription',
  'exam_request'
];

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Patient,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  recordCategory: {
    type: DataTypes.ENUM(...RECORD_CATEGORIES),
    allowNull: false
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  prescriptionData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  examRequestData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'medical_records',
  timestamps: true,
  indexes: [
    { fields: ['patientId'] },
    { fields: ['doctorId'] },
    { fields: ['date'] },
    { fields: ['recordCategory'] }
    // Exemplo opcional de índice composto:
    // { fields: ['patientId', 'date'] }
  ]
});

// Associações
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = MedicalRecord;
