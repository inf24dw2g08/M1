const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// processar forms
router.use(express.urlencoded({ extended: true }));

// UI: Listar, criar, editar e excluir usuários
router.get('/users', async (req, res) => {
  const users = await userController.getAllUsers({ json: true }); // retorna array
  const list = users.map(u => `
    <li data-id="${u.id}">
      ${u.id} - ${u.username} (${u.email})
      <form action="/users/update/${u.id}" method="post" style="display:inline">
        <input name="username" value="${u.username}" required>
        <input name="email" value="${u.email}" required>
        <button>Atualizar</button>
      </form>
      <form action="/users/delete/${u.id}" method="post" style="display:inline">
        <button>Excluir</button>
      </form>
    </li>
  `).join('');
  res.send(`
    <h1>Usuários</h1>
    <form action="/api/users" method="post">
      <input name="username" placeholder="Username" required>
      <input name="email" placeholder="Email" required>
      <input name="password" type="password" placeholder="Senha" required>
      <select name="role"><option>user</option><option>admin</option></select>
      <button type="submit">Criar</button>
    </form>
    <ul>${list}</ul>
  `);
});

// criar via UI
router.post('/users', async (req, res) => {
  await userController.createUser({ body: req.body, json: true });
  res.redirect('/users');
});

// atualizar via UI
router.post('/users/update/:id', async (req, res) => {
  await userController.updateUser({ params: req.params, body: req.body, json: true });
  res.redirect('/users');
});

// excluir via UI
router.post('/users/delete/:id', async (req, res) => {
  await userController.deleteUser({ params: req.params, json: true });
  res.redirect('/users');
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