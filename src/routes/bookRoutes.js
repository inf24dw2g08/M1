// Rotas de livros
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const Book = require('../models/bookModel');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// middleware para processar forms
router.use(express.urlencoded({ extended: true }));

// UI: listar livros e criar/atualizar/excluir via formulários
router.get('/books', async (req, res) => {
  const books = await Book.findAll({ order: [['title','ASC']] });
  res.send(`
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Livros</title></head><body>
      <h1>Livros</h1>
      <form id="createForm">
        <input name="title" placeholder="Título" required>
        <input name="author" placeholder="Autor" required>
        <button type="submit">Criar Livro</button>
      </form>
      <ul>
        ${books.map(b=>`
          <li>
            ${b.id} - ${b.title} by ${b.author}
            <form action="/books/update/${b.id}" method="post" style="display:inline">
              <input name="title" value="${b.title}" required>
              <input name="author" value="${b.author}" required>
              <button>Atualizar</button>
            </form>
            <form action="/books/delete/${b.id}" method="post" style="display:inline">
              <button>Excluir</button>
            </form>
          </li>
        `).join('')}
      </ul>
      <script>
        document.getElementById('createForm').addEventListener('submit', async e => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          const res = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) location.reload();
          else alert('Erro: ' + (await res.text()));
        });
      </script>
    </body></html>
  `);
});

// criar via UI
router.post('/books', async (req, res) => {
  await Book.create({ title: req.body.title, author: req.body.author });
  res.redirect('/books');
});

// atualizar via UI
router.post('/books/update/:id', async (req, res) => {
  await Book.update(
    { title: req.body.title, author: req.body.author },
    { where: { id: req.params.id } }
  );
  res.redirect('/books');
});

// excluir via UI
router.post('/books/delete/:id', async (req, res) => {
  await Book.destroy({ where: { id: req.params.id } });
  res.redirect('/books');
});

// API Endpoints
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', authenticateToken, authorizeRole(['admin']), bookController.createBook);
router.put('/:id', authenticateToken, authorizeRole(['admin']), bookController.updateBook);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), bookController.deleteBook);

module.exports = router;