const db = require('../config/db.config');
const bcrypt = require("bcryptjs");

// Obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

// Obter usuário por ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const [users] = await db.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

// Criar um novo usuário
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validar dados
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se usuário já existe
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Nome de usuário ou email já está em uso' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Inserir usuário
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );
    
    res.status(201).json({
      id: result.insertId,
      username,
      email,
      role: role || 'user'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password } = req.body;
    
    // Verificar se usuário existe
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Preparar dados para atualização
    const updates = {};
    
    if (email) updates.email = email;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
    }
    
    // Construir query de atualização
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    // Adicionar ID ao final dos valores
    values.push(userId);
    
    // Executar atualização
    await db.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

// Excluir usuário
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar se usuário existe
    const [users] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Excluir empréstimos do usuário primeiro (integridade referencial)
    await db.query('DELETE FROM loans WHERE user_id = ?', [userId]);
    
    // Excluir usuário
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
};

// Registrar novo usuário (rota pública)
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validar dados
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se usuário já existe
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Nome de usuário ou email já está em uso' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Inserir usuário com role 'user'
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );
    
    res.status(201).json({
      id: result.insertId,
      username,
      email,
      role: 'user'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  registerUser
};