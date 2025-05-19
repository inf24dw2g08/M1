// Controlador de livros
const Book = require('../models/bookModel');

exports.getAllBooks = async (req, res, next) => {
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

exports.createBook = async (req, res, next) => {
  try {
    // extrai somente os campos válidos
    const { title, author, isbn, published_year, quantity, available } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }
    const newBook = await Book.create({
      title,
      author,
      isbn,
      published_year,
      quantity: quantity ?? 1,
      available: available ?? true
    });
    // retorna o objeto criado
    return res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Atualizar o livro
    await book.update(req.body);
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const rows = await Book.destroy({ where: { id: req.params.id } });
    if (!rows) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
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