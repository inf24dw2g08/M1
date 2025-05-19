const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const errorHandler = require('./middleware/errorHandler');
const { jwtSecret } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// captura erros de JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }
  next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Configurar views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Swagger UI
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('../docs/swagger.json');
  
  // monta em /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Documentação Swagger disponível em /api-docs');
} catch (err) {
  console.warn('Swagger não disponível:', err.message);
}

// Rotas da API (registradas antes do handler de erros)
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/oauth', oauthRoutes);

// Rotas de UI
app.get('/dashboard', (req, res) => {
  const token = req.query.token || req.cookies?.jwt_token;
  if (!token) return res.redirect('/');
  try {
    const user = jwt.verify(token, jwtSecret);
    return res.render('dashboard', { user });
  } catch {
    return res.redirect('/?error=invalid_token');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt_token');
  res.redirect('/');
});

// Rota raiz opcional para redirecionar para a documentação da API
app.get('/', (req, res) => {
  res.redirect('/books');
});

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;