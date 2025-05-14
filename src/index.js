const app = require('./app');
const db = require('./config/db.config');

const PORT = process.env.PORT || 3000;

// Inicializar banco de dados e servidor
async function initServer() {
  try {
    // Tentar conectar ao banco de dados
    let dbConnected = false;
    try {
      // Conectar ao banco de dados
      await db.query('SELECT 1');
      console.log('Conexão com o banco de dados estabelecida!');
      dbConnected = true;
      
      // Popular banco de dados se necessário
      if (dbConnected) {
        const seedDatabase = require('./config/seed.js');
        await seedDatabase();
      }
    } catch (dbError) {
      console.error('Aviso: Não foi possível conectar ao banco de dados:', dbError.message);
      console.log('A aplicação será iniciada sem funcionalidades de banco de dados');
    }
    
    // Iniciar servidor e manter o processo rodando
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      if (!dbConnected) {
        console.log('AVISO: Aplicação em modo limitado - Banco de dados não disponível');
      }
    });
    
    // Manter o processo rodando mesmo se houver erros
    setInterval(() => {
      console.log('Servidor em execução...');
    }, 3600000); // Log a cada hora para manter vivo
    
    // Tratar erros para prevenir finalização do processo
    server.on('error', (error) => {
      console.error('Erro no servidor:', error);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    // Não finalizar o processo mesmo com erro
    console.log('Tentando manter o servidor rodando apesar do erro...');
    setInterval(() => {}, 3600000); // Manter o processo vivo
  }
}

// Prevenir que erros não tratados derrubem a aplicação
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
  // Não finalizar o processo
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
  // Não finalizar o processo
});

// Iniciar o servidor
initServer().catch(error => {
  console.error('Erro ao iniciar servidor:', error);
  // Manter o processo vivo mesmo com erro de inicialização
  setInterval(() => {}, 3600000);
});