import express from 'express';
import db from './models/index.js';
import usuarioRoutas from './routes/usuario.js'
import partidoRoutas from './routes/partido.js'
import projetoRoutas from './routes/projeto.js'
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json())

// Rotas
app.use('/api', usuarioRoutas)
app.use('/api', partidoRoutas)
app.use('/api', projetoRoutas)


const iniciarServidor = async () => {
    try { 
        await db.sequelize.sync();
        console.log('Sincronização com o banco de dados concluída com sucesso.');
        app.listen(3000, ()=>{
            console.log("Servidor em http://localhost:3000")
        })
    } catch (error) {
        console.error('Falha ao sincronizar com o banco de dados: ', error);
    }
};

iniciarServidor();