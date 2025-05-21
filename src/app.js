const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const errorHandler = require('./middleware/errorHandler');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./middleware/auth');

// Adicione esta função de formatação de data no arquivo app.js (ou qualquer outro arquivo que você preferir)
const formatDatePtBR = (date, includeTime = false) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  
  // Formatar dia/mês/ano
  const dia = dateObj.getDate().toString().padStart(2, '0');
  const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const ano = dateObj.getFullYear();
  
  let result = `${dia}/${mes}/${ano}`;
  
  // Adicionar horas e minutos se solicitado
  if (includeTime) {
    const hora = dateObj.getHours().toString().padStart(2, '0');
    const minuto = dateObj.getMinutes().toString().padStart(2, '0');
    result += ` ${hora}:${minuto}`;
  }
  
  return result;
};

// Exportar a função para uso global (opcional)
global.formatDatePtBR = formatDatePtBR;

// Use o swaggerDocs exportado do arquivo swagger.js e configure opções de UI customizadas
const { swaggerDocs } = require('./swagger');
const swaggerUi = require('swagger-ui-express');

// Configurações personalizadas para a UI do Swagger
const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .scheme-container,
    .swagger-ui .topbar,
    .swagger-ui section.models,
    .swagger-ui .information-container .info .title small,
    .swagger-ui .servers-title,
    .swagger-ui .servers,
    .swagger-ui .auth-wrapper,
    .swagger-ui .information-container .info .auth-btn-wrapper {
      display: none !important;
    }
    .swagger-ui .information-container {
      margin-bottom: 20px;
    }
  `,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    defaultModelsExpandDepth: -1, // Oculta a seção de modelos
    tagsSorter: 'alpha', // Ordena tags alfabeticamente
    operationsSorter: 'alpha', // Ordena operações alfabeticamente
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Configurar views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rota de Dashboard
app.get('/dashboard', (req, res) => {
  const token = req.cookies.jwt_token;
  let user = { username: 'Visitante', email: 'Sem email disponível' };
  
  if (token) {
    try {
      // Decodificar token JWT para obter informações do usuário
      const decoded = jwt.verify(token, jwtSecret);
      user = {
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
    }
  }
  
  res.render('dashboard', { user });
});

// Rota de Logout
app.get('/logout', (req, res) => {
  // Limpar o cookie jwt_token
  res.clearCookie('jwt_token');
  
  // Redirecionar para a página inicial
  res.redirect('/');
});

// Documentação Swagger com opções personalizadas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// Rotas da API
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;