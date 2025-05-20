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
const swaggerDocument = require('../docs/swagger.json');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());                          // <— parse JSON
app.use(express.urlencoded({ extended: true }));   // <— parse form-data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Configurar views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// monta documentação Swagger em /api-docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API (registradas antes do handler de erros)
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);

// Rota raiz opcional para redirecionar para a documentação da API
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;