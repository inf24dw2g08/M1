const jwt = require('jsonwebtoken');
require('dotenv').config();

// Certificar-se de que as variáveis de ambiente estão definidas
const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
const jwtExpiration = process.env.JWT_EXPIRATION || '1h';
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

// Adicionar um log para depuração
console.log('Configurações JWT carregadas:');
console.log('JWT_SECRET está definido:', !!process.env.JWT_SECRET);
console.log('JWT_EXPIRATION:', process.env.JWT_EXPIRATION);
console.log('REFRESH_TOKEN_EXPIRATION:', process.env.REFRESH_TOKEN_EXPIRATION);

// Função para verificar token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });
  
  try {
    const user = jwt.verify(token, jwtSecret);
    req.user = user;
    
    // Apresentar na consola o detalhe do utilizador autenticado
    console.log('\x1b[36m%s\x1b[0m', '------------------------------------------------');
    console.log('👤 Utilizador Autenticado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name || 'N/A'}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Função: ${user.role || 'N/A'}`);
    console.log(`   Data/Hora: ${new Date().toISOString()}`);
    console.log(`   Rota: ${req.method} ${req.originalUrl}`);
    console.log('\x1b[36m%s\x1b[0m', '------------------------------------------------');
    
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Função para autorização baseada em papéis
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Não autorizado' });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Permissão negada' });
  };
};

// Função para garantir que o usuário só acesse seus próprios recursos
const isResourceOwner = (resourceType, allowAdmin = true) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Não autorizado" });
      }
      
      // Se o usuário for admin e allowAdmin for true, permitir acesso
      if (allowAdmin && req.user.role === 'admin') {
        return next();
      }
      
      const resourceId = req.params.id;
      const userId = req.user.id;
      
      // Verificação específica por tipo de recurso
      switch(resourceType) {
        case 'loan':
          try {
            // Verificar se o empréstimo pertence ao usuário
            const [rows] = await require('../config/db.config').query(
              'SELECT * FROM loans WHERE id = ? AND user_id = ?',
              [resourceId, userId]
            );
            
            if (rows.length === 0) {
              console.log(`Acesso negado: Usuário ${userId} tentou acessar o empréstimo ${resourceId} que não lhe pertence`);
              return res.status(403).json({ 
                message: "Acesso negado: você só pode acessar seus próprios empréstimos" 
              });
            }
          } catch (dbError) {
            console.error('Erro ao verificar propriedade do empréstimo:', dbError);
            // Falhar de forma segura permitindo acesso se não conseguir verificar
            // Em produção, você pode querer negar acesso em caso de erro
          }
          break;
          
        case 'user':
          // Verificar se o ID do usuário no token corresponde ao recurso solicitado
          if (parseInt(resourceId) !== parseInt(userId)) {
            console.log(`Acesso negado: Usuário ${userId} tentou acessar o perfil ${resourceId}`);
            return res.status(403).json({ 
              message: "Acesso negado: você só pode acessar seu próprio perfil" 
            });
          }
          break;
          
        // Adicione outros tipos de recursos conforme necessário
      }
      
      next();
    } catch (error) {
      console.error('Erro ao verificar propriedade do recurso:', error);
      res.status(500).json({ message: "Erro ao verificar propriedade do recurso" });
    }
  };
};

// Exportar funções e configurações
module.exports = {
  authenticateToken,
  authorizeRole,
  isResourceOwner,
  jwtSecret,
  jwtExpiration,
  refreshTokenExpiration
};