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
    console.log('Banco conectado.');
    
    try {
      // Tenta auto-alterar esquema
      await sequelize.sync({ alter: true });
    } catch (err) {
      // ER_FK_COLUMN_NOT_NULL = errno 1830
      if (err.parent?.errno === 1830) {
        console.warn('Ignorado ER_FK_COLUMN_NOT_NULL durante sync');
      } else {
        throw err;
      }
    }
    console.log('Modelos sincronizados.');

    // Seed admin e força senha
    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });
    if (!created) {
      await admin.update({ password: await bcrypt.hash('admin123', 10) });
      console.log('Senha do admin ajustada para admin123');
    } else {
      console.log('Usuário admin criado');
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erro na inicialização:', err);
    process.exit(1);
  }
})();
