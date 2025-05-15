const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Rota para obter estatísticas do banco de dados (apenas para admin)
router.get('/db-stats', 
  (req, res, next) => authenticateToken(['admin'])(req, res, next),
  (req, res, next) => authorizeRole(['admin'])(req, res, next),
  async (req, res) => {
    try {
      // Obter contagem de registros em cada tabela
      const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users');
      const [booksCount] = await db.query('SELECT COUNT(*) as count FROM books');
      const [loansCount] = await db.query('SELECT COUNT(*) as count FROM loans');
      
      // Retornar estatísticas
      res.json({
        tables: {
          users: usersCount[0].count,
          books: booksCount[0].count,
          loans: loansCount[0].count
        },
        total_records: usersCount[0].count + booksCount[0].count + loansCount[0].count
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do banco de dados:', error);
      res.status(500).json({ message: 'Erro ao obter estatísticas do banco de dados' });
    }
  }
);

module.exports = router;
