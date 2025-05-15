const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole, isResourceOwner } = require('../middleware/auth');

// Verificar se o controlador existe e tem os métodos necessários
if (!userController || typeof userController.registerUser !== 'function') {
  // Se registerUser não existir, criar uma função temporária
  userController.registerUser = (req, res) => {
    res.status(501).json({ message: 'Funcionalidade não implementada' });
  };
}

// Garantir que todos os métodos necessários existam
const methods = ['getAllUsers', 'getUserById', 'createUser', 'updateUser', 'deleteUser'];
methods.forEach(method => {
  if (typeof userController[method] !== 'function') {
    userController[method] = (req, res) => {
      res.status(501).json({ message: `Método ${method} não implementado` });
    };
  }
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar novo usuário (rota pública)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', userController.registerUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido - Acesso negado
 */
router.get('/', (req, res, next) => {
  authenticateToken(['admin'])(req, res, () => {
    authorizeRole(['admin'])(req, res, () => {
      userController.getAllUsers(req, res);
    });
  });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Criar um novo usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido - Acesso negado
 */
router.post('/', (req, res, next) => {
  authenticateToken(['admin'])(req, res, () => {
    authorizeRole(['admin'])(req, res, () => {
      userController.createUser(req, res);
    });
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido - Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', (req, res, next) => {
  authenticateToken(['read'])(req, res, () => {
    isResourceOwner('user')(req, res, () => {
      userController.getUserById(req, res);
    });
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido - Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', (req, res, next) => {
  authenticateToken(['write'])(req, res, () => {
    isResourceOwner('user')(req, res, () => {
      userController.updateUser(req, res);
    });
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Excluir um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido - Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', (req, res, next) => {
  authenticateToken(['admin'])(req, res, () => {
    authorizeRole(['admin'])(req, res, () => {
      userController.deleteUser(req, res);
    });
  });
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obter perfil do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 */
router.get('/me', authenticateToken(), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await db.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Atualizar perfil do usuário atual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Operação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 */
router.put('/me', authenticateToken(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    
    // Verificar se o usuário existe
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Preparar dados para atualização
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
    }
    
    // Construir query de atualização
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    // Adicionar ID ao final dos valores
    values.push(userId);
    
    // Executar atualização
    await db.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );
    
    // Buscar usuário atualizado
    const [updatedUsers] = await db.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil do usuário' });
  }
});

module.exports = router;