// src/routes/loanRoutes.js
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// CRUD de empréstimos (prefixo: /api/loans)
router.get('/', authenticateToken, loanController.getAllLoans);
router.get('/:id', authenticateToken, loanController.getLoanById);
router.post('/', authenticateToken, loanController.createLoan);
router.put('/:id', authenticateToken, authorizeRole(['admin']), loanController.updateLoan);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), loanController.deleteLoan);

module.exports = router;