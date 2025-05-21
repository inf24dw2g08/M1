// src/controllers/loanController.js
const Loan = require('../models/loanModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

// Função para formatar datas em formato brasileiro
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
    
    // Formatar datas para o padrão português
    const formattedLoans = loans.map(loan => {
      const loanData = loan.toJSON ? loan.toJSON() : loan;
      return {
        ...loanData,
        loan_date: formatDatePtBR(loanData.loan_date, true),
        due_date: formatDatePtBR(loanData.due_date, true),
        return_date: loanData.return_date ? formatDatePtBR(loanData.return_date, true) : null,
        created_at: formatDatePtBR(loanData.created_at, true),
        updated_at: formatDatePtBR(loanData.updated_at, true)
      };
    });
    
    res.json(formattedLoans);
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
    
    // Formatar datas para o padrão português
    const loanData = loan.toJSON ? loan.toJSON() : loan;
    const formattedLoan = {
      ...loanData,
      loan_date: formatDatePtBR(loanData.loan_date, true),
      due_date: formatDatePtBR(loanData.due_date, true),
      return_date: loanData.return_date ? formatDatePtBR(loanData.return_date, true) : null,
      created_at: formatDatePtBR(loanData.created_at, true),
      updated_at: formatDatePtBR(loanData.updated_at, true)
    };
    
    res.json(formattedLoan);
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
    
    // Formatar datas para o padrão português
    const loanData = loan.toJSON ? loan.toJSON() : loan;
    const formattedLoan = {
      ...loanData,
      loan_date: formatDatePtBR(loanData.loan_date, true),
      due_date: formatDatePtBR(loanData.due_date, true),
      return_date: loanData.return_date ? formatDatePtBR(loanData.return_date, true) : null,
      created_at: formatDatePtBR(loanData.created_at, true),
      updated_at: formatDatePtBR(loanData.updated_at, true)
    };
    
    return res.status(201).json(formattedLoan);
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
    
    // Buscar o loan atualizado com as associações
    const updatedLoan = await Loan.findByPk(req.params.id, { include: [Book] });
    
    // Formatar datas para o padrão português
    const loanData = updatedLoan.toJSON ? updatedLoan.toJSON() : updatedLoan;
    const formattedLoan = {
      ...loanData,
      loan_date: formatDatePtBR(loanData.loan_date, true),
      due_date: formatDatePtBR(loanData.due_date, true),
      return_date: loanData.return_date ? formatDatePtBR(loanData.return_date, true) : null,
      created_at: formatDatePtBR(loanData.created_at, true),
      updated_at: formatDatePtBR(loanData.updated_at, true)
    };
    
    return res.json(formattedLoan);
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