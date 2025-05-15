const app = require('./src/app');
const dbConfig = require('./src/config/db.config');
const dbSetup = require('./src/config/db-setup');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Tentar conectar ao banco de dados
    console.log('Tentando conectar ao banco de dados:');
    console.log('Host:', process.env.DB_HOST || 'library_mysql');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'library_db');
    console.log('Senha:', '****** (oculta)');

    // Verificar conexão com o banco de dados
    const connection = await dbConfig.getConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    connection.release();

    // Configurar banco de dados (criar colunas necessárias)
    await dbSetup.setupDatabase();

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
    });
    
    // Mantém o processo ativo
    process.stdin.resume();
    
    // Tratamento de encerramento
    const handleShutdown = () => {
      console.log('Encerrando servidor...');
      process.exit(0);
    };
    
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    // Tentar novamente após 5 segundos se for erro de conexão
    if (error.code === 'ECONNREFUSED') {
      console.log('Falha na conexão com o banco de dados. Tentando novamente em 5 segundos...');
      setTimeout(startServer, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Iniciar o servidor
startServer();console.log("Iniciando aplicação com GOOGLE_CALLBACK_URL=", process.env.GOOGLE_CALLBACK_URL);
console.log("Iniciando aplicação com GOOGLE_CALLBACK_URL=", process.env.GOOGLE_CALLBACK_URL);
console.log("Iniciando aplicação com GOOGLE_CALLBACK_URL=", process.env.GOOGLE_CALLBACK_URL);
console.log("Iniciando aplicação com GOOGLE_CALLBACK_URL=", process.env.GOOGLE_CALLBACK_URL);
