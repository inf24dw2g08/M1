const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole, isResourceOwner } = require('../middleware/auth');
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register new user
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
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username or email already in use
 */
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Registro não implementado' });
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Login não implementado' });
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
router.get('/profile', authenticateToken, (req, res) => {
  res.status(501).json({ message: 'Perfil não implementado' });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', authenticateToken, authorizeRole(['admin']), userController.getAllUsers || ((req, res) => {
  res.status(501).json({ message: 'Listagem de usuários não implementada' });
}));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not the owner or admin
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateToken, isResourceOwner('user'), userController.getUserById || ((req, res) => {
  res.status(501).json({ message: 'Busca por ID não implementada' });
}));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not the owner or admin
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticateToken, isResourceOwner('user'), userController.updateUser || function(req, res) {
  try {
    res.json({
      success: true,
      message: 'Atualização simulada com sucesso',
      id: req.params.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Erro interno'});
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Not the owner or admin
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticateToken, isResourceOwner('user'), userController.deleteUser || function(req, res) {
  try {
    res.json({
      success: true,
      message: 'Exclusão simulada com sucesso',
      id: req.params.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Erro interno'});
  }
});

module.exports = router;