// Rotas de livros
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// CRUD de livros
router.get('/',                  bookController.getAllBooks);
router.get('/:id',               bookController.getBookById);
router.post('/', authenticateToken, authorizeRole(['admin']), bookController.createBook);
router.put('/:id', authenticateToken, authorizeRole(['admin']), bookController.updateBook);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), bookController.deleteBook);

module.exports = router;