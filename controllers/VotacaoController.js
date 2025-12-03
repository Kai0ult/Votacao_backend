import db from '../models/index.js'
const { Voto, Usuario, Projeto } = db

class VotacaoController {
    registrarVoto = async (req, res) => {
        try {
            const { usuario_id, projeto_id, opcao } = req.body

            if (!usuario_id || !projeto_id || opcao === undefined) {
                return res.status(400).json({
                    mensagem: 'Campos obrigatórios: usuario_id, projeto_id e opcao'
                })
            }

            // Verificar se o usuario existe
            const vereador = await Usuario.findByPk(usuario_id)
            if (!vereador) {
                return res.status(404).json({ mensagem: 'Vereador não encontrado!' })
            }

            // Verificar se o projeto existe
            const projeto = await Projeto.findByPk(projeto_id)
            if (!projeto) {
                return res.status(404).json({ mensagem: 'Projeto não encontrado!' })
            }

            // Verificar duplicidade de voto - não permiti que o mesmo vereador vote mais de uma vez no mesmo projeto
            const votoExistente = await Voto.findOne({
                where: {
                    usuario_id,
                    projeto_id
                }
            })

            if (votoExistente) {
                return res.status(400).json({
                    mensagem: 'Este vereador ja registrou um voto para este projeto. Não é permitido votar mais de uma vez no mesmo projeto.'
                })
            }

            // Registrar o voto
            const novoVoto = await Voto.create({
                usuario_id,
                projeto_id,
                opcao
            })

            res.status(201).json({
                mensagem: 'Voto registrado com sucesso!',
                voto: novoVoto
            })
        } catch (erro) {
            console.error('Erro ao registrar voto:', erro)
            res.status(500).json({
                mensagem: 'Erro interno ao registrar voto',
                erro: erro.message
            })
        }
    }

    listarVotos = async (req, res) => {
        try {
            const votos = await Voto.findAll({
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nome', 'email']
                    },
                    {
                        model: Projeto,
                        as: 'projeto',
                        attributes: ['id', 'titulo', 'tipo']
                    }
                ]
            })
            res.status(200).json(votos)
        } catch (erro) {
            console.error('Erro ao listar votos:', erro)
            res.status(500).json({
                mensagem: 'Erro interno ao listar votos',
                erro: erro.message
            })
        }
    }


}

export default new VotacaoController()

