// Modelo de empréstimos
const db = require('../config/db.config');

class Loan {
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT l.*, b.title as book_title, u.name as user_name 
       FROM loans l
       JOIN books b ON l.book_id = b.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = ?`, 
      [id]
    );
    return rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT l.*, b.title as book_title, u.name as user_name 
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
    `;
    
    const queryParams = [];
    const conditions = [];
    
    if (filters.user_id) {
      conditions.push('l.user_id = ?');
      queryParams.push(filters.user_id);
    }
    
    if (filters.status) {
      conditions.push('l.status = ?');
      queryParams.push(filters.status);
    }
    
    if (filters.book_id) {
      conditions.push('l.book_id = ?');
      queryParams.push(filters.book_id);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    if (filters.sort) {
      query += ` ORDER BY ${filters.sort} ${filters.direction || 'ASC'}`;
    }
    
    const [rows] = await db.query(query, queryParams);
    return rows;
  }

  static async create(loanData) {
    // Verificar se o livro está disponível
    const [bookRows] = await db.query(
      'SELECT available FROM books WHERE id = ?',
      [loanData.book_id]
    );
    
    if (bookRows.length === 0 || !bookRows[0].available) {
      throw new Error('Book is not available for loan');
    }
    
    // Criar o empréstimo e atualizar o estado do livro em uma transação
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Inserir o empréstimo
      const [result] = await connection.query(
        `INSERT INTO loans (user_id, book_id, due_date, status) 
         VALUES (?, ?, ?, 'active')`,
        [loanData.user_id, loanData.book_id, loanData.due_date]
      );
      
      // Atualizar o estado do livro
      await connection.query(
        'UPDATE books SET available = FALSE WHERE id = ?',
        [loanData.book_id]
      );
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, loanData) {
    const fields = [];
    const values = [];

    Object.entries(loanData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'book_id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    values.push(id);

    const [result] = await db.query(
      `UPDATE loans SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async returnBook(id) {
    // Obter o ID do livro associado ao empréstimo
    const [loanRows] = await db.query(
      'SELECT book_id FROM loans WHERE id = ?',
      [id]
    );
    
    if (loanRows.length === 0) {
      throw new Error('Loan not found');
    }
    
    const bookId = loanRows[0].book_id;
    
    // Atualizar o empréstimo e o estado do livro em uma transação
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Atualizar o empréstimo
      await connection.query(
        `UPDATE loans SET 
         return_date = CURRENT_TIMESTAMP, 
         status = 'returned' 
         WHERE id = ?`,
        [id]
      );
      
      // Atualizar o estado do livro
      await connection.query(
        'UPDATE books SET available = TRUE WHERE id = ?',
        [bookId]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM loans WHERE id = ?', [id]);
    return result.affectedRows;
  }

  // Métodos adicionais específicos
  static async getUserLoans(userId) {
    const [rows] = await db.query(
      `SELECT l.*, b.title as book_title 
       FROM loans l
       JOIN books b ON l.book_id = b.id
       WHERE l.user_id = ?
       ORDER BY l.loan_date DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = Loan;