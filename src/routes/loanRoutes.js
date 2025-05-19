// Rotas de empréstimos
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, authorizeRole, isResourceOwner } = require('../middleware/auth');
const { safeHandler } = require('../utils/routeUtil'); // Ajuste o caminho para apontar para o routeUtil.js na pasta raiz/utils

// processar forms
router.use(express.urlencoded({ extended: true }));

// UI: Listar, criar e excluir empréstimos
router.get('/loans', async (req, res) => {
  const loans = await loanController.getAllLoans({ json: true });
  const list = loans.map(l => `
    <li data-id="${l.id}">
      Empréstimo ${l.id}: user=${l.user_id}, book=${l.book_id}, due=${l.due_date}
      <form action="/loans/delete/${l.id}" method="post" style="display:inline">
        <button>Excluir</button>
      </form>
    </li>
  `).join('');
  res.send(`
    <h1>Empréstimos</h1>
    <form action="/loans" method="post">
      <input name="book_id" placeholder="ID do Livro" required>
      <input name="due_date" type="date" required>
      <button type="submit">Criar</button>
    </form>
    <ul>${list}</ul>
  `);
});

// criar via UI
router.post('/loans', async (req, res) => {
  await loanController.createLoan({ body: req.body, user: { id: req.body.user_id || req.user.id }, json: true });
  res.redirect('/loans');
});

// excluir via UI
router.post('/loans/delete/:id', async (req, res) => {
  await loanController.deleteLoan({ params: req.params, json: true });
  res.redirect('/loans');
});

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: book_id
 *         schema:
 *           type: integer
 *         description: Filter by book ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by loan status
 *     responses:
 *       200:
 *         description: List of loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', authenticateToken, 
  safeHandler(loanController.getAllLoans, 'Listagem de empréstimos não implementada'));

/**
 * @swagger
 * /api/loans/user:
 *   get:
 *     summary: Get loans for current user
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by loan status
 *     responses:
 *       200:
 *         description: List of user's loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/user', authenticateToken, 
  safeHandler(loanController.getUserLoans, 'Empréstimos do usuário não implementados'));

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not the owner or admin
 *       404:
 *         description: Loan not found
 */
router.get('/:id', authenticateToken, isResourceOwner('loan'), 
  safeHandler(loanController.getLoanById, 'Busca de empréstimo não implementada'));

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create new loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_id
 *             properties:
 *               book_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *                 description: Required for admin, ignored for normal users
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-05-31
 *                 description: Optional, defaults to 14 days from now
 *     responses:
 *       201:
 *         description: Loan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       400:
 *         description: Invalid request - Book unavailable or invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Book or user not found
 */
router.post('/', authenticateToken, 
  safeHandler(loanController.createLoan, 'Criação de empréstimo não implementada'));

/**
 * @swagger
 * /api/loans/{id}/return:
 *   post:
 *     summary: Return a loaned book
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not the owner or admin
 *       404:
 *         description: Loan not found
 *       400:
 *         description: Book already returned
 */
router.post('/:id/return', authenticateToken, isResourceOwner('loan', true), 
  safeHandler(loanController.returnBook, 'Devolução de livro não implementada'));

/**
 * @swagger
 * /api/loans/{id}:
 *   put:
 *     summary: Update loan (admin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-15
 *               status:
 *                 type: string
 *                 enum: [active, returned, overdue]
 *                 example: active
 *     responses:
 *       200:
 *         description: Loan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Loan not found
 */
router.put('/:id', authenticateToken, authorizeRole(['admin']), 
  safeHandler(loanController.updateLoan, 'Atualização de empréstimo não implementada'));

/**
 * @swagger
 * /api/loans/{id}:
 *   delete:
 *     summary: Delete loan (admin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Loan not found
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), 
  safeHandler(loanController.deleteLoan, 'Exclusão de empréstimo não implementada'));

/**
 * @swagger
 * /api/loans/overdue:
 *   get:
 *     summary: Get all overdue loans (admin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loan'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/overdue', authenticateToken, authorizeRole(['admin']), 
  safeHandler(loanController.getOverdueLoans, 'Empréstimos em atraso não implementados'));

/**
 * @swagger
 * /api/loans/stats:
 *   get:
 *     summary: Get loan statistics (admin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Loan statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLoans:
 *                   type: integer
 *                   example: 250
 *                 activeLoans:
 *                   type: integer
 *                   example: 45
 *                 overdueLoans:
 *                   type: integer
 *                   example: 12
 *                 averageLoanDuration:
 *                   type: number
 *                   example: 10.5
 *                   description: Average loan duration in days
 *                 mostBorrowedBooks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       book_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/stats', authenticateToken, authorizeRole(['admin']), 
  safeHandler(loanController.getLoanStats, 'Estatísticas não implementadas'));

module.exports = router;