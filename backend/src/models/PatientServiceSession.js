const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PatientProtocol = require('./PatientProtocol');
const ProtocolService = require('./ProtocolService');

const PatientServiceSession = sequelize.define('PatientServiceSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientProtocolId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'PatientProtocols',
      key: 'id'
    }
  },
  protocolServiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ProtocolServices',
      key: 'id'
    }
  },
  sessionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observations: {
    type: DataTypes.TEXT
  },
  nextAllowedDate: {
    type: DataTypes.DATE,
    allowNull: true // Only required for injection services
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'missed'),
    defaultValue: 'scheduled'
  }
}, {
  timestamps: true
});

PatientServiceSession.belongsTo(PatientProtocol, { foreignKey: 'patientProtocolId' });
PatientProtocol.hasMany(PatientServiceSession, { foreignKey: 'patientProtocolId' });

PatientServiceSession.belongsTo(ProtocolService, { foreignKey: 'protocolServiceId' });
ProtocolService.hasMany(PatientServiceSession, { foreignKey: 'protocolServiceId' });

module.exports = PatientServiceSession; 