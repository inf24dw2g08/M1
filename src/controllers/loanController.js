// Controlador de empréstimos
const Loan = require('../models/loanModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

exports.getAllLoans = async (req, res, next) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      book_id: req.query.book_id,
      status: req.query.status,
      sort: req.query.sort || 'loan_date',
      direction: req.query.direction || 'DESC'
    };
    
    const loans = await Loan.getAll(filters);
    res.json(loans);
  } catch (error) {
    next(error);
  }
};

exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.json(loan);
  } catch (error) {
    next(error);
  }
};

exports.createLoan = async (req, res, next) => {
  try {
    const { user_id, book_id, due_date } = req.body;
    
    // Validação básica
    if (!user_id || !book_id || !due_date) {
      return res.status(400).json({ message: 'User ID, Book ID and Due Date are required' });
    }
    
    // Verificar se o utilizador existe
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verificar se o livro existe
    const book = await Book.findById(book_id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Verificar se o livro está disponível
    if (!book.available) {
      return res.status(400).json({ message: 'Book is not available for loan' });
    }
    
    // Criar o empréstimo
    try {
      const loanId = await Loan.create({
        user_id,
        book_id,
        due_date
      });
      
      res.status(201).json({ 
        message: 'Loan created successfully',
        loanId 
      });
    } catch (error) {
      if (error.message.includes('not available')) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    
    // Verificar se o empréstimo existe
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Verificar se o livro já foi devolvido
    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned' });
    }
    
    // Devolver o livro
    const result = await Loan.returnBook(loanId);
    
    if (result) {
      res.json({ message: 'Book returned successfully' });
    } else {
      res.status(400).json({ message: 'Failed to return book' });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateLoan = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    
    // Verificar se o empréstimo existe
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Atualizar o empréstimo
    const result = await Loan.update(loanId, req.body);
    
    if (result) {
      res.json({ message: 'Loan updated successfully' });
    } else {
      res.status(400).json({ message: 'Failed to update loan' });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const loanId = req.params.id;
    
    // Verificar se o empréstimo existe
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Apagar o empréstimo
    const result = await Loan.delete(loanId);
    
    if (result) {
      res.json({ message: 'Loan deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete loan' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserLoans = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Buscar apenas empréstimos do usuário logado
    const loans = await Loan.getUserLoans(userId);
    
    // Log de acesso aos recursos próprios
    console.log('\x1b[36m%s\x1b[0m', '------------------------------------------------');
    console.log('👤 Acesso a recursos próprios:');
    console.log(`   Usuário ID: ${userId}`);
    console.log(`   Recurso: Empréstimos do usuário`);
    console.log(`   Total de registros: ${loans.length}`);
    console.log('\x1b[36m%s\x1b[0m', '------------------------------------------------');
    
    res.json(loans);
  } catch (error) {
    next(error);
  }
};