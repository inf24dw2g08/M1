-- Criação da tabela de usuários com coluna refresh_token
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  google_id VARCHAR(255) NULL,
  external_auth VARCHAR(50) NULL,
  refresh_token TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir um usuário administrador padrão (senha: admin123)
INSERT IGNORE INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$3mVmjGg8fGt07FMx4V4wM.q5KBFUgDe9q3HVF6jb.YFJOu4WdYfrm', 'admin');

-- Criação de outras tabelas necessárias para a biblioteca
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  published_year INT,
  quantity INT DEFAULT 1,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  return_date TIMESTAMP NULL,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Inserir alguns livros de amostra
INSERT INTO books (title, author, isbn, published_year, quantity, available) 
VALUES 
('Dom Quixote', 'Miguel de Cervantes', '9788573264845', 1605, 3, true),
('Os Lusíadas', 'Luís de Camões', '9788525410597', 1572, 2, true),
('O Príncipe', 'Maquiavel', '9788532624673', 1532, 5, true),
('A Metamorfose', 'Franz Kafka', '9788573261202', 1915, 4, true);
