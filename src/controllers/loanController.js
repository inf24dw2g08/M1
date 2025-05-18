// Controlador de empréstimos
const Loan = require('../models/loanModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

exports.getAllLoans = async (req, res, next) => {
  try {
    // Apenas admin pode ver todos os empréstimos
    const isAdmin = req.user.role === 'admin';
    
    const options = {
      include: [Book],
      order: [['loan_date', 'DESC']]
    };
    
    // Usuários comuns só podem ver seus próprios empréstimos
    if (!isAdmin) {
      options.where = { user_id: req.user.id };
    }
    
    const loans = await Loan.findAll(options);
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findByPk(req.params.id, { include: [Book] });
    
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    
    // Verificar se o usuário tem permissão para ver este empréstimo
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.id === loan.user_id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este empréstimo' });
    }
    
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLoan = async (req, res, next) => {
  try {
    const loan = await Loan.create({
      user_id: req.user.id,  // assumindo req.user do auth
      book_id: req.body.book_id,
      due_date: req.body.due_date
    });
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    await loan.update(req.body);
    res.json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const rows = await Loan.destroy({ where: { id: req.params.id } });
    if (!rows) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
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