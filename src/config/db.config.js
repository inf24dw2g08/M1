const mysql = require('mysql2/promise');
require('dotenv').config();

// Logar as configurações do banco de dados (sem senhas!)
console.log('Tentando conectar ao banco de dados:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log('Senha: ****** (oculta)');

// Configuração do pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para obter uma conexão do pool
async function getConnection() {
  return await pool.getConnection();
}

// Função para executar queries diretamente
async function query(sql, params) {
  return await pool.query(sql, params);
}

module.exports = {
  pool,
  getConnection,
  query
};
