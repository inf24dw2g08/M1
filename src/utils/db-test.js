const db = require('../config/db.config');

// Teste de conexão e estrutura do banco de dados
async function testDatabase() {
  console.log('=== TESTE DO BANCO DE DADOS ===');
  
  try {
    // 1. Testar conexão
    console.log('1. Testando conexão...');
    const connection = await db.getConnection();
    console.log('✓ Conexão bem-sucedida!');
    connection.release();
    
    // 2. Verificar tabela de usuários
    console.log('2. Verificando tabela de usuários...');
    const [tables] = await db.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.error('✗ Tabela de usuários não encontrada!');
      return false;
    }
    console.log('✓ Tabela de usuários encontrada!');
    
    // 3. Verificar colunas
    console.log('3. Verificando colunas da tabela de usuários...');
    const [columns] = await db.query("DESCRIBE users");
    
    console.log('Colunas encontradas:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // 4. Verificar usuários existentes
    console.log('4. Verificando usuários existentes...');
    const [users] = await db.query("SELECT id, username, email, role FROM users LIMIT 5");
    
    console.log(`Encontrados ${users.length} usuários:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
    });
    
    console.log('=== TESTE CONCLUÍDO COM SUCESSO ===');
    return true;
    
  } catch (error) {
    console.error('✗ Erro no teste do banco de dados:', error);
    console.log('=== TESTE FALHOU ===');
    return false;
  }
}

// Execute o teste se o script for chamado diretamente
if (require.main === module) {
  testDatabase()
    .then(success => {
      if (!success) {
        console.log('O teste do banco de dados falhou.');
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro ao executar teste:', err);
      process.exit(1);
    });
}

module.exports = { testDatabase };
