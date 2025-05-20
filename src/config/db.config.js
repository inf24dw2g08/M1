const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Configurando conexão ao banco de dados com:');
console.log({
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
    logging: false, // Desativar logging
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    sync: {
      force: false,  // NÃO force a recriação das tabelas
      alter: false   // NÃO altere as tabelas existentes
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