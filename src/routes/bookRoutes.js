// Rotas de livros
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', bookController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Hobbit
 *               author:
 *                 type: string
 *                 example: J.R.R. Tolkien
 *               isbn:
 *                 type: string
 *                 example: 9780547928227
 *               publication_year:
 *                 type: integer
 *                 example: 1937
 *               genre:
 *                 type: string
 *                 example: Fantasy
 *               description:
 *                 type: string
 *                 example: A fantasy novel about a hobbit who goes on an adventure
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/', authenticateToken, authorizeRole(['admin']), bookController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               publication_year:
 *                 type: integer
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Book not found
 */
router.put('/:id', authenticateToken, authorizeRole(['admin']), bookController.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Book not found
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), bookController.deleteBook);

module.exports = router;