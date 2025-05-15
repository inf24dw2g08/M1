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
        oauth2: {
          type: 'oauth2',
          flows: {
            password: {
              tokenUrl: '/api/oauth/token',
              refreshUrl: '/api/oauth/refresh',
              scopes: {}
            }
          }
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
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
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Papel do usuário no sistema'
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
            genre: {
              type: 'string',
              description: 'Gênero do livro'
            },
            description: {
              type: 'string',
              description: 'Descrição do livro'
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
          required: ['user_id', 'book_id'],
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
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Obter perfil do usuário atual',
          description: 'Retorna informações do perfil do usuário autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Atualizar perfil do usuário atual',
          description: 'Atualiza as informações do perfil do usuário autenticado',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
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
                      description: 'Nova senha (opcional)'
                    }
                  }
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
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
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
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
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
                  type: 'object',
                  required: ['username', 'email', 'password'],
                  properties: {
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
                      description: 'Senha do usuário'
                    },
                    role: {
                      type: 'string',
                      enum: ['user', 'admin'],
                      description: 'Papel do usuário (padrão: user)'
                    }
                  }
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
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Obter usuário por ID',
          description: 'Retorna um usuário específico pelo ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do usuário',
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
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Usuário não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Atualizar usuário',
          description: 'Atualiza um usuário específico pelo ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do usuário',
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
                  type: 'object',
                  properties: {
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
                      description: 'Nova senha (opcional)'
                    },
                    role: {
                      type: 'string',
                      enum: ['user', 'admin'],
                      description: 'Papel do usuário'
                    }
                  }
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
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Usuário não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Users'],
          summary: 'Remover usuário',
          description: 'Remove um usuário específico pelo ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do usuário',
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
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Usuário excluído com sucesso'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Usuário não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
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
                      $ref: '#/components/schemas/Book'
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
                  $ref: '#/components/schemas/Book'
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
                    $ref: '#/components/schemas/Book'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
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
                    $ref: '#/components/schemas/Book'
                  }
                }
              }
            },
            '404': {
              description: 'Livro não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
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
                  $ref: '#/components/schemas/Book'
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
                    $ref: '#/components/schemas/Book'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Livro não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
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
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Livro excluído com sucesso'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Livro não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/loans': {
        get: {
          tags: ['Loans'],
          summary: 'Listar empréstimos',
          description: 'Retorna uma lista de empréstimos (usuários normais veem apenas seus empréstimos, admins veem todos)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Operação bem-sucedida',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Loan'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
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
                  type: 'object',
                  required: ['book_id'],
                  properties: {
                    book_id: {
                      type: 'integer',
                      description: 'ID do livro a ser emprestado'
                    },
                    due_date: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Data prevista para devolução'
                    }
                  }
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
                    $ref: '#/components/schemas/Loan'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Livro não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'Livro não disponível para empréstimo',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/loans/{id}': {
        get: {
          tags: ['Loans'],
          summary: 'Obter empréstimo por ID',
          description: 'Retorna um empréstimo específico pelo ID (usuários normais podem ver apenas seus próprios empréstimos)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do empréstimo',
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
                    $ref: '#/components/schemas/Loan'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Empréstimo não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Loans'],
          summary: 'Atualizar empréstimo',
          description: 'Atualiza um empréstimo específico pelo ID (usuários normais só podem atualizar seus próprios empréstimos)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do empréstimo',
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
                  type: 'object',
                  properties: {
                    return_date: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Data efetiva de devolução'
                    },
                    status: {
                      type: 'string',
                      enum: ['active', 'returned', 'overdue'],
                      description: 'Status do empréstimo'
                    }
                  }
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
                    $ref: '#/components/schemas/Loan'
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Empréstimo não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Loans'],
          summary: 'Remover empréstimo',
          description: 'Remove um empréstimo específico pelo ID (apenas admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'ID do empréstimo',
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
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Empréstimo excluído com sucesso'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Não autorizado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Proibido',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Empréstimo não encontrado',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/oauth/token': {
        post: {
          tags: ['Authentication'],
          summary: 'Obter token de acesso',
          description: 'Obtém um token de acesso usando credenciais (OAuth 2.0 Password Grant)',
          requestBody: {
            required: true,
            content: {
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  required: ['grant_type', 'username', 'password', 'client_id', 'client_secret'],
                  properties: {
                    grant_type: {
                      type: 'string',
                      enum: ['password'],
                      description: 'Tipo de concessão (deve ser "password")'
                    },
                    username: {
                      type: 'string',
                      description: 'Nome de usuário ou email'
                    },
                    password: {
                      type: 'string',
                      description: 'Senha do usuário'
                    },
                    client_id: {
                      type: 'string',
                      description: 'ID do cliente OAuth'
                    },
                    client_secret: {
                      type: 'string',
                      description: 'Segredo do cliente OAuth'
                    },
                    scope: {
                      type: 'string',
                      description: 'Escopos solicitados (opcional)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Token gerado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      access_token: {
                        type: 'string',
                        description: 'Token de acesso JWT'
                      },
                      token_type: {
                        type: 'string',
                        example: 'Bearer'
                      },
                      expires_in: {
                        type: 'integer',
                        description: 'Tempo de expiração em segundos'
                      },
                      refresh_token: {
                        type: 'string',
                        description: 'Token de atualização'
                      },
                      scope: {
                        type: 'string',
                        description: 'Escopos concedidos'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        example: 'invalid_request'
                      },
                      error_description: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Credenciais inválidas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        example: 'invalid_grant'
                      },
                      error_description: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/oauth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Atualizar token de acesso',
          description: 'Obtém um novo token de acesso usando um refresh token',
          requestBody: {
            required: true,
            content: {
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  required: ['grant_type', 'refresh_token', 'client_id', 'client_secret'],
                  properties: {
                    grant_type: {
                      type: 'string',
                      enum: ['refresh_token'],
                      description: 'Tipo de concessão (deve ser "refresh_token")'
                    },
                    refresh_token: {
                      type: 'string',
                      description: 'Token de atualização'
                    },
                    client_id: {
                      type: 'string',
                      description: 'ID do cliente OAuth'
                    },
                    client_secret: {
                      type: 'string',
                      description: 'Segredo do cliente OAuth'
                    },
                    scope: {
                      type: 'string',
                      description: 'Escopos solicitados (opcional)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Token renovado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      access_token: {
                        type: 'string',
                        description: 'Novo token de acesso JWT'
                      },
                      token_type: {
                        type: 'string',
                        example: 'Bearer'
                      },
                      expires_in: {
                        type: 'integer',
                        description: 'Tempo de expiração em segundos'
                      },
                      refresh_token: {
                        type: 'string',
                        description: 'Novo token de atualização'
                      },
                      scope: {
                        type: 'string',
                        description: 'Escopos concedidos'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Requisição inválida',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        example: 'invalid_request'
                      },
                      error_description: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Token de atualização inválido',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        example: 'invalid_grant'
                      },
                      error_description: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/oauth/google': {
        get: {
          tags: ['Authentication'],
          summary: 'Iniciar autenticação Google',
          description: 'Inicia o fluxo de autenticação com o Google',
          responses: {
            '302': {
              description: 'Redirecionado para o Google para autenticação'
            }
          }
        }
      },
      '/api/oauth/google/callback': {
        get: {
          tags: ['Authentication'],
          summary: 'Callback para autenticação Google',
          description: 'URL de callback para o Google redirecionar após autenticação',
          parameters: [
            {
              name: 'code',
              in: 'query',
              description: 'Código de autorização retornado pelo Google',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '302': {
              description: 'Redirecionado para a aplicação com token'
            },
            '500': {
              description: 'Erro interno do servidor',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // caminho dos arquivos com anotações JSDoc
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs
};