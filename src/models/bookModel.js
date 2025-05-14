// Modelo de livros
const db = require('../config/db.config');

class Book {
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE id = ?', 
      [id]
    );
    return rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM books';
    const queryParams = [];
    const conditions = [];
    
    if (filters.title) {
      conditions.push('title LIKE ?');
      queryParams.push(`%${filters.title}%`);
    }
    
    if (filters.author) {
      conditions.push('author LIKE ?');
      queryParams.push(`%${filters.author}%`);
    }
    
    if (filters.genre) {
      conditions.push('genre LIKE ?');
      queryParams.push(`%${filters.genre}%`);
    }
    
    if (filters.available !== undefined) {
      conditions.push('available = ?');
      queryParams.push(filters.available);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [rows] = await db.query(query, queryParams);
    return rows;
  }

  static async create(bookData) {
    const [result] = await db.query(
      `INSERT INTO books (title, author, isbn, publication_year, genre, description, available) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.publication_year,
        bookData.genre,
        bookData.description,
        bookData.available !== undefined ? bookData.available : true
      ]
    );
    return result.insertId;
  }

  static async update(id, bookData) {
    const fields = [];
    const values = [];

    Object.entries(bookData).forEach(([key, value]) => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    values.push(id);

    const [result] = await db.query(
      `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows;
  }

  // Métodos adicionais específicos
  static async checkAvailability(id) {
    const [rows] = await db.query(
      'SELECT available FROM books WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0].available;
  }
}

module.exports = Book;