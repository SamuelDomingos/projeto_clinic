const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      // Adiciona o usuário e suas permissões ao request
      req.user = {
        id: user.id,
        email: user.email,
        permissions: user.permissions
      };

      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const permissions = typeof req.user.permissions === 'string' 
        ? JSON.parse(req.user.permissions)
        : req.user.permissions;
      
      if (!permissions || !permissions[resource] || !permissions[resource].includes(action)) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      
      next();
    } catch (error) {
      res.status(403).json({ error: 'Access denied.' });
    }
  };
};

module.exports = auth; 