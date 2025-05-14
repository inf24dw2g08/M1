const jwt = require('jsonwebtoken');
// Importar configuração corretamente
const authConfig = require('../config/auth');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    // Usar a propriedade do objeto importado
    const user = jwt.verify(token, authConfig.jwtSecret);
    req.user = user;
    
    // Log do utilizador autenticado
    console.log('Authenticated User:', {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

exports.authorizeRole = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access forbidden: Insufficient permissions' 
      });
    }
    next();
  };
};

// Verifica se o utilizador está acessando seus próprios recursos
exports.isResourceOwner = (req, res, next) => {
  const userId = parseInt(req.user.id);
  const resourceUserId = parseInt(req.params.userId || req.body.userId);

  if (userId !== resourceUserId && req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access forbidden: You can only access your own resources'
    });
  }
  
  next();
};