const app = require('./src/app');
const db = require('./src/config/db.config');

const PORT = process.env.PORT || 3000;

// Impedir que o processo Node.js saia
process.stdin.resume();
console.log('Processo mantido ativo com process.stdin.resume()');

// Adicionar um timer para manter o processo rodando
setInterval(() => {
  console.log('Verificação de atividade do processo');
}, 60000); // Verificar a cada minuto

// Função para tentar conectar ao banco de dados com repetições
async function connectToDatabase(maxAttempts = 30, delay = 10000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de ${maxAttempts} para conectar ao banco de dados...`);
      await db.query('SELECT 1');
      console.log('Conexão com o banco de dados estabelecida!');
      return true;
    } catch (error) {
      console.error(`Tentativa ${attempt} falhou:`, error.message);
      if (attempt < maxAttempts) {
        console.log(`Aguardando ${delay/1000} segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Todas as tentativas de conexão falharam');
  return false;
}

// Inicializar banco de dados e servidor
async function initServer() {
  try {
    // Tentar conectar ao banco de dados com várias tentativas
    const dbConnected = await connectToDatabase();
    
    // Popular banco de dados se necessário
    if (dbConnected) {
      try {
        const seedDatabase = require('./src/config/seed.js');
        await seedDatabase();
      } catch (seedError) {
        console.error('Erro ao popular banco de dados:', seedError.message);
      }
    } else {
      console.log('A aplicação será iniciada sem funcionalidades de banco de dados');
    }
    
    // Iniciar servidor e monitorar eventos
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      if (!dbConnected) {
        console.log('AVISO: Aplicação em modo limitado - Banco de dados não disponível');
      }
    });
    
    // Monitorar eventos do servidor
    server.on('error', (error) => {
      console.error('Erro no servidor:', error);
    });
    
    server.on('close', () => {
      console.log('Servidor foi fechado');
    });
    
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    // Não finalizar o processo mesmo com erro
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
});