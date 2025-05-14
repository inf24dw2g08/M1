const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Biblioteca API',
      version: '1.0.0',
      description: 'API REST para gestão de biblioteca',
      contact: {
        name: 'API Support',
        email: 'support@biblioteca-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Books',
        description: 'Book management endpoints'
      },
      {
        name: 'Loans',
        description: 'Loan management endpoints'
      },
      {
        name: 'OAuth',
        description: 'Authentication endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        basic: {
          type: 'http',
          scheme: 'basic'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { 
              type: 'string', 
              enum: ['user', 'admin'],
              description: 'User role defining permissions'
            },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            publication_year: { type: 'integer' },
            genre: { type: 'string' },
            description: { type: 'string' },
            available: { 
              type: 'boolean',
              description: 'Indicates if the book is available for loan' 
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Loan: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            book_id: { type: 'integer' },
            loan_date: { type: 'string', format: 'date-time' },
            due_date: { type: 'string', format: 'date' },
            return_date: { type: 'string', format: 'date-time', nullable: true },
            status: { 
              type: 'string', 
              enum: ['active', 'returned', 'overdue'],
              description: 'Current status of the loan'
            },
            book_title: { type: 'string' },
            user_name: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };