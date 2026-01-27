# 🗳️ Sistema de Votação - Backend

Backend robusto para sistema de votação desenvolvido com **Node.js**, **Express** e **PostgreSQL.**

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)

---

## 📖 Sobre o Projeto

Este backend gerencia todo o fluxo de uma votação eletrônica segura, incluindo:

- **Autenticação e Autorização** com Passport.js e Sessões
- **Gerenciamento de Entidades** (Usuários, Partidos, Projetos)
- **Registro de Votos** com integridade referencial
- **Geração de Relatórios** e Comprovantes (PDF)

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/Kai0ult/Votacao_backend.git
cd Votacao_backend

# Instale as dependências
npm install
```

### 2. Configuração do Banco de Dados

1. Crie um banco de dados no PostgreSQL chamado `sistema_votacao`.
2. Configure as variáveis de ambiente:
   - Copie o arquivo de exemplo: `cp .env.example .env` (ou copie e renomeie manualmente)
   - Edite o arquivo `.env` com suas credenciais do Postgres.

**Exemplo de `.env`:**

```ini
DB_NAME=sistema_votacao
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
SESSION_SECRET=uma_chave_super_secreta
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@teste.com
ADMIN_PASSWORD=admin123
ADMIN_CPF=12345678900
```

### 3. Execução

```bash
# Iniciar o servidor
npm start
```

O servidor rodará em `http://localhost:3000`.
O banco de dados será sincronizado automaticamente e o administrador inicial será criado.

---

## 🛠️ Tecnologias Principais

- **Core:** Node.js, Express
- **Banco de Dados:** PostgreSQL, Sequelize ORM
- **Autenticação:** Passport.js, Express-Session, Connect-PG-Simple
- **Segurança:** Bcrypt, CORS, Helmet
- **Utilitários:** Puppeteer (Geração de PDFs), Dotenv

---

## 👨‍💻 Autores

- Caio Souza
- Igor Ryan
- Tamara Silva

---

*Este projeto é parte de um trabalho acadêmico.*
