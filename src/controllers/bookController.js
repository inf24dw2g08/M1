// Controlador de livros
const Book = require('../models/bookModel');

exports.getAllBooks = async (req, res, next) => {
  console.log('GET /api/books'); // log
  try {
    const filters = {
      title: req.query.title,
      author: req.query.author,
      genre: req.query.genre,
      available: req.query.available === 'true' ? true : 
                (req.query.available === 'false' ? false : undefined)
    };
    
    const books = await Book.findAll({ order: [['title','ASC']] });
    res.json(books || []); // Garante que retornamos pelo menos array vazio
  } catch (err) {
    console.error('Erro ao listar livros:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getBookById = async (req, res) => {
  console.log('GET /api/books/' + req.params.id);
  if (!req.params.id) {
    return res.status(400).json({ message: "ID not provided" });
  }
  
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.json(book);
  } catch (err) {
    console.error('Erro ao buscar livro:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.createBook = async (req, res) => {
  console.log('POST /api/books body:', req.body);
  try {
    const { title, author, isbn, published_year, quantity, available } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }
    const newBook = await Book.create({ title, author, isbn, published_year, quantity: quantity ?? 1, available: available ?? true });
    return res.status(201).json(newBook);
  } catch (err) {
    console.error('Erro createBook:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  console.log(`PUT /api/books/${req.params.id}`, req.body);
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await book.update(req.body);
    return res.json(book);
  } catch (err) {
    console.error('Erro updateBook:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  console.log(`DELETE /api/books/${req.params.id}`);
  try {
    const rows = await Book.destroy({ where: { id: req.params.id } });
    if (!rows) return res.status(404).json({ error: 'Book not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('Erro deleteBook:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const available = await Book.checkAvailability(bookId);
    
    if (available === null) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ available });
  } catch (error) {
    next(error);
  }
};