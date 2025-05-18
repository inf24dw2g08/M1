const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { jwtSecret, jwtExpiration, refreshTokenExpiration } = require('../middleware/auth');
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
    const { grant_type, username, password, refresh_token } = req.body;
    if (grant_type === 'password') {
      const user = await User.findOne({ where: { username } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      const accessToken = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiration });
      const newRefresh = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: refreshTokenExpiration });
      await user.update({ refresh_token: newRefresh });
      return res.json({ access_token: accessToken, refresh_token: newRefresh });
    }
    if (grant_type === 'refresh_token') {
      const user = await User.findOne({ where: { refresh_token } });
      if (!user) return res.status(401).json({ error: 'Refresh token inválido' });
      const accessToken = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiration });
      return res.json({ access_token: accessToken });
    }
    res.status(400).json({ error: 'grant_type inválido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    
    // Verificar se o usuário já existe
    let user = await User.findOne({ where: { email: userData.email } });
    
    if (!user) {
      // Gerar senha aleatória
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      // Criar novo usuário
      user = await User.create({
        username: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: 'user',
        google_id: userData.id,
        external_auth: 'google'
      });
    } else {
      // Atualizar dados do Google
      await user.update({
        google_id: userData.id,
        external_auth: 'google'
      });
    }
    
    // Gerar tokens
    const accessToken = jwt.sign(
      { id: user.id, username: user.username || user.email, role: user.role },
      jwtSecret,
      { expiresIn: 3600 }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      jwtSecret,
      { expiresIn: 86400 * 7 }
    );
    
    // Salvar refresh token
    await user.update({ refresh_token: refreshToken });
    
    // Redirecionar com token
    return res.redirect(`/books?token=${accessToken}`);
  } catch (error) {
    console.error('Erro ao processar callback do Google:', error);
    return res.redirect('/login?error=callback_error');
  }
});

module.exports = router;
