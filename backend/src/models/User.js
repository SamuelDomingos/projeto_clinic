const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
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
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'health_professional', 'receptionist', 'financial', 'scheduling', 'common'),
    allowNull: false,
    defaultValue: 'common'
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('permissions');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [rawValue];
        }
      }
      return rawValue || [];
    },
    set(value) {
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = [value];
        }
      }
      this.setDataValue('permissions', value);
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  try {
  console.log('Validando senha para usuário:', this.email);
  console.log('Senha fornecida:', password);
  console.log('Hash armazenado:', this.password);
  
    // Garantir que temos a senha mais recente
    const freshUser = await User.findByPk(this.id);
    if (!freshUser) {
      console.log('Usuário não encontrado ao validar senha');
      return false;
    }

    const isValid = await bcrypt.compare(password, freshUser.password);
    console.log('Resultado da validação:', isValid);

    return isValid;
  } catch (error) {
    console.error('Erro ao validar senha:', error);
    return false;
  }
};

// Método para buscar todos os profissionais da saúde
User.getHealthProfessionals = async function() {
  return await this.findAll({
    where: {
      role: 'health_professional',
      status: 'active'
    },
    attributes: ['id', 'name', 'photo']
  });
};

module.exports = User; 