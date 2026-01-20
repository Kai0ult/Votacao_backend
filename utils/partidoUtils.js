import db from '../models/index.js';

const { Partido } = db;

/**
 * Importa uma lista de partidos em massa para o banco de dados.
 * @param {Array<{nome: string, sigla: string}>} listaPartidos - Lista de objetos com nome e sigla dos partidos.
 * @returns {Promise<{totalCriados: number, erros: Array}>} - Retorna o total criado e possíveis erros (não bloqueante).
 */
export async function importarPartidosEmMassa(listaPartidos) {
    if (!Array.isArray(listaPartidos) || listaPartidos.length === 0) {
        throw new Error("A lista de partidos deve ser um array não vazio.");
    }
    // Filtrar entradas inválidas
    const partidosValidos = listaPartidos.filter(p => p.nome && p.sigla && typeof p.nome === 'string' && typeof p.sigla === 'string');

    if (partidosValidos.length === 0) {
        throw new Error("Nenhum partido válido encontrado na lista.");
    }

    try {
        const partidosCriados = await Partido.bulkCreate(partidosValidos, { validate: true });

        return {
            totalCriados: partidosCriados.length,
            detalhes: partidosCriados
        };
    } catch (erro) {
        throw new Error(`Erro ao importar partidos: ${erro.message}`);
    }
}
