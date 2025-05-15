const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerDocs } = require('./swagger');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const errorHandler = require('./middleware/errorHandler');
const { passport } = require('./middleware/auth');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar Passport
app.use(passport.initialize());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/oauth', oauthRoutes);

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;