/**
 * Middleware para manipulação global de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors
    });
  }
  
  // Erros de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }
  
  // Erros de banco de dados
  if (err.code && (err.code.startsWith('ER_') || err.code.startsWith('SQLITE_'))) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'A database operation failed'
    });
  }
  
  // Erro padrão
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
};

module.exports = errorHandler;