const Book = require('../models/bookModel');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (err) {
    console.error('Erro ao listar livros:', err);
    res.status(500).json({ message: 'Erro ao listar livros', error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }
    res.json(book);
  } catch (err) {
    console.error('Erro ao buscar livro:', err);
    res.status(500).json({ message: 'Erro ao buscar livro', error: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, published_year, quantity, available } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: 'Título e autor são obrigatórios' });
    }
    const newBook = await Book.create({ 
      title, 
      author, 
      isbn, 
      published_year, 
      quantity: quantity || 1, 
      available: available !== undefined ? available : true 
    });
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Erro ao criar livro:', err);
    res.status(500).json({ message: 'Erro ao criar livro', error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }
    await book.update(req.body);
    const updatedBook = await Book.findByPk(req.params.id);
    res.json(updatedBook);
  } catch (err) {
    console.error('Erro ao atualizar livro:', err);
    res.status(500).json({ message: 'Erro ao atualizar livro', error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }
    await book.destroy();
    res.status(204).end();
  } catch (err) {
    console.error('Erro ao excluir livro:', err);
    res.status(500).json({ message: 'Erro ao excluir livro', error: err.message });
  }
};