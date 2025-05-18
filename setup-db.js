console.log("Adicionando colunas necessárias à tabela de usuários...");
const mysql = require("mysql2/promise");
async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: "library_mysql",
      user: "root",
      password: "rootpassword",
      database: "library_db"
    });
    console.log("Conectado ao banco de dados");
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT NULL");
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL");
    await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS external_auth VARCHAR(50) NULL");
    console.log("Colunas adicionadas com sucesso!");
    await connection.end();
    console.log("Conexão encerrada");
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error);
  }
}
setTimeout(() => {
  setupDatabase().then(() => {
    console.log("Configuração concluída.");
  });
}, 10000);
