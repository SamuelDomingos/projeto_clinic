const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  rg: {
    type: DataTypes.STRING,
    unique: true
  },
  address: {
    type: DataTypes.STRING,
  },
  emergencyContact: {
    type: DataTypes.STRING,
  },
  profession: {
    type: DataTypes.STRING
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
  },
  photo: {
    type: DataTypes.STRING
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  },
  allergies: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  insurance: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  lastVisit: {
    type: DataTypes.DATE
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Patient; 