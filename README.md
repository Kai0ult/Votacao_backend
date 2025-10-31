# 🗳️ Sistema de Votação - Backend

Backend completo para um sistema de votação desenvolvido com **Node.js**, **Express** e **PostgreSQL**, implementando autenticação segura com **Passport.js** e sessões.

![Node.js](https://img.shields.io/badge/Node.js-18%25-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%25-blue)

---

## 📖 Descrição do Projeto
Este é o backend de um sistema de votação desenvolvido como parte de um projeto acadêmico.  
O sistema permite o gerenciamento de **usuários**, **partidos políticos** e **projetos de lei**, com autenticação segura e controle de sessões.

O backend foi construído com uma arquitetura modular, seguindo boas práticas de desenvolvimento e segurança, incluindo:
- Criptografia de senhas com **bcrypt**  
- Sessões persistentes com **PostgreSQL**  
- Middleware de autenticação com **Passport.js**  
- Validação de dados e separação clara entre camadas

---

# ✨ Funcionalidades
🔐 Autenticação e Sessão
[✔] Cadastro de usuários com senha criptografada

[✔] Login com Passport Local Strategy

[✔] Sessões persistentes com PostgreSQL

[✔] Middleware de autenticação

[✔] Logout com destruição de sessão

👥 Gerenciamento de Usuários
[✔] CRUD completo de usuários

[✔] Associação com partidos políticos

[✔] Validação de email único

[✔] Diferentes tipos de usuário

🏛️ Gerenciamento de Partidos
[✔] CRUD completo de partidos

[✔] Validação de sigla única

[✔] Associação com usuários

📋 Gerenciamento de Projetos
[✔] CRUD completo de projetos

[✔] Associação com usuários autores

[✔] Controle de data de votação

---

## 🛠️ Tecnologias Utilizadas Backend

**[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript

**[Express.js](https://expressjs.com/):** Framework web para Node.js

**[Sequelize](https://sequelize.org/):** ORM para PostgreSQL

**[Passport.js](https://www.passportjs.org/):** Middleware de autenticação

## Segurança e Autenticação
**[bcryptjs](https://www.npmjs.com/package/bcryptjs):** Criptografia de senhas

**[express-session](https://www.npmjs.com/package/express-session):** Gerenciamento de sessões

**[connect-pg-simple](https://www.npmjs.com/package/connect-pg-simple):** Store de sessões no PostgreSQL

## Banco de Dados
**[PostgreSQL](https://www.postgresql.org/):** Banco de dados relacional

**[pg](https://www.npmjs.com/package/pg):** Cliente PostgreSQL para Node.js

## Utilidades
**[CORS](https://www.npmjs.com/package/cors):** Habilitação de CORS

**[dotenv](https://www.npmjs.com/package/dotenv):** Gerenciamento de variáveis de ambiente

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 16+
- npm ou yarn

## 🚀 Como Executar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/Kai0ult/Votacao_backend.git
cd Votacao_backend
 ```
### 2. Instale as dependências
```bash
npm install
 ```

### 3. Configure o Banco de Dados
```bash
CREATE DATABASE sistema_votacao;
 ```

### 4. Configure as variáveis de ambiente
```bash
# Configurações do Banco de Dados
DB_NAME=sistema_votacao
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_HOST=localhost
DB_PORT=5432

# Configurações de Sessão
SESSION_SECRET=V@L1D@Ç@0

# Configurações do Frontend
FRONTEND_URL=http://localhost:3001](http://localhost:5173
 ```

### ⚠️ Importante: Modifique estas variáveis de acordo com seu ambiente:

- DB_USER e DB_PASSWORD: Credenciais do seu PostgreSQL

- SESSION_SECRET: String única e complexa para segurança das sessões

- FRONTEND_URL: URL do seu frontend para configuração CORS

### 5. Inicie o Servidor
```bash
node index.js
 ```

---

## 📡 Endpoints da API

### 🔐 Autenticação
- `POST /api/login` - Login de usuário
- `POST /api/logout` - Logout
- `GET /api/me` - Usuário logado

### 👥 Usuários
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios` - Listar usuários
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Excluir usuário

### 🏛️ Partidos
- `POST /api/partidos` - Criar partido
- `GET /api/partidos` - Listar partidos
- `PUT /api/partidos/:id` - Atualizar partido
- `DELETE /api/partidos/:id` - Excluir partido

### 📋 Projetos
- `POST /api/projetos` - Criar projeto
- `GET /api/projetos` - Listar projetos
- `PUT /api/projetos/:id` - Atualizar projeto
- `DELETE /api/projetos/:id` - Excluir projeto

## 🔒 Estrutura de Autenticação

O sistema utiliza:
- **Passport Local Strategy** para autenticação
- **Sessões armazenadas no PostgreSQL** para persistência
- **bcrypt** para hash de senhas
- **CORS configurado** para comunicação com frontend

### 👨‍💻 Autores

- Desenvolvido por Caio Souza, Igor Ryan & Tamara Silva.

[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Kai0ult)  
