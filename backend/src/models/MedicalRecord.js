const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Patient = require('./Patient');

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
      model: 'Patients',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('consultation', 'procedure', 'examination'),
    allowNull: false
  },
  procedure: {
    type: DataTypes.STRING,
    allowNull: false
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  evolution: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSON
  }
});

// Definir associações
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });

module.exports = MedicalRecord; 