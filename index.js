import express from 'express';
import db from './models/index.js';

const app = express();

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