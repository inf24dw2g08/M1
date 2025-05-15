const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db.config');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleOAuthConfig = require('../config/google-oauth.config');
const bcrypt = require("bcryptjs"); // Adicionado para gerar senhas aleatórias

// Configurações JWT diretas para evitar dependência circular
const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
const jwtExpiration = process.env.JWT_EXPIRATION || '1h';
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

// Configuração da estratégia Google OAuth com tratamento de erros mais detalhado
passport.use(new GoogleStrategy({
  clientID: googleOAuthConfig.clientID,
  clientSecret: googleOAuthConfig.clientSecret,
  callbackURL: googleOAuthConfig.callbackURL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log('Autenticação Google iniciada');
    console.log('Perfil recebido do Google:', JSON.stringify({
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails ? profile.emails.map(e => e.value) : 'sem email'
    }));
    
    // Verificar se temos email (obrigatório)
    if (!profile.emails || profile.emails.length === 0) {
      console.error('Perfil Google não contém email');
      return done(new Error('Perfil Google não forneceu email'));
    }
    
    const userEmail = profile.emails[0].value;
    
    // Verificar se o usuário já existe no banco
    console.log('Verificando se usuário existe:', userEmail);
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [userEmail]
    );

    let user;
    
    // Verificar se a tabela tem as colunas necessárias
    try {
      console.log('Criando/verificando colunas necessárias');
      // Tentar criar coluna google_id se não existir
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS external_auth VARCHAR(50) NULL
      `);
      console.log('Colunas criadas/verificadas com sucesso');
    } catch (alterErr) {
      // Se o comando acima não funcionar (MySQL antigo)
      console.error('Erro ao verificar colunas (tentando método alternativo):', alterErr);
      try {
        // Verificar se a coluna existe antes de tentar criar
        const [columnsGoogle] = await db.query('SHOW COLUMNS FROM users LIKE "google_id"');
        if (columnsGoogle.length === 0) {
          await db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL');
        }
        
        const [columnsExt] = await db.query('SHOW COLUMNS FROM users LIKE "external_auth"');
        if (columnsExt.length === 0) {
          await db.query('ALTER TABLE users ADD COLUMN external_auth VARCHAR(50) NULL');
        }
        console.log('Colunas verificadas/criadas pelo método alternativo');
      } catch (err) {
        console.error('Erro ao criar colunas (método alternativo):', err);
        // Continuamos mesmo se der erro, vamos tentar não usar essas colunas
      }
    }

    if (users.length === 0) {
      console.log('Usuário não encontrado, criando novo usuário');
      
      // Gerar uma senha aleatória para o novo usuário (já que o campo password não pode ser nulo)
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      // Criar um novo usuário com os dados do Google
      try {
        // Tentativa com todas as colunas incluindo senha
        const [result] = await db.query(
          'INSERT INTO users (username, email, role, google_id, external_auth, password) VALUES (?, ?, ?, ?, ?, ?)',
          [profile.displayName, userEmail, 'user', profile.id, 'google', hashedPassword]
        );
        
        user = {
          id: result.insertId,
          username: profile.displayName,
          email: userEmail,
          role: 'user'
        };
        console.log('Usuário criado com sucesso:', user);
      } catch (insertErr) {
        console.error('Erro na inserção completa:', insertErr);
        throw insertErr; // Propagar o erro para tratamento adequado
      }
    } else {
      console.log('Usuário já existe no banco de dados');
      user = users[0];
      console.log('Dados do usuário:', {id: user.id, username: user.username, email: user.email});
      
      // Tentar atualizar o google_id se necessário
      try {
        console.log('Atualizando dados do Google para o usuário');
        await db.query(
          'UPDATE users SET google_id = ?, external_auth = ? WHERE id = ?',
          [profile.id, 'google', user.id]
        );
        console.log('Dados do Google atualizados com sucesso');
      } catch (updateErr) {
        console.error('Erro ao atualizar dados do Google (não crítico):', updateErr);
        // Continuamos mesmo sem atualizar esses dados
      }
    }

    console.log('Autenticação Google concluída com sucesso');
    return done(null, user);
  } catch (error) {
    console.error('Erro crítico na autenticação Google:', error);
    return done(error);
  }
}));

// Serializar usuário para a sessão
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuário da sessão
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return done(null, false);
    }
    done(null, users[0]);
  } catch (error) {
    done(error);
  }
});

// Middleware para verificar token e escopos
const authenticateToken = (requiredScopes = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'unauthorized', 
        error_description: 'Token não fornecido' 
      });
    }
    
    try {
      // Verificar token
      const user = jwt.verify(token, jwtSecret);
      
      // Verificar escopos se necessário
      if (requiredScopes.length > 0) {
        const userScopes = user.scope ? user.scope.split(' ') : [];
        const hasValidScope = requiredScopes.some(scope => userScopes.includes(scope));
        
        if (!hasValidScope && user.role !== 'admin') { // Admin tem todos os escopos
          return res.status(403).json({ 
            error: 'insufficient_scope', 
            error_description: 'O token não possui os escopos necessários' 
          });
        }
      }
      
      // Salvar dados do usuário no objeto request
      req.user = user;
      
      // Log do usuário autenticado
      console.log(`Usuário autenticado: ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Scopes: ${user.scope || 'nenhum'}`);
      
      next();
    } catch (err) {
      // Token expirado ou inválido
      return res.status(401).json({ 
        error: 'invalid_token', 
        error_description: err.message 
      });
    }
  };
};

// Middleware para autorização baseada em papéis
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'unauthorized', 
        error_description: 'Autenticação necessária' 
      });
    }
    
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ 
      error: 'forbidden', 
      error_description: 'Permissão negada' 
    });
  };
};

// Middleware para verificar propriedade de recursos
const isResourceOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'unauthorized', 
          error_description: 'Autenticação necessária' 
        });
      }
      
      // Administradores têm acesso total
      if (req.user.role === 'admin') {
        return next();
      }
      
      const resourceId = req.params.id;
      const userId = req.user.id;
      
      console.log(`Verificando propriedade do recurso: Tipo: ${resourceType}, ID: ${resourceId}, Usuário: ${userId}`);

      // Verificação para diferentes tipos de recursos
      if (resourceType === 'loan') {
        const [rows] = await db.query(
          'SELECT * FROM loans WHERE id = ? AND user_id = ?',
          [resourceId, userId]
        );
        
        if (rows.length === 0) {
          return res.status(403).json({ 
            error: 'forbidden', 
            error_description: 'Acesso negado: você não é o proprietário deste empréstimo' 
          });
        }
      } else if (resourceType === 'user') {
        // Usuários só podem acessar seus próprios dados
        if (resourceId != userId) {
          return res.status(403).json({ 
            error: 'forbidden', 
            error_description: 'Acesso negado: você só pode acessar seus próprios dados' 
          });
        }
      }
      
      // Permitir acesso se todas as verificações passarem
      next();
    } catch (error) {
      console.error('Erro ao verificar propriedade do recurso:', error);
      // Em caso de erro, seguir para o próximo middleware
      next();
    }
  };
};

// Confirmar que estamos exportando o passport
module.exports = {
  authenticateToken,
  authorizeRole,
  isResourceOwner,
  jwtSecret,
  jwtExpiration,
  refreshTokenExpiration,
  passport
};