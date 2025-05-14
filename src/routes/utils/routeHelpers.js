/**
 * Fornece um handler seguro para rotas, verificando se o handler original existe
 * ou retornando um handler temporário que envia uma resposta 501
 * @param {Function|undefined} originalHandler - O handler original que pode ser undefined 
 * @param {string} message - Mensagem para o handler temporário
 * @returns {Function} Um handler válido para uso em rotas
 */
exports.safeHandler = (originalHandler, message = 'Endpoint não implementado') => {
  if (typeof originalHandler === 'function') {
    return originalHandler;
  }
  
  return (req, res) => {
    res.status(501).json({ message });
  };
};
