const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const db = require('../config/db.config');
const { jwtSecret, passport } = require('../middleware/auth');
const oauthConfig = require('../config/oauth.config');
const googleOAuthConfig = require('../config/google-oauth.config');
// Para versões do Node.js menores que 18
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Validar credenciais do cliente
const validateClient = (clientId, clientSecret) => {
  const client = oauthConfig.clients.find(c => c.id === clientId);
  return client && client.secret === clientSecret ? client : null;
};

// Endpoint para obter token (OAuth 2.0 - Resource Owner Password Credentials Grant)
router.post('/token', async (req, res) => {
  try {
    const { grant_type, username, password, client_id, client_secret, scope } = req.body;
    
    // Validar cliente
    const client = validateClient(client_id, client_secret);
    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Cliente inválido ou não autorizado'
      });
    }
    
    // Verificar tipo de grant
    if (grant_type === 'password') {
      // Verificar se o grant é permitido para este cliente
      if (!client.grants.includes('password')) {
        return res.status(400).json({
          error: 'unauthorized_client',
          error_description: 'O cliente não está autorizado para este tipo de grant'
        });
      }
      
      // Autenticar usuário
      const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      
      if (users.length === 0) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Credenciais inválidas'
        });
      }
      
      const user = users[0];
      
      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Credenciais inválidas'
        });
      }
      
      // Validar escopo
      const requestedScopes = scope ? scope.split(' ') : ['read'];
      const validScopes = requestedScopes.filter(s => 
        oauthConfig.scopes.includes(s) && 
        (s !== 'admin' || user.role === 'admin')
      );
      
      if (requestedScopes.length > 0 && validScopes.length === 0) {
        return res.status(400).json({
          error: 'invalid_scope',
          error_description: 'O escopo solicitado é inválido'
        });
      }
      
      // Gerar access token
      const accessToken = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          scope: validScopes.join(' ')
        },
        jwtSecret,
        { expiresIn: oauthConfig.accessTokenLifetime }
      );
      
      // Gerar refresh token
      const refreshToken = jwt.sign(
        { 
          id: user.id,
          scope: validScopes.join(' ')
        },
        jwtSecret,
        { expiresIn: oauthConfig.refreshTokenLifetime }
      );
      
      // Armazenar refresh token no banco
      await db.query(
        'UPDATE users SET refresh_token = ? WHERE id = ?',
        [refreshToken, user.id]
      );
      
      // Log do usuário autenticado
      console.log(`OAuth Token concedido para usuário: ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Scope: ${validScopes.join(' ')}`);
      
      // Responder em formato OAuth 2.0
      return res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: oauthConfig.accessTokenLifetime,
        refresh_token: refreshToken,
        scope: validScopes.join(' ')
      });
      
    } else if (grant_type === 'refresh_token') {
      // Verificar se o grant é permitido para este cliente
      if (!client.grants.includes('refresh_token')) {
        return res.status(400).json({
          error: 'unauthorized_client',
          error_description: 'O cliente não está autorizado para este tipo de grant'
        });
      }
      
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Refresh token não fornecido'
        });
      }
      
      try {
        // Verificar refresh token
        const decoded = jwt.verify(refresh_token, jwtSecret);
        
        // Buscar usuário
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0 || users[0].refresh_token !== refresh_token) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Refresh token inválido'
          });
        }
        
        const user = users[0];
        
        // Validar escopo
        const requestedScopes = scope ? scope.split(' ') : decoded.scope.split(' ');
        
        // Verificar se os escopos solicitados estão contidos no escopo original
        const originalScopes = decoded.scope.split(' ');
        const validScopes = requestedScopes.filter(s => 
          originalScopes.includes(s) && 
          oauthConfig.scopes.includes(s) && 
          (s !== 'admin' || user.role === 'admin')
        );
        
        if (requestedScopes.length > 0 && validScopes.length === 0) {
          return res.status(400).json({
            error: 'invalid_scope',
            error_description: 'O escopo solicitado é inválido'
          });
        }
        
        // Gerar novo access token
        const accessToken = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            scope: validScopes.join(' ')
          },
          jwtSecret,
          { expiresIn: oauthConfig.accessTokenLifetime }
        );
        
        // Gerar novo refresh token
        const newRefreshToken = jwt.sign(
          { 
            id: user.id,
            scope: validScopes.join(' ')
          },
          jwtSecret,
          { expiresIn: oauthConfig.refreshTokenLifetime }
        );
        
        // Atualizar refresh token no banco
        await db.query(
          'UPDATE users SET refresh_token = ? WHERE id = ?',
          [newRefreshToken, user.id]
        );
        
        // Log do usuário que renovou o token
        console.log(`OAuth Token renovado para usuário: ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Scope: ${validScopes.join(' ')}`);
        
        // Responder em formato OAuth 2.0
        return res.json({
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: oauthConfig.accessTokenLifetime,
          refresh_token: newRefreshToken,
          scope: validScopes.join(' ')
        });
        
      } catch (error) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Refresh token inválido ou expirado'
        });
      }
      
    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Tipo de grant não suportado'
      });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição OAuth:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Erro interno do servidor'
    });
  }
});

// Endpoint para revogar token
router.post('/revoke', async (req, res) => {
  try {
    const { token, token_type_hint, client_id, client_secret } = req.body;
    
    // Validar cliente
    const client = validateClient(client_id, client_secret);
    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Cliente inválido ou não autorizado'
      });
    }
    
    if (!token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Token não fornecido'
      });
    }
    
    // Se for um refresh token, revogar no banco de dados
    if (token_type_hint === 'refresh_token' || !token_type_hint) {
      try {
        const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
        
        // Remover o refresh token do usuário
        await db.query(
          'UPDATE users SET refresh_token = NULL WHERE id = ? AND refresh_token = ?',
          [decoded.id, token]
        );
        
        return res.status(200).end();
      } catch (error) {
        // Token inválido, mas ainda retornamos sucesso conforme a especificação
        return res.status(200).end();
      }
    }
    
    // Para access tokens, simplesmente retornamos sucesso
    // (como JWTs são stateless, não podemos realmente revogá-los sem uma lista negra)
    return res.status(200).end();
  } catch (error) {
    console.error('Erro ao revogar token:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/oauth/google:
 *   get:
 *     summary: Iniciar autenticação com Google
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirecionado para tela de login do Google
 */
router.get('/google', (req, res, next) => {
  console.log('Iniciando autenticação com Google');
  
  // Método direto sem usar passport.authenticate como middleware
  // para evitar problemas com a callback
  try {
    // Construir URL de autenticação do Google manualmente
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleOAuthConfig.clientID)}` +
      `&redirect_uri=${encodeURIComponent(googleOAuthConfig.callbackURL)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('profile email')}` +
      `&prompt=select_account`;
    
    console.log('Redirecionando para:', redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Erro ao redirecionar para Google:', error);
    return res.redirect('/login?error=redirect_failed');
  }
});

/**
 * @swagger
 * /api/oauth/google/callback:
 *   get:
 *     summary: Callback para autenticação Google
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         description: Código de autorização retornado pelo Google
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna token JWT
 *       401:
 *         description: Falha na autenticação
 */
router.get('/google/callback', async (req, res) => {
  try {
    console.log('Callback do Google recebido. Código:', req.query.code ? 'Presente' : 'Ausente');
    
    if (!req.query.code) {
      console.error('Código de autenticação ausente no callback');
      return res.redirect('/login?error=no_code');
    }
    
    // Obter token de acesso do Google usando o código de autorização
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: googleOAuthConfig.clientID,
        client_secret: googleOAuthConfig.clientSecret,
        redirect_uri: googleOAuthConfig.callbackURL,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Falha ao obter token do Google:', tokenData);
      return res.redirect('/login?error=token_error');
    }
    
    // Obter informações do usuário com o token de acesso
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    console.log('Dados do usuário Google:', {
      id: userData.id,
      email: userData.email,
      name: userData.name
    });
    
    // Verificar se o usuário já existe no banco
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [userData.email]
    );
    
    let user;
    
    // Criar ou atualizar usuário
    if (users.length === 0) {
      // Gerar senha aleatória (não será usada pelo usuário)
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      // Inserir novo usuário
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role, google_id) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, 'user', userData.id]
      );
      
      user = {
        id: result.insertId,
        username: userData.name,
        email: userData.email,
        role: 'user'
      };
    } else {
      user = users[0];
      
      // Atualizar dados do Google se necessário
      await db.query(
        'UPDATE users SET google_id = ? WHERE id = ?',
        [userData.id, user.id]
      );
    }
    
    // Gerar token JWT para nossa API
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        scope: 'read write',
        auth_provider: 'google'
      },
      jwtSecret,
      { expiresIn: 3600 } // 1 hora
    );
    
    // Gerar refresh token
    const refreshToken = jwt.sign(
      { 
        id: user.id,
        scope: 'read write',
        auth_provider: 'google'
      },
      jwtSecret,
      { expiresIn: 86400 * 7 } // 7 dias
    );
    
    // Salvar refresh token
    await db.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );
    
    // Redirecionar para a página principal com o token
    res.redirect(`/?token=${accessToken}&refresh_token=${refreshToken}`);
    
  } catch (error) {
    console.error('Erro ao processar callback do Google:', error);
    res.redirect('/login?error=callback_error');
  }
});

module.exports = router;
