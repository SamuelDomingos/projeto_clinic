const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Protocol = require('./Protocol');
const Service = require('./Service');

const ProtocolService = sequelize.define('ProtocolService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  protocolId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Protocols',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Services',
      key: 'id'
    }
  },
  numberOfSessions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  requiresIntervalControl: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true
});

ProtocolService.belongsTo(Protocol, { foreignKey: 'protocolId' });
Protocol.hasMany(ProtocolService, { foreignKey: 'protocolId' });

ProtocolService.belongsTo(Service, { foreignKey: 'serviceId' });
Service.hasMany(ProtocolService, { foreignKey: 'serviceId' });

module.exports = ProtocolService; 