const oauth2orize = require('oauth2orize');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// Importação correta
const authConfig = require('./auth');

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
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration }
    );
    
    // Gerar refresh token
    const refreshToken = require('crypto').randomBytes(32).toString('hex');
    
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
  if (!refreshTokens[refreshToken]) {
    return done(null, false);
  }
  
  const tokenData = refreshTokens[refreshToken];
  
  // Verificar cliente
  if (client.id !== tokenData.clientId) {
    return done(null, false);
  }
  
  // Verificar expiração
  if (tokenData.expires < Date.now()) {
    delete refreshTokens[refreshToken];
    return done(null, false);
  }
  
  // Buscar usuário
  User.findById(tokenData.userId)
    .then(user => {
      if (!user) {
        return done(null, false);
      }
      
      // Gerar novo token JWT usando o objeto importado
      const token = jwt.sign(
        { 
          id: user.id, 
          name: user.name,
          email: user.email, 
          role: user.role 
        },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiration }
      );
      
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