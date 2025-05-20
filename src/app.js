const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./middleware/auth');

// Use o swaggerDocs exportado do arquivo swagger.js
const { swaggerDocs } = require('./swagger');

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

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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