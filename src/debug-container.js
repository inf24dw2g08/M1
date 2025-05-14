/**
 * Script para encontrar e resolver problemas
 * Para executar: cp debug-container.js src/debug-container.js && docker-compose exec library_api node src/debug-container.js
 */
const fs = require('fs');
const path = require('path');

// Configurações diretas para JWT
process.env.JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
process.env.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
process.env.REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

// Função para testar cada arquivo individualmente
async function testFile(filePath) {
  try {
    console.log(`Testando arquivo: ${filePath}`);
    const result = require(filePath);
    console.log(`✅ Sucesso ao importar ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao importar ${filePath}: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

// Função para corrigir arquivo de auth
function fixAuthFile() {
  try {
    const authFile = path.join(__dirname, 'middleware', 'auth.js');
    if (fs.existsSync(authFile)) {
      console.log(`Modificando ${authFile}`);
      let content = fs.readFileSync(authFile, 'utf8');
      
      // Adicionar configurações JWT diretamente
      content = `const jwt = require('jsonwebtoken');
// Configurações JWT extraídas diretamente de variáveis de ambiente para evitar dependência circular
const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
const jwtExpiration = process.env.JWT_EXPIRATION || '1h';
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

${content.includes('authenticateToken') ? '' : `
// Função para verificar token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });
  
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
};
`}

${content.includes('authorizeRole') ? '' : `
// Função para autorização baseada em papéis
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Não autorizado' });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Permissão negada' });
  };
};
`}

// Resto do arquivo original com modificações para evitar dependências circulares
${content.replace(/(?:const|let|var)[\s\n]*\{[\s\n]*(?:.*,[\s\n]*)?jwtSecret[\s\n]*(?:,[\s\n]*.*)?}[\s\n]*=[\s\n]*require\([^)]*\);/g, '// Importação JWT removida para evitar dependência circular')}
`;

      // Garantir que as funções são exportadas
      if (content.includes('module.exports')) {
        content = content.replace(/module\.exports[\s\n]*=[\s\n]*\{/, `module.exports = {
  authenticateToken,
  authorizeRole,
  jwtSecret,
  jwtExpiration,
  refreshTokenExpiration,`);
      } else {
        content += `
module.exports = {
  authenticateToken,
  authorizeRole,
  jwtSecret,
  jwtExpiration,
  refreshTokenExpiration
};`;
      }

      fs.writeFileSync(authFile, content, 'utf8');
      console.log('✅ Arquivo auth.js corrigido');
      return true;
    } else {
      console.error('❌ Arquivo auth.js não encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao modificar auth.js:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Função para corrigir um arquivo de rota
function fixRouteFile(routeFile) {
  try {
    if (fs.existsSync(routeFile)) {
      console.log(`Modificando ${routeFile}`);
      let content = fs.readFileSync(routeFile, 'utf8');
      
      // Corrigir importação de auth
      if (content.includes('authorizeRole(') && !content.includes('authorizeRole')) {
        content = content.replace(
          /const[\s\n]*\{[\s\n]*authenticateToken[\s\n]*\}[\s\n]*=[\s\n]*require\(['"]\.\.\/middleware\/auth['"]\);/g,
          `const { authenticateToken, authorizeRole } = require('../middleware/auth');`
        );
      }
      
      fs.writeFileSync(routeFile, content, 'utf8');
      console.log(`✅ Arquivo ${path.basename(routeFile)} corrigido`);
      return true;
    } else {
      console.error(`❌ Arquivo ${path.basename(routeFile)} não encontrado`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao modificar ${path.basename(routeFile)}:`, error.message);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  console.log('🔍 Iniciando diagnóstico e correção de problemas...');
  
  // Primeiro, corrigir auth.js
  fixAuthFile();
  
  // Corrigir bookRoutes.js
  const bookRoutesFile = path.join(__dirname, 'routes', 'bookRoutes.js');
  fixRouteFile(bookRoutesFile);
  
  // Tentar carregar cada arquivo importante
  await testFile('./middleware/auth');
  await testFile('./routes/bookRoutes');
  await testFile('./app');
  
  console.log('✅ Diagnóstico concluído. Execute "docker-compose down && docker-compose up" para reiniciar a aplicação.');
}

main().catch(err => {
  console.error('Erro no script de diagnóstico:', err);
});
