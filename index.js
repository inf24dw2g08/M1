require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db.config');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');
const Book = require('./src/models/bookModel');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log('Conectando ao banco...');
    await sequelize.authenticate();
    console.log('Banco conectado. Sincronizando tabelas...');

    // Sincroniza tabelas sem forçar recriação
    await sequelize.sync({ alter: true });
    console.log('Esquema sincronizado com sucesso');

    // Verifica e cria usuário admin se não existir
    const [admin] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });
    console.log('Admin verificado/criado com sucesso (senha = admin123)');

    // Verifica e cria livros de exemplo se não existirem
    const bookCount = await Book.count();
    if (bookCount === 0) {
      await Book.bulkCreate([
        { title: 'Dom Quixote', author: 'Miguel de Cervantes', published_year: 1605 },
        { title: 'Os Lusíadas', author: 'Luís de Camões', published_year: 1572 },
        { title: 'O Príncipe', author: 'Maquiavel', published_year: 1532 }
      ]);
      console.log('Livros de exemplo criados com sucesso');
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Documentação da API disponível em:`);
      console.log(`- http://localhost:${PORT}/api-docs`);
      console.log(`- http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Erro na inicialização:', err);
    process.exit(1);
  }
})();