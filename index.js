require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db.config');
const Book = require('./src/models/bookModel');

const PORT = process.env.PORT || 3000;

(async function startServer() {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso!');
    
    // Sincronizar modelos
    await sequelize.sync();
    console.log('Modelos sincronizados com banco de dados');
    
    // Verificar se existem livros
    const count = await Book.count();
    if (count === 0) {
      console.log('Inserindo livros de exemplo...');
      await Book.bulkCreate([
        { title: 'Dom Quixote', author: 'Miguel de Cervantes', published_year: 1605 },
        { title: 'Os Lusíadas', author: 'Luís de Camões', published_year: 1572 },
        { title: 'O Príncipe', author: 'Maquiavel', published_year: 1532 }
      ]);
      console.log('Livros inseridos com sucesso!');
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro na inicialização:', error);
    process.exit(1);
  }
})();
