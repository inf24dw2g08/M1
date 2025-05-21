const Book = require('../models/bookModel');

// Função de formatação de data (adicionada para não depender de outro arquivo)
const formatDatePtBR = (date, includeTime = false) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  
  // Formatar dia/mês/ano
  const dia = dateObj.getDate().toString().padStart(2, '0');
  const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const ano = dateObj.getFullYear();
  
  let result = `${dia}/${mes}/${ano}`;
  
  // Adicionar horas e minutos se solicitado
  if (includeTime) {
    const hora = dateObj.getHours().toString().padStart(2, '0');
    const minuto = dateObj.getMinutes().toString().padStart(2, '0');
    result += ` ${hora}:${minuto}`;
  }
  
  return result;
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    
    // Formatar datas para o padrão português
    const formattedBooks = books.map(book => {
      const bookData = book.toJSON ? book.toJSON() : book;
      return {
        ...bookData,
        created_at: formatDatePtBR(bookData.created_at, true),
        updated_at: formatDatePtBR(bookData.updated_at, true)
      };
    });
    
    res.json(formattedBooks);
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
    
    // Formatar datas para o padrão português
    const bookData = book.toJSON ? book.toJSON() : book;
    const formattedBook = {
      ...bookData,
      created_at: formatDatePtBR(bookData.created_at, true),
      updated_at: formatDatePtBR(bookData.updated_at, true)
    };
    
    res.json(formattedBook);
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
    
    // Formatar datas para o padrão português
    const bookData = newBook.toJSON ? newBook.toJSON() : newBook;
    const formattedBook = {
      ...bookData,
      created_at: formatDatePtBR(bookData.created_at, true),
      updated_at: formatDatePtBR(bookData.updated_at, true)
    };
    
    res.status(201).json(formattedBook);
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
    
    // Formatar datas para o padrão português
    const bookData = updatedBook.toJSON ? updatedBook.toJSON() : updatedBook;
    const formattedBook = {
      ...bookData,
      created_at: formatDatePtBR(bookData.created_at, true),
      updated_at: formatDatePtBR(bookData.updated_at, true)
    };
    
    res.json(formattedBook);
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