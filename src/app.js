const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Configurar views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Swagger UI
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('../docs/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Documentação Swagger disponível em /api-docs');
} catch (err) {
  console.warn('Swagger não disponível:', err.message);
  // Fallback para documentação simples
  app.get('/api-docs', (req, res) => {
    res.send(`
      <h1>API de Biblioteca</h1>
      <p>Consulte a documentação completa na collection do Postman em /postman/biblioteca_api.json</p>
    `);
  });
}

// Rota raiz para redirecionar para a interface de livros
app.get('/', (req, res) => {
  res.redirect('/books');
});

// Rotas da API (depois da rota raiz para evitar conflitos)
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/oauth', oauthRoutes);

// Rota UI para books
app.use('/books', bookRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;