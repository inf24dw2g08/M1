// Rotas de livros
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const Book = require('../models/bookModel');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../middleware/auth');

// Rota UI para listar livros
router.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    
    // Verifique o tipo de solicitação para determinar resposta
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      // Retornar página HTML simples com lista de livros
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Biblioteca - Livros</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .button { background: #4CAF50; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Biblioteca - Livros Disponíveis</h1>
          
          <table>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Ano</th>
              <th>Ações</th>
            </tr>
      `;
      
      books.forEach(book => {
        html += `
            <tr>
              <td>${book.title}</td>
              <td>${book.author}</td>
              <td>${book.published_year}</td>
              <td>
                <a href="/api/books/${book.id}">Detalhes</a>
                <button class="button" onclick="emprestar(${book.id})">Emprestar</button>
              </td>
            </tr>
        `;
      });
      
      html += `
          </table>
          
          <script>
            function emprestar(bookId) {
              fetch('/api/loans', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  book_id: bookId,
                  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })
              })
              .then(response => {
                if (response.ok) {
                  alert('Livro emprestado com sucesso!');
                } else {
                  alert('Erro ao emprestar livro. Faça login primeiro.');
                  window.location.href = '/login';
                }
              });
            }
          </script>
        </body>
        </html>
      `;
      
      res.send(html);
    } else {
      // Retornar JSON para solicitações de API
      res.json(books);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar livros: ' + err.message });
  }
});

// API Endpoints
router.get('/api', bookController.getAllBooks);
router.get('/api/:id', bookController.getBookById);
router.post('/api', authenticateToken, authorizeRole(['admin']), bookController.createBook);
router.put('/api/:id', authenticateToken, authorizeRole(['admin']), bookController.updateBook);
router.delete('/api/:id', authenticateToken, authorizeRole(['admin']), bookController.deleteBook);

module.exports = router;