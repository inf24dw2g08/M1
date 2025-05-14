/**
 * Script para resolver problemas de dependência circular JWT
 * Execute com: node fix-jwt.js
 */
const fs = require('fs');
const path = require('path');

// Arquivos a serem modificados
const authFile = path.join(__dirname, 'src', 'middleware', 'auth.js');

try {
  // Verificar se o arquivo auth.js existe
  if (fs.existsSync(authFile)) {
    console.log('Modificando:', authFile);
    
    // Ler o conteúdo atual
    let authContent = fs.readFileSync(authFile, 'utf8');
    
    // Substituir importações circulares por acesso direto às variáveis de ambiente
    let modified = false;
    
    // Padrão para encontrar configurações JWT importadas de outro arquivo
    const importPattern = /(?:const|let|var)[\s\n]*\{[\s\n]*(?:.*,[\s\n]*)?jwtSecret[\s\n]*(?:,[\s\n]*.*)?}[\s\n]*=[\s\n]*require\(.*\);/g;
    
    if (importPattern.test(authContent)) {
      // Substituir a importação por configurações diretas
      authContent = authContent.replace(importPattern, 
        `// Configurações JWT extraídas diretamente de variáveis de ambiente para evitar dependência circular
const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
const jwtExpiration = process.env.JWT_EXPIRATION || '1h';
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';`);
      modified = true;
    }
    
    // Garantir que authorizeRole está definido e exportado
    if (!authContent.includes('authorizeRole')) {
      // Adicionar a função authorizeRole antes do módulo exports
      const exportIndex = authContent.lastIndexOf('module.exports');
      if (exportIndex !== -1) {
        const authorizeRoleFunction = `
// Função para autorização baseada em papéis
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Não autorizado" });
    }
    
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ message: "Permissão negada" });
  };
};

`;
        authContent = authContent.slice(0, exportIndex) + authorizeRoleFunction + authContent.slice(exportIndex);
        modified = true;
      }
    }
    
    // Garantir que authorizeRole está sendo exportado
    if (authContent.includes('module.exports') && !authContent.includes('authorizeRole:')) {
      // Adicionar authorizeRole aos exports
      authContent = authContent.replace(/module\.exports[\s\n]*=[\s\n]*\{/, 'module.exports = {\n  authorizeRole,');
      modified = true;
    }
    
    // Garantir que as configurações JWT estão sendo exportadas
    if (authContent.includes('module.exports') && 
        (!authContent.includes('jwtSecret:') || 
         !authContent.includes('jwtExpiration:') || 
         !authContent.includes('refreshTokenExpiration:'))) {
      // Adicionar configurações JWT aos exports
      authContent = authContent.replace(/module\.exports[\s\n]*=[\s\n]*\{/, 
        'module.exports = {\n  jwtSecret,\n  jwtExpiration,\n  refreshTokenExpiration,');
      modified = true;
    }
    
    if (modified) {
      // Salvar as modificações
      fs.writeFileSync(authFile, authContent, 'utf8');
      console.log('Arquivo auth.js modificado com sucesso.');
    } else {
      console.log('Nenhuma modificação necessária em auth.js.');
    }
  } else {
    console.log('Arquivo auth.js não encontrado:', authFile);
  }
  
  // Verificar e modificar qualquer arquivo de rota que usa authorizeRole
  const routesDir = path.join(__dirname, 'src', 'routes');
  if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
    
    for (const routeFile of routeFiles) {
      const filePath = path.join(routesDir, routeFile);
      console.log('Verificando arquivo de rota:', filePath);
      
      let routeContent = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Verificar se authorizeRole é usado mas não importado corretamente
      if (routeContent.includes('authorizeRole(') && 
          !routeContent.includes('authorizeRole') && 
          routeContent.includes('require(')) {
        // Corrigir importação para incluir authorizeRole
        routeContent = routeContent.replace(
          /const[\s\n]*\{[\s\n]*(?:authenticateToken|[^}]*)[\s\n]*\}[\s\n]*=[\s\n]*require\(['"]\.\.\/middleware\/auth['"]\);/,
          'const { authenticateToken, authorizeRole } = require(\'../middleware/auth\');'
        );
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, routeContent, 'utf8');
        console.log(`Arquivo ${routeFile} modificado com sucesso.`);
      }
    }
  }
  
  console.log('Modificações concluídas. Por favor, reinicie o contêiner Docker.');
  
} catch (error) {
  console.error('Erro ao modificar arquivos:', error);
}
