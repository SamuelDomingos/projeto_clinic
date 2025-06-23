const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Patient = require('./Patient');
const Protocol = require('./Protocol');

const PatientProtocol = sequelize.define('PatientProtocol', {
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
  protocolId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Protocols',
      key: 'id'
    }
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'paused'),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

PatientProtocol.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(PatientProtocol, { foreignKey: 'patientId' });

PatientProtocol.belongsTo(Protocol, { foreignKey: 'protocolId' });
Protocol.hasMany(PatientProtocol, { foreignKey: 'protocolId' });

module.exports = PatientProtocol; 