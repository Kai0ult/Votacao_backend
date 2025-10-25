import express from 'express'
import db from './models/index.js'
import usuarioRoutas from './routes/usuario.js'
import partidoRoutas from './routes/partido.js'
import projetoRoutas from './routes/projeto.js'
import cors from "cors"
import session from "express-session"
import passport from "passport"
import connectPgSimple from "connect-pg-simple"
import inicializarPassport from "./config/autenticacao.js"


const app = express();
const PgStore = connectPgSimple(session)

app.use(
    session({
        store: new PgStore({
            conObject: {
                user: 'postgres',
                password: 'nt00384',
                host: 'localhost',
                port: 5432,
                database: 'sistema_votacao'
            }
        }),
        secret: "V@L1D@Ç@0",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            secure: false 
        },
    })
)

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json())
app.use(passport.initialize());
app.use(passport.session());
inicializarPassport(passport);

// Rotas
app.use('/api', usuarioRoutas)
app.use('/api', partidoRoutas)
app.use('/api', projetoRoutas)


const iniciarServidor = async () => {
    try {
        await db.sequelize.sync();
        console.log('Sincronização com o banco de dados concluída com sucesso.');
        app.listen(3000, () => {
            console.log("Servidor em http://localhost:3000")
        })
    } catch (error) {
        console.error('Falha ao sincronizar com o banco de dados: ', error);
    }
};

iniciarServidor();