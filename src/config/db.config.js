const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Configurando Sequelize para conectar em:', {
  host: process.env.DB_HOST || 'library_mysql',
  database: process.env.DB_NAME || 'library_db',
  user: process.env.DB_USER || 'root'
});

const sequelize = new Sequelize(
  process.env.DB_NAME || 'library_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'rootpassword',
  {
    host: process.env.DB_HOST || 'library_mysql',
    dialect: 'mysql',
    logging: console.log, // Ativar logs SQL durante debug
    define: {
      underscored: true,
      timestamps: false // Desativar timestamps para compatibilidade
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
