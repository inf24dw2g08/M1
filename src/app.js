const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const { swaggerUi, swaggerDocs } = require('./swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const oauthRoutes = require('./routes/oauthRoutes'); // Corrigido para oauthRoutes (sem ponto)

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false // Desabilitar para desenvolvimento
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
// Comentar ou remover esta linha para desabilitar a rota OAuth temporariamente
app.use('/api/oauth', oauthRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
}));

// Root route - servir index.html ou retornar JSON
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } catch (error) {
    res.json({
      message: 'Welcome to Library API',
      documentation: '/api-docs'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;