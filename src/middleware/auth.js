const jwt = require('jsonwebtoken');
const jwtSecret = 'default_secret_key'; // Chave fixa para teste
const jwtExpiration = '7d'; // Validade longa
const refreshTokenExpiration = '30d';

// Middleware simplificado - ignora autenticação
const authenticateToken = (req, res, next) => {
  // Simular autenticação bem-sucedida
  req.user = { 
    id: 1, 
    username: 'admin', 
    role: 'admin' 
  };
  console.log('Autenticação bypass ativada - usuário simulado:', req.user);
  next(); // Sempre passa
};

// Middleware simplificado - ignora autorização
const authorizeRole = (roles) => {
  return (req, res, next) => {
    console.log(`Autorização bypass ativada - roles requeridas: ${roles}`);
    next(); // Sempre autoriza
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  jwtSecret,
  jwtExpiration,
  refreshTokenExpiration
};