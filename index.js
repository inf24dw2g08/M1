require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/db.config');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log('Conectando ao banco...');
    await sequelize.authenticate();
    console.log('Banco conectado. Forçando sync...');

    // força DROP+CREATE de todas as tabelas
    await sequelize.sync({ force: true });
    console.log('Esquema recriado com force: true');

    // seed admin
    const [admin] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });
    console.log('Admin seed OK (senha = admin123)');

    app.listen(PORT, () =>
      console.log(`Servidor rodando em http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Erro na inicialização:', err);
    process.exit(1);
  }
})();
