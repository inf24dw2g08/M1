const db = require('./db.config');

// Adicionar função para criar as tabelas do banco de dados
async function createTables() {
  try {
    console.log('Criando tabelas...');
    
    // Criar tabela de usuários
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela de livros
    await db.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        published_year INT,
        genre VARCHAR(50),
        description TEXT,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela de empréstimos
    await db.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        return_date TIMESTAMP NULL,
        status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);
    
    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error.message);
    throw error;
  }
}

// Função principal para popular o banco de dados
async function seedDatabase() {
  try {
    console.log('Iniciando população da base de dados...');
    
    // Primeiro criar as tabelas
    await createTables();
    
    // Verificar se já existem usuários
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Se não existirem usuários, populamos o banco
    if (rows[0].count === 0) {
      console.log('Populando banco de dados com dados iniciais...');
      
      // Adicionar usuários
      await db.query(`
        INSERT INTO users (username, email, password, role) VALUES
        ('admin', 'admin@example.com', '$2b$10$KpZ6AO.dU0tX3OS3wJH1R.sR6Kh7qP9oq6aK0NNL6dRRRjZY7vMwK', 'admin'),
        ('user1', 'user1@example.com', '$2b$10$KpZ6AO.dU0tX3OS3wJH1R.sR6Kh7qP9oq6aK0NNL6dRRRjZY7vMwK', 'user')
      `);
      
      // Adicionar livros
      await db.query(`
        INSERT INTO books (title, author, isbn, published_year, genre, description, available) VALUES
        ('O Hobbit', 'J.R.R. Tolkien', '9788595084742', 1937, 'Fantasia', 'Uma aventura incrível', TRUE),
        ('1984', 'George Orwell', '9788535914849', 1949, 'Ficção Científica', 'Um clássico distópico', TRUE),
        ('Dom Quixote', 'Miguel de Cervantes', '9788573264333', 1605, 'Clássico', 'O cavaleiro da triste figura', TRUE)
      `);
      
      console.log('Banco de dados populado com sucesso!');
    } else {
      console.log('Banco de dados já possui dados, pulando população inicial.');
    }
  } catch (error) {
    console.error('Erro ao popular base de dados:', error.message);
    throw error;
  }
}

module.exports = seedDatabase;