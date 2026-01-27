import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const { Usuario } = db;

export async function semearAdmin() {
    try {
        const totalUsuarios = await Usuario.count();

        if (totalUsuarios === 0) {
            console.log('--- Iniciando Seeding: Nenhum usuário encontrado no sistema. ---');

            // -----------------------------------------------------------------------
            // CONFIGURAÇÃO DO ADMIN INICIAL (Via Variáveis de Ambiente)
            // -----------------------------------------------------------------------
            const emailAdmin = process.env.ADMIN_EMAIL;
            const senhaAdmin = process.env.ADMIN_PASSWORD;
            const nomeAdmin = "AdministradorGeral";
            const cpfAdmin = process.env.ADMIN_CPF;

            if (!emailAdmin || !senhaAdmin || !cpfAdmin) {
                console.warn('[ALERTA] ADMIN_EMAIL, ADMIN_PASSWORD ou ADMIN_CPF não definidos no arquivo .env');
                console.warn('O sistema iniciará sem um administrador inicial.');
                return;
            }

            const senhaCriptografada = await bcrypt.hash(senhaAdmin, 10);

            await Usuario.create({
                nome: nomeAdmin,
                email: emailAdmin,
                senha: senhaCriptografada,
                cpf: cpfAdmin,
                tipo: 2,
                partido_id: null
            });

            console.log(`[SUCESSO] Administrador inicial (${emailAdmin}) criado com sucesso!`);
        } else {
            console.log('--- Seeding: Sistema já possui usuários cadastrados. ---');
        }
    } catch (error) {
        console.error('[ERRO] Falha ao executar o seeding do administrador:', error.message);
    }
}
