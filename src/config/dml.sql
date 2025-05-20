-- Script DML: Povoar a base de dados com dados

-- Inserir usuários (senha: Password123 - hash: $2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@library.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'admin'),
('john_doe', 'john@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('jane_smith', 'jane@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('mike_johnson', 'mike@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('sara_williams', 'sara@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('david_brown', 'david@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('lisa_green', 'lisa@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('robert_taylor', 'robert@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('emma_wilson', 'emma@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('james_martin', 'james@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('olivia_clark', 'olivia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('william_harris', 'william@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('sophia_allen', 'sophia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('benjamin_young', 'benjamin@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('mia_lee', 'mia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('librarian', 'librarian@library.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'admin'),
('alice_cooper', 'alice@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('bob_miller', 'bob@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('charlie_davis', 'charlie@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('diana_evans', 'diana@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('eric_foster', 'eric@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('fiona_grant', 'fiona@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('george_hill', 'george@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('hannah_irwin', 'hannah@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('ian_jackson', 'ian@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('julia_king', 'julia@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('kevin_lewis', 'kevin@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('laura_moore', 'laura@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('mark_nelson', 'mark@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user'),
('nina_owen', 'nina@example.com', '$2b$10$IVdvKOpVmuvF5Jz9zhBOH.dnP7QxCgrxx.MwzNCBXNZ.MJJDsYEWG', 'user');

-- Inserir livros
INSERT INTO books (title, author, isbn, published_year, genre, description, quantity, available) VALUES
('Dom Quixote', 'Miguel de Cervantes', '9788535910933', 1605, 'Clássico', 'Um fidalgo que enlouquece após ler muitos romances de cavalaria.', 3, TRUE),
('1984', 'George Orwell', '9788535914849', 1949, 'Distopia', 'Sociedade totalitária controlada pelo Grande Irmão.', 5, TRUE),
('Cem Anos de Solidão', 'Gabriel García Márquez', '9788501025616', 1967, 'Realismo Mágico', 'História da família Buendía em Macondo.', 2, TRUE),
('Crime e Castigo', 'Fiódor Dostoiévski', '9788573261073', 1866, 'Romance Psicológico', 'A história de Raskólnikov e seu crime.', 4, TRUE),
('O Senhor dos Anéis', 'J.R.R. Tolkien', '9788533613379', 1954, 'Fantasia', 'A jornada de Frodo para destruir o Um Anel.', 3, TRUE),
('A Metamorfose', 'Franz Kafka', '9788573261301', 1915, 'Ficção', 'Gregor Samsa se transforma em um inseto gigante.', 2, TRUE),
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', '9788525410696', 1943, 'Infantil', 'Um principezinho que viaja pelos planetas.', 6, TRUE),
('Anna Karenina', 'Liev Tolstói', '9788535912475', 1877, 'Romance', 'Tragédia da alta sociedade russa.', 1, TRUE),
('A Revolução dos Bichos', 'George Orwell', '9788535909555', 1945, 'Fábula Política', 'Animais expulsam humanos da fazenda.', 4, TRUE),
('O Processo', 'Franz Kafka', '9788535911861', 1925, 'Ficção', 'Josef K. é preso e julgado sem saber o motivo.', 2, TRUE),
('Ulisses', 'James Joyce', '9788535911213', 1922, 'Romance Moderno', 'Um dia na vida de Leopold Bloom em Dublin.', 2, TRUE),
('Os Miseráveis', 'Victor Hugo', '9788573261318', 1862, 'Romance Histórico', 'Jean Valjean e a França pós-revolucionária.', 3, TRUE),
('Orgulho e Preconceito', 'Jane Austen', '9788544001820', 1813, 'Romance', 'Elizabeth Bennet e Mr. Darcy superam diferenças.', 5, TRUE),
('O Grande Gatsby', 'F. Scott Fitzgerald', '9788501056160', 1925, 'Romance', 'Retrato da Era do Jazz americana.', 3, TRUE),
('A Divina Comédia', 'Dante Alighieri', '9788531406713', 1320, 'Poema Épico', 'Jornada pelo Inferno, Purgatório e Paraíso.', 2, TRUE),
('Moby Dick', 'Herman Melville', '9788525410995', 1851, 'Aventura', 'A obsessão do Capitão Ahab pela baleia branca.', 2, TRUE),
('Guerra e Paz', 'Liev Tolstói', '9788535908176', 1869, 'Romance Histórico', 'Rússia durante as guerras napoleônicas.', 1, TRUE),
('O Retrato de Dorian Gray', 'Oscar Wilde', '9788573261202', 1890, 'Gótico', 'Um retrato que envelhece enquanto Dorian não.', 4, TRUE),
('As Viagens de Gulliver', 'Jonathan Swift', '9788573261333', 1726, 'Sátira', 'Viagens fantásticas de Lemuel Gulliver.', 3, TRUE),
('A Insustentável Leveza do Ser', 'Milan Kundera', '9788535904196', 1984, 'Filosofia', 'Amor e exilio na Primavera de Praga.', 2, TRUE),
('O Hobbit', 'J.R.R. Tolkien', '9788573211375', 1937, 'Fantasia', 'A aventura de Bilbo Bolseiro.', 5, TRUE),
('Hamlet', 'William Shakespeare', '9788575030554', 1603, 'Tragédia', 'O príncipe da Dinamarca e sua vingança.', 3, TRUE),
('O Alquimista', 'Paulo Coelho', '9788576655107', 1988, 'Ficção', 'Santiago busca seu tesouro pessoal.', 6, TRUE),
('Memórias Póstumas de Brás Cubas', 'Machado de Assis', '9788503009492', 1881, 'Romance', 'Um defunto autor narra sua própria história.', 4, TRUE),
('Drácula', 'Bram Stoker', '9788576655108', 1897, 'Terror', 'O conde vampiro da Transilvania.', 3, TRUE),
('O Apanhador no Campo de Centeio', 'J.D. Salinger', '9788535918021', 1951, 'Romance', 'Holden Caulfield e sua visão sobre o mundo adulto.', 4, TRUE),
('A Montanha Mágica', 'Thomas Mann', '9788535908206', 1924, 'Romance', 'Um sanatório nos Alpes suíços.', 2, TRUE),
('Eneida', 'Virgílio', '9788573261585', -19, 'Poema Épico', 'A jornada de Eneias após a Guerra de Troia.', 1, TRUE),
('Os Lusíadas', 'Luís de Camões', '9788572328685', 1572, 'Poema Épico', 'A viagem de Vasco da Gama às Índias.', 3, TRUE),
('O Estrangeiro', 'Albert Camus', '9788501005489', 1942, 'Absurdismo', 'Meursault e o absurdo da existência.', 4, TRUE);

-- Inserir empréstimos ativos
INSERT INTO loans (user_id, book_id, loan_date, due_date, status) VALUES
(2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 'active'),
(3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 8 DAY), 'active'),
(4, 3, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 9 DAY), 'active'),
(5, 4, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), 'active'),
(6, 5, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 11 DAY), 'active'),
(2, 6, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 'active'),
(2, 7, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 13 DAY), 'active'),
(3, 8, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'active'),
(4, 9, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), 'active'),
(5, 10, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 'active');

-- Inserir empréstimos devolvidos
INSERT INTO loans (user_id, book_id, loan_date, due_date, return_date, status) VALUES
(6, 11, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 16 DAY), 'returned'),
(7, 12, DATE_SUB(CURRENT_DATE, INTERVAL 29 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), 'returned'),
(8, 13, DATE_SUB(CURRENT_DATE, INTERVAL 28 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 13 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), 'returned'),
(9, 14, DATE_SUB(CURRENT_DATE, INTERVAL 27 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 13 DAY), 'returned'),
(10, 15, DATE_SUB(CURRENT_DATE, INTERVAL 26 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), 'returned'),
(2, 16, DATE_SUB(CURRENT_DATE, INTERVAL 25 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), 'returned'),
(3, 17, DATE_SUB(CURRENT_DATE, INTERVAL 24 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), 'returned'),
(4, 18, DATE_SUB(CURRENT_DATE, INTERVAL 23 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), 'returned'),
(5, 19, DATE_SUB(CURRENT_DATE, INTERVAL 22 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), 'returned'),
(6, 20, DATE_SUB(CURRENT_DATE, INTERVAL 21 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), 'returned');

-- Inserir empréstimos em atraso
INSERT INTO loans (user_id, book_id, loan_date, due_date, status) VALUES
(11, 21, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), 'overdue'),
(12, 22, DATE_SUB(CURRENT_DATE, INTERVAL 32 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 17 DAY), 'overdue'),
(13, 23, DATE_SUB(CURRENT_DATE, INTERVAL 34 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 19 DAY), 'overdue'),
(14, 24, DATE_SUB(CURRENT_DATE, INTERVAL 36 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 21 DAY), 'overdue'),
(15, 25, DATE_SUB(CURRENT_DATE, INTERVAL 38 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 23 DAY), 'overdue'),
(16, 26, DATE_SUB(CURRENT_DATE, INTERVAL 40 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 25 DAY), 'overdue'),
(17, 27, DATE_SUB(CURRENT_DATE, INTERVAL 42 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 27 DAY), 'overdue'),
(18, 28, DATE_SUB(CURRENT_DATE, INTERVAL 44 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 29 DAY), 'overdue'),
(19, 29, DATE_SUB(CURRENT_DATE, INTERVAL 46 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 31 DAY), 'overdue'),
(20, 30, DATE_SUB(CURRENT_DATE, INTERVAL 48 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 33 DAY), 'overdue');