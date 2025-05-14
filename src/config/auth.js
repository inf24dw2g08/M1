// Configurações para autenticação e JWT
require('dotenv').config();

// Configurações JWT centralizadas como propriedades diretamente exportadas
// isso evita a dependência circular
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta_segura',
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d'
};