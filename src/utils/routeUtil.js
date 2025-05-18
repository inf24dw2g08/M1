/**
 * Utilitários para rotas
 */

// Função para lidar com erros nas rotas
const handleRouteError = (err, res) => {
  console.error(err);
  return res.status(500).json({ 
    message: 'Ocorreu um erro interno no servidor', 
    error: err.message 
  });
};

// Função para validar IDs
const validateId = (id) => {
  return !isNaN(parseInt(id)) && parseInt(id) > 0; // Validação para MySQL ID (número positivo)
};

// Função para middleware de validação de requisição
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        error: error.details[0].message 
      });
    }
    next();
  };
};

// Função para lidar com controladores de forma segura
const safeHandler = (controllerFn, errorMessage) => {
  return async (req, res) => {
    try {
      await controllerFn(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: errorMessage || 'Ocorreu um erro interno no servidor',
        error: error.message 
      });
    }
  };
};

module.exports = {
  handleRouteError,
  validateId,
  validateRequest,
  safeHandler
};
