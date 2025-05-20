require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db.config');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');
const Book = require('./src/models/bookModel');

const PORT = process.env.PORT || 3000;

(async () => {
  let retries = 5;
  while (retries) {
    try {
      console.log(`Tentando conectar ao banco... (tentativas restantes: ${retries})`);
      await sequelize.authenticate();
      console.log('Banco conectado com sucesso!');
      
      // Sincroniza tabelas sem forçar recriação
      await sequelize.sync({ force: false, alter: false });
      console.log('Esquema verificado com sucesso');

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

      // NÃO criar livros de exemplo - usaremos os do SQL

      app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Documentação da API disponível em:`);
        console.log(`- http://localhost:${PORT}/api-docs`);
        console.log(`- http://localhost:${PORT}/api/docs`);
      });
      
      break; // Sai do loop se conectar com sucesso
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error('Erro na inicialização após várias tentativas:', err);
        process.exit(1);
      }
      console.log(`Falha na conexão. Aguardando 5 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Aguarda 5 segundos
    }
  }
})();