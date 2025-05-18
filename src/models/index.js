const sequelize = require('../config/db.config');
const User = require('./userModel');
const Book = require('./bookModel');
const Loan = require('./loanModel');

// Define todas as associações entre os modelos
User.hasMany(Loan, { foreignKey: 'user_id' });
Loan.belongsTo(User, { foreignKey: 'user_id' });

Book.hasMany(Loan, { foreignKey: 'book_id' });
Loan.belongsTo(Book, { foreignKey: 'book_id' });

// Sincronizar os modelos com o banco de dados
const syncModels = async () => {
  try {
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados');
    
    // Verificar se existem livros na tabela
    const bookCount = await Book.count();
    console.log(`Total de livros no banco: ${bookCount}`);
    
    // Se não houver livros, inserir alguns
    if (bookCount === 0) {
      console.log('Inserindo livros de exemplo...');
      await Book.bulkCreate([
        { title: 'Dom Quixote', author: 'Miguel de Cervantes', published_year: 1605 },
        { title: 'Os Lusíadas', author: 'Luís de Camões', published_year: 1572 },
        { title: 'O Príncipe', author: 'Maquiavel', published_year: 1532 }
      ]);
      console.log('Livros de exemplo inseridos com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Book,
  Loan,
  syncModels
};
