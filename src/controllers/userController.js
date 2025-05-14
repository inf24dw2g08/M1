const User = require('../models/userModel');
const bcrypt = require('bcrypt');

/**
 * Obtém um usuário pelo ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Não retornar a senha no response
    delete user.password;
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém todos os usuários (apenas para admins)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Verificar se o usuário atual é admin - esta verificação também pode ser feita via middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const users = await User.findAll();
    
    // Remover senhas da resposta
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza um usuário
 */
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Verificar se o usuário existe
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verificar permissões - apenas o próprio usuário ou um admin pode atualizar
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { name, email, role } = req.body;
    let { password } = req.body;
    
    // Se a senha foi fornecida, hash ela
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }
    
    // Atualizar usuário
    await User.update(userId, { 
      name, 
      email, 
      password, 
      role: req.user.role === 'admin' ? role : existingUser.role // Apenas admins podem alterar roles
    });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Exclui um usuário
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Verificar se o usuário existe
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verificar permissões - apenas o próprio usuário ou um admin pode excluir
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Excluir usuário
    await User.delete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};