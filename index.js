import express from 'express'
import db from './models/index.js'
import usuarioRoutas from './routes/usuario.js'
import partidoRoutas from './routes/partido.js'
import projetoRoutas from './routes/projeto.js'
import votacaoRoutas from './routes/votacao.js'
import cors from "cors"
import session from "express-session"
import passport from "passport"
import connectPgSimple from "connect-pg-simple"
import inicializarPassport from "./config/autenticacao.js"
import { semearAdmin } from "./config/seeder.js"
import dotenv from 'dotenv'
import pkg from 'pg'


const { Pool } = pkg
dotenv.config()

const app = express();
const PgStore = connectPgSimple(session)

const sessionStoreConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  }

app.use(
  session({
    store: new PgStore({
      conObject: sessionStoreConfig
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    },
  })
)

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  })

// Função para garantir a existência da tabela de sessão
async function criarTabelaSessao() {
  const query = `
  CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
  );

  CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `
  await pool.query(query)
  console.log("Tabela de sessão garantida.")
}

// CORS configurado para aceitar múltiplas origens
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

// Depois da sessão
app.use(passport.initialize())
app.use(passport.session())
inicializarPassport(passport)

// Rotas
app.use('/api', usuarioRoutas)
app.use('/api', partidoRoutas)
app.use('/api', projetoRoutas)
app.use('/api', votacaoRoutas)

const iniciarServidor = async () => {
  try {
    await criarTabelaSessao()
    await db.sequelize.sync({ alter: true })
    await semearAdmin()
    console.log('Sincronização com o banco de dados concluída com sucesso.')
    const PORT = process.env.PORT || 3000
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  } catch (error) {
    console.error('Falha ao sincronizar com o banco de dados: ', error)
  }
}

iniciarServidor()
