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
    
    const books = await Book.getAll(filters);
    res.json(books);
  } catch (error) {
    next(error);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, publication_year, genre, description } = req.body;
    
    // Validação básica
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }
    
    // Criar o livro
    const bookId = await Book.create({
      title,
      author,
      isbn,
      publication_year,
      genre,
      description,
      available: true
    });
    
    res.status(201).json({ 
      message: 'Book created successfully',
      bookId 
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    
    // Verificar se o livro existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Atualizar o livro
    const result = await Book.update(bookId, req.body);
    
    if (result) {
      res.json({ message: 'Book updated successfully' });
    } else {
      res.status(400).json({ message: 'Failed to update book' });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    
    // Verificar se o livro existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Apagar o livro
    const result = await Book.delete(bookId);
    
    if (result) {
      res.json({ message: 'Book deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete book' });
    }
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