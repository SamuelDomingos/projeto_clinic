const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Caminho da rota (ex: /patients)'
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Método HTTP (GET, POST, PUT, DELETE)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se a permissão está ativa no sistema'
  }
}, {
  timestamps: true,
  tableName: 'permissions',
  indexes: [
    {
      unique: true,
      fields: ['path', 'method']
    }
  ]
});

// Cache para armazenar permissões já verificadas
const permissionCache = new Map();

// Função para extrair o caminho base da rota
const getBasePath = (path) => {
  // Remove parâmetros de rota (ex: /patients/:id -> /patients)
  return path.replace(/\/:[^/]+/g, '');
};

// Função para registrar permissão automaticamente
Permission.registerRoute = async function(path, method) {
  try {
    const basePath = getBasePath(path);
    const cacheKey = `${method}:${basePath}`;

    // Verifica se já existe no cache
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    // Busca ou cria a permissão
    const [permission] = await this.findOrCreate({
      where: { path: basePath, method },
      defaults: { isActive: true }
    });

    // Adiciona ao cache
    permissionCache.set(cacheKey, permission);
    return permission;
  } catch (error) {
    console.error('Error registering route permission:', error);
    throw error;
  }
};

// Função para verificar permissão
Permission.checkPermission = async function(path, method) {
  try {
    const basePath = getBasePath(path);
    const cacheKey = `${method}:${basePath}`;

    // Verifica no cache primeiro
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    // Busca a permissão
    const permission = await this.findOne({
      where: { path: basePath, method, isActive: true }
    });

    // Adiciona ao cache se encontrada
    if (permission) {
      permissionCache.set(cacheKey, permission);
    }

    return permission;
  } catch (error) {
    console.error('Error checking permission:', error);
    throw error;
  }
};

// Função para limpar o cache
Permission.clearCache = function() {
  permissionCache.clear();
};

// Função para obter todas as permissões ativas
Permission.getActive = async function() {
  return await this.findAll({
    where: { isActive: true },
    order: [['path', 'ASC'], ['method', 'ASC']]
  });
};

// Função para desativar uma permissão
Permission.deactivate = async function(path, method) {
  const basePath = getBasePath(path);
  const permission = await this.findOne({
    where: { path: basePath, method }
  });
  
  if (permission) {
    permission.isActive = false;
    await permission.save();
    permissionCache.delete(`${method}:${basePath}`);
  }
  
  return permission;
};

module.exports = Permission; 