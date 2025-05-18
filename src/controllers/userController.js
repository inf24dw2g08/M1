const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// listar todos usuários
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// obter um usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
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
    res.status(201).json(newUser);
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
    res.json(user);
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
  try {
    const { username, email, password } = req.body;
    if (!username||!email||!password) return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    const exists = await User.findOne({ where: { [User.sequelize.Op.or]: [{username},{email}] } });
    if (exists) return res.status(400).json({ message: 'Username ou email já em uso' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role:'user' });
    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

// perfil do usuário autenticado
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id','username','email','role','createdAt','updatedAt'] });
    res.json(user);
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
    res.json(user);
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