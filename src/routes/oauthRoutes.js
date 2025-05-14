const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const User = require('../models/userModel');
const crypto = require('crypto');

/**
 * @swagger
 * /api/oauth/token:
 *   post:
 *     summary: Get OAuth2 token
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - username
 *               - password
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [password, refresh_token]
 *                 example: password
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *               refresh_token:
 *                 type: string
 *                 description: Required for refresh_token grant type
 *     responses:
 *       200:
 *         description: Token generated successfully
 */
router.post('/token', async (req, res) => {
  try {
    const { grant_type, username, password, refresh_token } = req.body;
    
    // Verificar tipo de concessão
    if (grant_type !== 'password' && grant_type !== 'refresh_token') {
      return res.status(400).json({ 
        error: 'unsupported_grant_type',
        error_description: 'O tipo de concessão deve ser password ou refresh_token'
      });
    }
    
    // Fluxo de password
    if (grant_type === 'password') {
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'invalid_request', 
          error_description: 'Username e password são obrigatórios' 
        });
      }
      
      // Buscar usuário por nome de usuário ou email
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ 
          error: 'invalid_grant', 
          error_description: 'Credenciais inválidas' 
        });
      }
      
      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'invalid_grant', 
          error_description: 'Credenciais inválidas' 
        });
      }
      
      // Gerar token
      const token = jwt.sign(
        { id: user.id, name: user.username, role: user.role, email: user.email },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiration }
      );
      
      // Gerar refresh token
      const newRefreshToken = crypto.randomBytes(40).toString('hex');
      
      // Log de usuário autenticado
      console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
      console.log('🔑 OAuth2 Token Gerado (password grant):');
      console.log(`   Usuário: ${user.username} (${user.email})`);
      console.log(`   Função: ${user.role}`);
      console.log(`   Data/Hora: ${new Date().toISOString()}`);
      console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
      
      // Retornar token OAuth2 conforme especificação
      return res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600, // 1 hora em segundos
        refresh_token: newRefreshToken,
        scope: user.role === 'admin' ? 'admin' : 'user'
      });
    }
    
    // Fluxo de refresh_token
    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({ 
          error: 'invalid_request', 
          error_description: 'Refresh token é obrigatório' 
        });
      }
      
      // Em uma implementação real, você verificaria o refresh_token em uma tabela de tokens
      // Para este exemplo, geraremos um novo token sem verificação
      
      // Gerar novo token com expiração menor
      const token = jwt.sign(
        { id: 1, role: 'user', name: 'refreshed_user' },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiration }
      );
      
      // Gerar novo refresh token
      const newRefreshToken = crypto.randomBytes(40).toString('hex');
      
      // Log de token renovado
      console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
      console.log('🔄 OAuth2 Token Renovado (refresh_token grant):');
      console.log(`   Data/Hora: ${new Date().toISOString()}`);
      console.log('\x1b[32m%s\x1b[0m', '------------------------------------------------');
      
      // Retornar novo token OAuth2
      return res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken
      });
    }
  } catch (error) {
    console.error('Erro ao processar token OAuth:', error);
    return res.status(500).json({ 
      error: 'server_error', 
      error_description: 'Erro interno do servidor' 
    });
  }
});

/**
 * @swagger
 * /api/oauth/userinfo:
 *   get:
 *     summary: Get authenticated user information
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *       401:
 *         description: Unauthorized
 */
router.get('/userinfo', (req, res) => {
  // Verificar token Bearer
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Token não fornecido' });
  }
  
  try {
    // Verificar e decodificar token
    const user = jwt.verify(token, authConfig.jwtSecret);
    
    // Retornar informações do usuário
    return res.json({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      updated_at: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Token inválido ou expirado' });
  }
});

module.exports = router;
