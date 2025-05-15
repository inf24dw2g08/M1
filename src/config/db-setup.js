const db = require('./db.config');

// Função para verificar e criar coluna se necessário
const ensureColumn = async (table, column, definition) => {
  try {
    console.log(`Verificando se a coluna ${column} existe na tabela ${table}...`);
    
    const [columns] = await db.query(
      `SHOW COLUMNS FROM ${table} LIKE ?`,
      [column]
    );
    
    if (columns.length === 0) {
      console.log(`A coluna ${column} não existe na tabela ${table}, criando...`);
      await db.query(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
      );
      console.log(`Coluna ${column} criada com sucesso!`);
      return true;
    } else {
      console.log(`A coluna ${column} já existe na tabela ${table}.`);
      return false;
    }
  } catch (error) {
    console.error(`Erro ao verificar/criar coluna ${column} na tabela ${table}:`, error);
    throw error;
  }
};

// Função principal para configurar o banco de dados
const setupDatabase = async () => {
  try {
    console.log('Iniciando configuração do banco de dados...');
    
    // Verificar e criar colunas necessárias
    await ensureColumn('users', 'google_id', 'VARCHAR(255) NULL');
    await ensureColumn('users', 'external_auth', 'VARCHAR(50) NULL');
    
    console.log('Configuração do banco de dados concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
    return false;
  }
};

module.exports = {
  setupDatabase,
  ensureColumn
};
