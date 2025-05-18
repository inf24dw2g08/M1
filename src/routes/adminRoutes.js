const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const User = require('../models/userModel');
const Book = require('../models/bookModel');
const Loan = require('../models/loanModel');

// Rota para obter estatísticas do banco de dados (apenas para admin)
router.get('/db-stats', 
  (req, res, next) => authenticateToken(['admin'])(req, res, next),
  (req, res, next) => authorizeRole(['admin'])(req, res, next),
  async (req, res) => {
    try {
      // Obter contagem de registros em cada tabela
      const users = await User.count();
      const books = await Book.count();
      const loans = await Loan.count();
      
      // Retornar estatísticas
      res.json({
        tables: { users, books, loans },
        total_records: users + books + loans
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do banco de dados:', error);
      res.status(500).json({ message: 'Erro ao obter estatísticas do banco de dados' });
    }
  }
);

module.exports = router;
