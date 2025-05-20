const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'API para gerenciamento de uma biblioteca',
      contact: {
        name: 'API Support',
        email: 'support@library-api.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        oauth2: {
          type: 'oauth2',
          flows: {
            password: {
              tokenUrl: '/api/oauth/token',
              refreshUrl: '/api/oauth/refresh',
              scopes: {}
            }
          }
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID do usuário'
            },
            username: {
              type: 'string',
              description: 'Nome de usuário'
            },
            email: {
              type: 'string',
              description: 'Email do usuário'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário (não retornada nas consultas)'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Papel do usuário no sistema'
            },
            google_id: {
              type: 'string',
              description: 'ID do Google (para autenticação OAuth)'
            },
            external_auth: {
              type: 'string',
              description: 'Provedor de autenticação externa'
            },
            refresh_token: {
              type: 'string',
              description: 'Token de atualização'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        },
        Book: {
          type: 'object',
          required: ['title', 'author'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID do livro'
            },
            title: {
              type: 'string',
              description: 'Título do livro'
            },
            author: {
              type: 'string',
              description: 'Autor do livro'
            },
            isbn: {
              type: 'string',
              description: 'ISBN do livro'
            },
            published_year: {
              type: 'integer',
              description: 'Ano de publicação'
            },
            quantity: {
              type: 'integer',
              description: 'Quantidade disponível'
            },
            available: {
              type: 'boolean',
              description: 'Disponibilidade do livro'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        },
        Loan: {
          type: 'object',
          required: ['book_id', 'due_date'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID do empréstimo'
            },
            user_id: {
              type: 'integer',
              description: 'ID do usuário'
            },
            book_id: {
              type: 'integer',
              description: 'ID do livro'
            },
            loan_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data do empréstimo'
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data de devolução prevista'
            },
            return_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data de devolução efetiva'
            },
            status: {
              type: 'string',
              enum: ['active', 'returned', 'overdue'],
              description: 'Status do empréstimo'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            }
          }
        }
      }
    },
    paths: {
      '/api/books': {
        get: {
          tags: ['Books'],
          summary: 'Listar todos os livros',
          description: 'Retorna uma lista de todos os livros',
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      '$ref': '#/components/schemas/Book'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Books'],
          summary: 'Adicionar novo livro',
          description: 'Adiciona um novo livro ao sistema (requer permissão de admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  '$ref': '#/components/schemas/Book'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Livro criado',
              content: {
                'application/json': {
                  schema: {
                    '$ref': '#/components/schemas/Book'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida'
            },
            '401': {
              description: 'Não autorizado'
            },
            '403': {
              description: 'Proibido'
            }
          }
        }
      },
      '/api/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Obter livro por ID',
          description: 'Retorna um livro específico pelo ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do livro',
              required: true,
              schema: {
                type: 'integer',
                format: 'int64'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    '$ref': '#/components/schemas/Book'
                  }
                }
              }
            },
            '404': {
              description: 'Livro não encontrado'
            }
          }
        },
        put: {
          tags: ['Books'],
          summary: 'Atualizar livro',
          description: 'Atualiza um livro específico pelo ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do livro',
              required: true,
              schema: {
                type: 'integer',
                format: 'int64'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  '$ref': '#/components/schemas/Book'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    '$ref': '#/components/schemas/Book'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida'
            },
            '401': {
              description: 'Não autorizado'
            },
            '403': {
              description: 'Proibido'
            },
            '404': {
              description: 'Livro não encontrado'
            }
          }
        },
        delete: {
          tags: ['Books'],
          summary: 'Remover livro',
          description: 'Remove um livro específico pelo ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do livro',
              required: true,
              schema: {
                type: 'integer',
                format: 'int64'
              }
            }
          ],
          responses: {
            '204': {
              description: 'Operação bem-sucedida'
            },
            '401': {
              description: 'Não autorizado'
            },
            '403': {
              description: 'Proibido'
            },
            '404': {
              description: 'Livro não encontrado'
            }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Listar todos os usuários',
          description: 'Retorna uma lista de todos os usuários (requer permissão de admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      '$ref': '#/components/schemas/User'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado'
            },
            '403': {
              description: 'Proibido'
            }
          }
        },
        post: {
          tags: ['Users'],
          summary: 'Criar novo usuário',
          description: 'Cria um novo usuário no sistema (requer permissão de admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  '$ref': '#/components/schemas/User'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Usuário criado',
              content: {
                'application/json': {
                  schema: {
                    '$ref': '#/components/schemas/User'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida'
            },
            '401': {
              description: 'Não autorizado'
            },
            '403': {
              description: 'Proibido'
            }
          }
        }
      },
      '/api/loans': {
        get: {
          tags: ['Loans'],
          summary: 'Listar empréstimos',
          description: 'Retorna uma lista de empréstimos (usuários normais veem apenas seus próprios empréstimos)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      '$ref': '#/components/schemas/Loan'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado'
            }
          }
        },
        post: {
          tags: ['Loans'],
          summary: 'Criar novo empréstimo',
          description: 'Cria um novo empréstimo de livro',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  '$ref': '#/components/schemas/Loan'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Empréstimo criado',
              content: {
                'application/json': {
                  schema: {
                    '$ref': '#/components/schemas/Loan'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida'
            },
            '401': {
              description: 'Não autorizado'
            },
            '404': {
              description: 'Livro não encontrado'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs
};