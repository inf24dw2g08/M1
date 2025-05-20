// Controlador de empréstimos
const Loan = require('../models/loanModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

exports.getAllLoans = async (req, res, next) => {
  console.log('GET /api/loans');
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
    console.error('Erro getAllLoans:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLoanById = async (req, res, next) => {
  console.log(`GET /api/loans/${req.params.id}`);
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
    console.error('Erro getLoanById:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createLoan = async (req, res, next) => {
  console.log('POST /api/loans body:', req.body);
  try {
    const { book_id, due_date } = req.body;
    const loan = await Loan.create({ user_id: req.user.id, book_id, due_date });
    return res.status(201).json(loan);
  } catch (err) {
    console.error('Erro createLoan:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateLoan = async (req, res, next) => {
  console.log(`PUT /api/loans/${req.params.id}`, req.body);
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    await loan.update(req.body);
    return res.json(loan);
  } catch (err) {
    console.error('Erro updateLoan:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteLoan = async (req, res, next) => {
  console.log(`DELETE /api/loans/${req.params.id}`);
  try {
    const rows = await Loan.destroy({ where: { id: req.params.id } });
    if (!rows) return res.status(404).json({ error: 'Empréstimo não encontrado' });
    return res.status(204).end();
  } catch (err) {
    console.error('Erro deleteLoan:', err);
    return res.status(500).json({ error: err.message });
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