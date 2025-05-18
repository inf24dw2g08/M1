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
router.get('/', authenticateToken, authorizeRole(['admin']), userController.getAllUsers);

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
router.post('/', authenticateToken(), authorizeRole(['admin']), userController.createUser);

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
router.get('/:id', authenticateToken, userController.getUserById);

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
router.put('/:id', authenticateToken, authorizeRole(['admin']), userController.updateUser);

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
router.delete('/:id', authenticateToken(), authorizeRole(['admin']), userController.deleteUser);

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
router.get('/me', authenticateToken(), userController.getProfile);

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
router.put('/me', authenticateToken(), userController.updateProfile);

module.exports = router;