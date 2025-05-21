const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/userModel');

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

// listar todos usuários
const getAllUsers = async (req, res) => {
  console.log('getAllUsers chamado por:', req.user); // log do usuário autenticado
  try {
    const users = await User.findAll({ attributes: ['id','username','email','role','created_at','updated_at'] });
    
    // Formatar datas para o padrão português
    const formattedUsers = users.map(user => {
      const userData = user.toJSON ? user.toJSON() : user;
      return {
        ...userData,
        created_at: formatDatePtBR(userData.created_at, true),
        updated_at: formatDatePtBR(userData.updated_at, true)
      };
    });
    
    return res.json(formattedUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ error: error.message });
  }
};

// obter um usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id','username','email','role','created_at','updated_at']
    });
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    // Formatar datas para o padrão português
    const userData = user.toJSON ? user.toJSON() : user;
    const formattedUser = {
      ...userData,
      created_at: formatDatePtBR(userData.created_at, true),
      updated_at: formatDatePtBR(userData.updated_at, true)
    };
    
    res.json(formattedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// criar usuário (admin)
const createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const newUser = await User.create({ ...req.body, password: hash });
    
    // Remover a senha e formatar datas antes de retornar
    const userData = newUser.toJSON ? newUser.toJSON() : newUser;
    delete userData.password;
    const formattedUser = {
      ...userData,
      created_at: formatDatePtBR(userData.created_at, true),
      updated_at: formatDatePtBR(userData.updated_at, true)
    };
    
    res.status(201).json(formattedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// atualizar usuário (admin ou dono via middleware)
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    
    await user.update(req.body);
    
    // Buscar o usuário atualizado para retornar (excluindo a senha)
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: ['id','username','email','role','created_at','updated_at']
    });
    
    // Formatar datas para o padrão português
    const userData = updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;
    const formattedUser = {
      ...userData,
      created_at: formatDatePtBR(userData.created_at, true),
      updated_at: formatDatePtBR(userData.updated_at, true)
    };
    
    res.json(formattedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// excluir usuário (admin)
const deleteUser = async (req, res) => {
  try {
    const rows = await User.destroy({ where: { id: req.params.id } });
    if (!rows) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// registrar novo usuário (rota pública)
const registerUser = async (req, res) => {
  console.log('registerUser body:', req.body);        // log do payload
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    const exists = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    if (exists) {
      return res.status(400).json({ error: 'Username ou email já em uso' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role:'user' });
    
    // Remover a senha e formatar datas antes de retornar
    const userData = user.toJSON ? user.toJSON() : user;
    delete userData.password;
    const formattedUser = {
      ...userData,
      created_at: formatDatePtBR(userData.created_at, true),
      updated_at: formatDatePtBR(userData.updated_at, true)
    };
    
    res.status(201).json(formattedUser);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);  // log do stack
    res.status(500).json({ error: error.message });       // retorna mensagem real
  }
};

// perfil do usuário autenticado
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { 
      attributes: ['id','username','email','role','created_at','updated_at'] 
    });
    
    // Formatar datas para o padrão português
    const userData = user.toJSON ? user.toJSON() : user;
    const formattedUser = {
      ...userData,
      created_at: formatDatePtBR(userData.created_at, true),
      updated_at: formatDatePtBR(userData.updated_at, true)
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};

// atualizar perfil do usuário autenticado
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { username, email, password } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    
    // Remover a senha e formatar datas antes de retornar
    const userData = user.toJSON ? user.toJSON() : user;
    delete userData.password;
    const formattedUser = {
      ...userData,
      created_at: formatDatePtBR(userData.created_at, true),
      updated_at: formatDatePtBR(userData.updated_at, true)
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  getProfile,
  updateProfile
};