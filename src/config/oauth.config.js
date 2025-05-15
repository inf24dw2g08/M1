require('dotenv').config();

// Configurações OAuth 2.0
const oauthConfig = {
  // Credenciais do cliente
  clients: [{
    id: 'library_client',
    secret: process.env.CLIENT_SECRET || 'library_secret',
    grants: ['password', 'refresh_token'],
    redirectUris: []
  }],
  
  // Configurações de token
  accessTokenLifetime: 3600, // Em segundos
  refreshTokenLifetime: 86400 * 7, // 7 dias em segundos
  
  // Configurações de escopos
  scopes: ['read', 'write', 'admin']
};

module.exports = oauthConfig;
