-- Criação da base de dados
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Tabela de utilizadores
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de livros
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  publication_year INT,
  genre VARCHAR(50),
  description TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de empréstimos (relação 1:n entre utilizadores e empréstimos)
CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  return_date TIMESTAMP NULL,
  status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Inserção de dados de exemplo para utilizadores
-- Senha padrão: Password123 (hash: $2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@library.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'admin'),
('John Doe', 'john@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Jane Smith', 'jane@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Mike Johnson', 'mike@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Sara Williams', 'sara@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('David Brown', 'david@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Lisa Green', 'lisa@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Robert Taylor', 'robert@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Emma Wilson', 'emma@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('James Martin', 'james@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Olivia Clark', 'olivia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('William Harris', 'william@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Sophia Allen', 'sophia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Benjamin Young', 'benjamin@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Mia Lee', 'mia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Librarian', 'librarian@library.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'admin'),
('Alice Cooper', 'alice@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Bob Miller', 'bob@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Charlie Davis', 'charlie@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Diana Evans', 'diana@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Eric Foster', 'eric@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Fiona Grant', 'fiona@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('George Hill', 'george@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Hannah Irwin', 'hannah@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Ian Jackson', 'ian@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Julia King', 'julia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Kevin Lewis', 'kevin@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Laura Moore', 'laura@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Mark Nelson', 'mark@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('Nina Owen', 'nina@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user');

-- Inserção de dados de exemplo para livros
INSERT INTO books (title, author, isbn, publication_year, genre, description, available) VALUES
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 1960, 'Fiction', 'The story of racial injustice and the loss of innocence in the American South.', TRUE),
('1984', 'George Orwell', '9780451524935', 1949, 'Dystopian', 'A dystopian novel set in a totalitarian regime.', TRUE),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 1813, 'Classic', 'A romantic novel of manners.', TRUE),
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 1925, 'Fiction', 'A story of wealth, love, and the American dream.', TRUE),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 1951, 'Fiction', 'A story of teenage angst and alienation.', TRUE),
('The Hobbit', 'J.R.R. Tolkien', '9780618260300', 1937, 'Fantasy', 'A fantasy novel about a hobbit who goes on an adventure.', TRUE),
('Animal Farm', 'George Orwell', '9780451526342', 1945, 'Satire', 'A satirical allegory of the Russian Revolution.', TRUE),
('Lord of the Flies', 'William Golding', '9780399501487', 1954, 'Fiction', 'A story about a group of boys stranded on an uninhabited island.', TRUE),
('The Alchemist', 'Paulo Coelho', '9780062315007', 1988, 'Fiction', 'A philosophical novel about following your dreams.', TRUE),
('Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', '9780747532743', 1997, 'Fantasy', 'The first book in the Harry Potter series.', TRUE),
('The Da Vinci Code', 'Dan Brown', '9780307474278', 2003, 'Thriller', 'A mystery thriller novel.', TRUE),
('The Little Prince', 'Antoine de Saint-Exupéry', '9780156012195', 1943, 'Children\'s Literature', 'A poetic tale of a young prince who visits various planets.', TRUE),
('Brave New World', 'Aldous Huxley', '9780060850524', 1932, 'Dystopian', 'A dystopian novel of a futuristic society.', TRUE),
('The Old Man and the Sea', 'Ernest Hemingway', '9780684801223', 1952, 'Fiction', 'A story about an aging fisherman who struggles with a giant marlin.', TRUE),
('The Road', 'Cormac McCarthy', '9780307387899', 2006, 'Post-apocalyptic', 'A post-apocalyptic novel about a journey of a father and his son.', TRUE),
('Gone with the Wind', 'Margaret Mitchell', '9781451635621', 1936, 'Historical Fiction', 'A historical novel set in the South during the Civil War.', TRUE),
('The Kite Runner', 'Khaled Hosseini', '9781594631931', 2003, 'Fiction', 'A story of friendship, betrayal, and redemption set in Afghanistan.', TRUE),
('Moby-Dick', 'Herman Melville', '9780142437247', 1851, 'Adventure', 'The voyage of the whaling ship Pequod.', TRUE),
('The Chronicles of Narnia', 'C.S. Lewis', '9780066238500', 1950, 'Fantasy', 'A series of fantasy novels.', TRUE),
('The Hitchhiker\'s Guide to the Galaxy', 'Douglas Adams', '9780345391803', 1979, 'Science Fiction', 'A comedy science fiction series.', TRUE),
('War and Peace', 'Leo Tolstoy', '9781400079988', 1869, 'Historical Fiction', 'A novel about Russian society during the Napoleonic era.', TRUE),
('Crime and Punishment', 'Fyodor Dostoevsky', '9780143107637', 1866, 'Psychological Fiction', 'A novel about the mental anguish of a poor ex-student who murders a pawnbroker.', TRUE),
('One Hundred Years of Solitude', 'Gabriel García Márquez', '9780060883287', 1967, 'Magical Realism', 'A landmark of magical realism.', TRUE),
('The Odyssey', 'Homer', '9780140268867', -800, 'Epic Poetry', 'An ancient Greek epic poem.', TRUE),
('Fahrenheit 451', 'Ray Bradbury', '9781451673319', 1953, 'Dystopian', 'A dystopian novel about a futuristic American society.', TRUE),
('The Divine Comedy', 'Dante Alighieri', '9780142437223', 1320, 'Epic Poetry', 'An Italian narrative poem representing the soul\'s journey towards God.', TRUE),
('The Brothers Karamazov', 'Fyodor Dostoevsky', '9780374528379', 1880, 'Philosophical Novel', 'A passionate philosophical novel set in 19th-century Russia.', TRUE),
('Don Quixote', 'Miguel de Cervantes', '9780060934347', 1605, 'Novel', 'Considered a founding work of modern Western literature.', TRUE),
('The Wind in the Willows', 'Kenneth Grahame', '9780143039099', 1908, 'Children\'s Literature', 'A classic of children\'s literature.', TRUE),
('Anna Karenina', 'Leo Tolstoy', '9780143035008', 1877, 'Novel', 'A complex novel about an extramarital affair.', TRUE);

-- Inserção de dados de exemplo para empréstimos
-- Alguns empréstimos ativos
INSERT INTO loans (user_id, book_id, loan_date, due_date, status) VALUES
(2, 1, '2023-03-01', '2023-03-15', 'active'),
(3, 2, '2023-03-02', '2023-03-16', 'active'),
(4, 3, '2023-03-03', '2023-03-17', 'active'),
(5, 4, '2023-03-04', '2023-03-18', 'active'),
(6, 5, '2023-03-05', '2023-03-19', 'active'),
(7, 6, '2023-03-06', '2023-03-20', 'active'),
(8, 7, '2023-03-07', '2023-03-21', 'active'),
(9, 8, '2023-03-08', '2023-03-22', 'active'),
(10, 9, '2023-03-09', '2023-03-23', 'active'),
(11, 10, '2023-03-10', '2023-03-24', 'active');

-- Alguns empréstimos retornados
INSERT INTO loans (user_id, book_id, loan_date, due_date, return_date, status) VALUES
(12, 11, '2023-02-01', '2023-02-15', '2023-02-14', 'returned'),
(13, 12, '2023-02-02', '2023-02-16', '2023-02-15', 'returned'),
(14, 13, '2023-02-03', '2023-02-17', '2023-02-16', 'returned'),
(15, 14, '2023-02-04', '2023-02-18', '2023-02-17', 'returned'),
(16, 15, '2023-02-05', '2023-02-19', '2023-02-18', 'returned'),
(17, 16, '2023-02-06', '2023-02-20', '2023-02-19', 'returned'),
(18, 17, '2023-02-07', '2023-02-21', '2023-02-20', 'returned'),
(19, 18, '2023-02-08', '2023-02-22', '2023-02-21', 'returned'),
(20, 19, '2023-02-09', '2023-02-23', '2023-02-22', 'returned'),
(21, 20, '2023-02-10', '2023-02-24', '2023-02-23', 'returned');

-- Alguns empréstimos em atraso
INSERT INTO loans (user_id, book_id, loan_date, due_date, status) VALUES
(22, 21, '2023-01-01', '2023-01-15', 'overdue'),
(23, 22, '2023-01-02', '2023-01-16', 'overdue'),
(24, 23, '2023-01-03', '2023-01-17', 'overdue'),
(25, 24, '2023-01-04', '2023-01-18', 'overdue'),
(26, 25, '2023-01-05', '2023-01-19', 'overdue'),
(27, 26, '2023-01-06', '2023-01-20', 'overdue'),
(28, 27, '2023-01-07', '2023-01-21', 'overdue'),
(29, 28, '2023-01-08', '2023-01-22', 'overdue'),
(30, 29, '2023-01-09', '2023-01-23', 'overdue'),
(2, 30, '2023-01-10', '2023-01-24', 'overdue');