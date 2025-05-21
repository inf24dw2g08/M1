# Relatório do Projeto - Biblioteca API

## 1. Introdução

Este relatório apresenta uma análise detalhada do projeto desenvolvido para a disciplina de Desenvolvimento Web. O projeto consiste numa API REST com autenticação OAuth2 para gestão de uma biblioteca, implementada com Node.js e MySQL, seguindo uma arquitetura de microserviços em contentores Docker.

## 2. Objetivos do Projeto

De acordo com o enunciado do trabalho, os objetivos principais eram:

- Desenvolver uma camada de serviços REST protegida por autenticação
- Disponibilizar recursos de uma biblioteca digital através de API
- Implementar operações CRUD usando verbos HTTP
- Configurar uma aplicação multi-contentor com Docker
- Documentar a API usando o formato OpenAPI 3.0
- Implementar autenticação OAuth 2.0 com Google

## 3. Arquitetura do Sistema

### 3.1 Visão Geral

O sistema foi implementado seguindo uma arquitetura cliente-servidor, onde:

- **Backend**: API RESTful em Node.js com Express
- **Base de Dados**: MySQL 8.0
- **Autenticação**: OAuth 2.0 com suporte para Google
- **Contentorização**: Docker e Docker Compose

### 3.2 Estrutura do Projeto

```
library-api/
├── public/                 # Arquivos estáticos
│   ├── index.html          # Página principal
│   ├── login.html          # Página de login
│   └── custom-id.html      # Página para criar livros com ID personalizado
├── src/                    # Código-fonte da aplicação
│   ├── config/             # Configurações da aplicação
│   │   ├── auth.js         # Configuração da autenticação
│   │   ├── db.config.js    # Configuração da base de dados
│   │   ├── db-setup.js     # Configuração inicial da base de dados
│   │   ├── oauth.js        # Implementação do OAuth
│   │   ├── oauth.config.js # Configuração OAuth
│   │   ├── google-oauth.config.js # Configuração OAuth do Google
│   │   ├── ddl.sql         # Script de criação de tabelas
│   │   └── dml.sql         # Script de inserção de dados
│   ├── controllers/        # Controladores da API
│   │   ├── authController.js # Controlador de autenticação
│   │   ├── bookController.js # Controlador de livros
│   │   ├── loanController.js # Controlador de empréstimos
│   │   └── userController.js # Controlador de utilizadores
│   ├── middleware/         # Middleware da aplicação
│   │   ├── auth.js         # Middleware de autenticação
│   │   └── errorHandler.js # Tratamento de erros
│   ├── models/             # Modelos de dados
│   │   ├── bookModel.js    # Modelo de livro Sequelize
│   │   ├── loanModel.js    # Modelo de empréstimo
│   │   ├── userModel.js    # Modelo de utilizador
│   │   └── index.js        # Exportação dos modelos
│   ├── routes/             # Rotas da API
│   │   ├── adminRoutes.js  # Rotas administrativas
│   │   ├── bookRoutes.js   # Rotas de livros
│   │   ├── loanRoutes.js   # Rotas de empréstimos
│   │   ├── oauthRoutes.js  # Rotas de autenticação OAuth
│   │   └── userRoutes.js   # Rotas de utilizadores
│   ├── utils/              # Utilitários
│   │   ├── logger.js       # Sistema de logging
│   │   └── routeUtil.js    # Utilitários para rotas
│   ├── views/              # Templates EJS
│   │   └── dashboard.ejs   # Dashboard do utilizador
│   └── app.js              # Configuração da aplicação Express
├── .dockerignore           # Arquivos ignorados pelo Docker
├── .gitignore              # Arquivos ignorados pelo Git
├── docker-compose.yml      # Configuração Docker Compose
├── Dockerfile              # Configuração do container Node.js
├── index.js                # Ponto de entrada da aplicação
├── setup-db.js             # Script de configuração do banco de dados
├── package.json            # Dependências do projeto
├── swagger.js              # Configuração Swagger/OpenAPI
└── README.md               # Documentação básica
```

## 4. Tecnologias Utilizadas

### 4.1 Backend

- **Node.js**: Ambiente de execução JavaScript do lado do servidor
- **Express**: Framework web para Node.js que facilita a criação de APIs
- **Sequelize**: ORM (Object-Relational Mapping) para Node.js, utilizado para interagir com a base de dados MySQL
- **jsonwebtoken**: Biblioteca para geração e validação de tokens JWT
- **bcryptjs**: Biblioteca para hash de senhas
- **node-fetch**: Para requisições HTTP, utilizado na autenticação com o Google
- **cookie-parser**: Para gestão de cookies, usado no armazenamento de tokens
- **ejs**: Motor de templates para renderização de páginas HTML dinâmicas
- **swagger-ui-express** e **swagger-jsdoc**: Para documentação da API

### 4.2 Base de Dados

- **MySQL 8.0**: Sistema de gestão de base de dados relacional
- **mysql2**: Driver MySQL para Node.js
- **Scripts DDL/DML**: Scripts para definição e manipulação de dados

### 4.3 Contentorização

- **Docker**: Plataforma para desenvolvimento, envio e execução de aplicações em contentores
- **Docker Compose**: Ferramenta para definir e executar aplicações Docker multi-contentor

### 4.4 Documentação

- **OpenAPI 3.0**: Especificação para descrever APIs RESTful
- **Swagger UI**: Interface para visualizar e interagir com a documentação da API

## 5. Implementação de Requisitos

### 5.1 API REST

O projeto implementa uma API REST com os quatro verbos HTTP principais:

- **GET**: Para obter recursos (livros, utilizadores, empréstimos)
- **POST**: Para criar novos recursos
- **PUT**: Para atualizar recursos existentes
- **DELETE**: Para remover recursos

Foram disponibilizados três recursos principais:

- **Livros (books)**: Catálogo completo de livros disponíveis na biblioteca
- **Utilizadores (users)**: Gestão de utilizadores do sistema
- **Empréstimos (loans)**: Registo de empréstimos de livros a utilizadores

### 5.2 Relações de Cardinalidade

Foi implementada uma relação de cardinalidade 1:n entre:

- Um utilizador pode ter vários empréstimos (1:n)
- Um livro pode estar associado a vários empréstimos (1:n)

Estas relações foram implementadas no modelo de dados através de chaves estrangeiras e definidas no Sequelize através de associações.

### 5.3 Autenticação e Autorização

A camada de autenticação e autorização foi implementada utilizando:

- **OAuth 2.0**: Para autenticação com contas Google
- **JWT**: Para gestão de tokens de acesso e refresh tokens
- **node-fetch**: Para comunicação com a API OAuth do Google
- **Middleware de autorização**: Para garantir que apenas utilizadores autenticados possam aceder aos recursos

Foram implementados dois níveis de acesso:
- **Utilizador comum (user)**: Acesso limitado aos seus próprios empréstimos
- **Administrador (admin)**: Acesso completo a todos os recursos do sistema, incluindo gestão de utilizadores e livros

### 5.4 Representação de Estado

Todos os recursos são representados em formato JSON, seguindo as boas práticas de APIs RESTful. Os exemplos de respostas estão documentados na especificação OpenAPI.

### 5.5 Registo de Detalhes do Utilizador

Quando um pedido é recebido, a aplicação regista na consola os detalhes do utilizador autenticado, incluindo:

- ID do utilizador
- Nome de utilizador
- Função (admin/user)
- Data e hora do pedido

## 6. Configuração do Ambiente Docker

### 6.1 Contentores Docker

Foram configurados dois contentores principais:

- **library_api_new**: Aplicação Node.js com todas as dependências necessárias
- **library_mysql**: Base de dados MySQL com scripts de inicialização DDL e DML

### 6.2 Docker Compose

O ficheiro docker-compose.yml configura a aplicação multi-contentor:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: library_mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=library_db
    volumes:
      - ./src/config/ddl.sql:/docker-entrypoint-initdb.d/01-ddl.sql
      - ./src/config/dml.sql:/docker-entrypoint-initdb.d/02-dml.sql
      - ./mysql-data:/var/lib/mysql
    restart: unless-stopped
    command: --default-authentication-plugin=mysql_native_password

  api:
    image: node:18-alpine
    container_name: library_api_new
    volumes:
      - ./:/app:rw
    working_dir: /app
    command: sh -c "npm install bcryptjs passport passport-google-oauth20 node-fetch@2 cookie-parser ejs sequelize mysql2 swagger-ui-express && node index.js"
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=development
      - DB_HOST=library_mysql
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - DB_NAME=library_db
      - JWT_SECRET=your_jwt_secret_key
      - GOOGLE_CLIENT_ID=546036603143-scv9c0k6n8u4l3nhp78vtqthj8vc6qve.apps.googleusercontent.com
      - GOOGLE_CLIENT_SECRET=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
      - GOOGLE_CALLBACK_URL=http://localhost:3000/api/oauth/google/callback
    depends_on:
      - mysql
    restart: unless-stopped
```

A configuração inclui:

- Mapeamento de portas: Para acesso externo aos serviços
- Variáveis de ambiente: Para configuração dos serviços
- Volumes: Para persistência de dados e montagem dos scripts de inicialização
- Dependências: Para garantir a ordem de inicialização dos serviços

## 7. Base de Dados

### 7.1 Modelo de Dados

O modelo de dados inclui as seguintes tabelas:

**Users**:
- Armazena informações dos utilizadores do sistema
- Campos: id, username, email, password, role, google_id, external_auth, refresh_token, created_at, updated_at

**Books**:
- Armazena informações dos livros da biblioteca
- Campos: id, title, author, isbn, published_year, genre, description, quantity, available, created_at, updated_at

**Loans**:
- Armazena empréstimos de livros a utilizadores
- Campos: id, user_id, book_id, loan_date, due_date, return_date, status, created_at, updated_at

### 7.2 Relacionamentos

- Um utilizador pode ter múltiplos empréstimos (1:n) - Implementado com uma chave estrangeira `user_id` na tabela `loans`
- Um livro pode estar associado a múltiplos empréstimos (1:n) - Implementado com uma chave estrangeira `book_id` na tabela `loans`

### 7.3 Scripts de Inicialização

A base de dados é inicializada com scripts DDL e DML:

- **ddl.sql**: Cria as tabelas users, books e loans com todos os campos necessários
- **dml.sql**: Insere dados de teste, incluindo:
  - Mais de 30 utilizadores com diferentes perfis
  - 30 livros de diferentes géneros e autores
  - 30 empréstimos em diferentes estados (active, returned, overdue)

## 8. Documentação da API

### 8.1 Especificação OpenAPI 3.0

A API foi documentada utilizando a especificação OpenAPI 3.0, que inclui:

- Descrição de todos os endpoints
- Parâmetros de entrada e saída
- Exemplos de respostas
- Esquemas de segurança (autenticação Bearer)

A configuração foi implementada no arquivo `swagger.js` utilizando o pacote `swagger-jsdoc` para gerar a documentação a partir de comentários no código e definições explícitas.

### 8.2 Swagger UI

A documentação pode ser acedida através do Swagger UI em `/api-docs` e `/api/docs`, permitindo:

- Visualizar todos os endpoints disponíveis
- Testar os endpoints diretamente na interface
- Verificar a estrutura dos dados de entrada e saída
- Autenticar-se para testar endpoints protegidos

## 9. Segurança

### 9.1 Autenticação OAuth2

A autenticação com Google OAuth2 implementada no arquivo `oauthRoutes.js` garante:

- Segurança na gestão de credenciais
- Não armazenamento de senhas em texto simples
- Facilidade de uso para os utilizadores
- Possibilidade de integração com outros provedores OAuth

### 9.2 Proteção de Recursos

Todos os endpoints sensíveis da API são protegidos pelo middleware de autenticação e autorização em `middleware/auth.js`, que proporciona:

- Verificação de autenticação via token JWT
- Verificação de função (admin/user) através da função `authorizeRole`
- Validação de dados de entrada
- Proteção contra acessos não autorizados

### 9.3 Variáveis de Ambiente

Informações sensíveis são geridas através de variáveis de ambiente, definidas no Docker Compose e utilizáveis via `process.env`:

- Credenciais da base de dados (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Segredos JWT (JWT_SECRET)
- Credenciais OAuth do Google (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)

## 10. Funcionalidades Implementadas

### 10.1 Gestão de Livros

- Listagem de todos os livros (acessível publicamente)
- Detalhes de um livro específico por ID (acessível publicamente)
- Adição de novos livros (apenas admin)
- Criação de livros com ID personalizado através de interface específica
- Atualização de informações de livros (apenas admin)
- Remoção de livros (apenas admin)

### 10.2 Gestão de Utilizadores

- Registo de novos utilizadores (`/api/users/register`)
- Autenticação de utilizadores via OAuth 2.0 com Google
- Autenticação tradicional com username/password através do endpoint `/api/oauth/token`
- Listagem de utilizadores (apenas admin)
- Detalhes de um utilizador específico (apenas admin ou próprio utilizador)
- Atualização de informações de utilizadores (apenas admin ou próprio utilizador)
- Remoção de utilizadores (apenas admin)

### 10.3 Gestão de Empréstimos

- Listagem de todos os empréstimos (admin vê todos, utilizadores veem apenas os seus)
- Detalhes de um empréstimo específico
- Registo de novos empréstimos (associados ao utilizador autenticado)
- Atualização de estado de empréstimos (marcação de devolução, alteração de data de vencimento)
- Remoção de empréstimos (apenas admin)
- Filtragem de empréstimos por status (active, returned, overdue)

### 10.4 Interface Web

- Página inicial com links para a documentação da API
- Página de login com autenticação via Google
- Dashboard do utilizador mostrando informações do utilizador autenticado
- Interface para criação de livros com ID personalizado

## 11. Conclusão

O projeto implementou com sucesso todos os requisitos especificados no enunciado, incluindo:

- API REST com 4 verbos HTTP (GET, POST, PUT, DELETE)
- 3 recursos diferentes (books, users, loans) com relações de cardinalidade
- Autenticação e autorização OAuth2 com Google e JWT
- Representação de recursos em JSON
- Documentação OpenAPI 3.0 com Swagger UI
- Configuração multi-contentor com Docker e Docker Compose

A arquitetura escolhida permite uma fácil manutenção e escalabilidade do sistema, enquanto as tecnologias utilizadas seguem as melhores práticas da indústria para desenvolvimento web moderno.

Um diferencial importante do projeto foi a implementação de um sistema de autenticação dupla, permitindo tanto o login tradicional com username/password quanto a autenticação OAuth2 com Google, aumentando a flexibilidade para os utilizadores.

## 12. Instruções de Execução

Para executar o projeto, siga os passos abaixo:

1. Certifique-se de que tem o Docker e o Docker Compose instalados
2. Clone o repositório do projeto
3. (Opcional) Configure variáveis de ambiente personalizadas em um arquivo `.env`
4. Execute o comando: `docker-compose up`
5. Aceda à aplicação em http://localhost:3000
6. Aceda à documentação da API em http://localhost:3000/api-docs
