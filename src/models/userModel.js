const { pool } = require('../config/db.config');
const bcrypt = require("bcryptjs");

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(query);
      console.log('Tabela de usuários criada ou já existente');
    } catch (error) {
      console.error('Erro ao criar tabela de usuários:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por nome:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      userData.username,
      userData.email,
      hashedPassword,
      userData.role || 'user'
    ]);
    
    return result.insertId;
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    
    if (userData.username) {
      fields.push('username = ?');
      values.push(userData.username);
    }
    
    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    
    if (userData.role) {
      fields.push('role = ?');
      values.push(userData.role);
    }
    
    if (userData.password) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(userData.password, 10));
    }
    
    values.push(id);
    
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = User;