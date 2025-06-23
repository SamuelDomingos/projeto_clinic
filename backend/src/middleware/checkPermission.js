const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (resource, action) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Garantir que as permissões sejam um array
      const userPermissions = Array.isArray(user.permissions) 
        ? user.permissions 
        : typeof user.permissions === 'string' 
          ? JSON.parse(user.permissions) 
          : [];

      // Se o usuário tiver permissão total, permitir acesso
      if (userPermissions.includes('*')) {
        return next();
      }

      // Verificar permissão específica
      const requiredPermission = `${resource}:${action}`;
      console.log('Permissão necessária:', requiredPermission);
      console.log('Permissões do usuário:', userPermissions);

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          requiredPermission,
          userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Error in checkPermission middleware:', error);
      res.status(401).json({ error: 'Token inválido' });
    }
  };
}; 