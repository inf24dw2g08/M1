const oauth2orize = require('oauth2orize');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const authConfig = require('./auth');
const { generateAccessToken, generateRefreshToken, validateRefreshToken } = require('./oauth');

// Criar servidor OAuth2
const server = oauth2orize.createServer();

// Armazenar clientes e tokens (em produção usaria Redis/BD)
const clients = {
  'biblioteca-client': { 
    id: 'biblioteca-client', 
    name: 'Biblioteca API Client',
    secret: 'biblioteca-secret'
  }
};

// Tokens de refresh (em memória, usaria Redis/BD em produção)
const refreshTokens = {};

// Estratégia de autenticação básica para o cliente OAuth
passport.use(new BasicStrategy(
  (clientId, clientSecret, done) => {
    const client = clients[clientId];
    if (!client) return done(null, false);
    if (client.secret !== clientSecret) return done(null, false);
    return done(null, client);
  }
));

// Estratégia de autenticação de cliente por senha
passport.use(new ClientPasswordStrategy(
  (clientId, clientSecret, done) => {
    const client = clients[clientId];
    if (!client) return done(null, false);
    if (client.secret !== clientSecret) return done(null, false);
    return done(null, client);
  }
));

// Exchange password
server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
  try {
    // Verificar cliente
    if (client.id !== 'biblioteca-client') {
      return done(null, false);
    }
    
    // Buscar usuário
    const user = await User.findByEmail(username);
    if (!user) {
      return done(null, false);
    }
    
    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false);
    }
    
    // Gerar token JWT usando o objeto importado
    const token = generateAccessToken(user);
    
    // Gerar refresh token
    const refreshToken = generateRefreshToken(user);
    
    // Armazenar refresh token (em produção: Redis/BD)
    refreshTokens[refreshToken] = {
      userId: user.id,
      clientId: client.id,
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias
    };
    
    // Log de acesso
    console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
    console.log('🔑 Token OAuth Emitido:');
    console.log(`   Usuário: ${user.name} (${user.email})`);
    console.log(`   Cliente: ${client.name}`);
    console.log(`   Função: ${user.role}`);
    console.log(`   Data/Hora: ${new Date().toISOString()}`);
    console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
    
    return done(null, token, refreshToken, { 
      expires_in: 3600,
      token_type: 'Bearer',
      user_id: user.id,
      user_role: user.role
    });
  } catch (error) {
    return done(error);
  }
}));

// Exchange refresh token
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  // Verificar se o refresh token existe
  const tokenData = validateRefreshToken(refreshToken);
  if (!tokenData || !refreshTokens[refreshToken]) {
    return done(null, false);
  }
  
  // Verificar cliente
  if (client.id !== refreshTokens[refreshToken].clientId) {
    return done(null, false);
  }
  
  // Verificar expiração
  if (refreshTokens[refreshToken].expires < Date.now()) {
    delete refreshTokens[refreshToken];
    return done(null, false);
  }
  
  // Buscar usuário
  User.findById(tokenData.id)
    .then(user => {
      if (!user) {
        return done(null, false);
      }
      
      // Gerar novo token JWT usando o objeto importado
      const token = generateAccessToken(user);
      
      // Log de refresh
      console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
      console.log('🔄 Token OAuth Renovado:');
      console.log(`   Usuário: ${user.name} (${user.email})`);
      console.log(`   Função: ${user.role}`);
      console.log(`   Data/Hora: ${new Date().toISOString()}`);
      console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
      
      return done(null, token, refreshToken, { 
        expires_in: 3600,
        token_type: 'Bearer' 
      });
    })
    .catch(error => done(error));
}));

// Middleware para a rota /token
exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()
];

module.exports = {
  token: exports.token
};