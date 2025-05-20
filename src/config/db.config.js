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
    logging: console.log,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
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