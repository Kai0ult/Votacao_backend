import db from '../models/index.js'
const { Projeto } = db

class ProjetoController {
  cadastrar = async (req, res) => {
    try {
      const { titulo, ementa, autor, tipo, dt_votacao, usuario_id } = req.body

      const novoProjeto = await Projeto.create({
        titulo,
        ementa,
        autor,
        tipo,
        dt_votacao,
        usuario_id
      })

      res.status(201).json({ mensagem: 'Projeto cadastrado com sucesso!', projeto: novoProjeto })
    } catch (erro) {
      console.error('Erro ao cadastrar projeto:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao cadastrar projeto', erro: erro.message })
    }
  }

  listar = async (req, res) => {
    try {
      const projetos = await Projeto.findAll()
      res.status(200).json(projetos)
    } catch (erro) {
      console.error('Erro ao listar projetos:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao listar projetos', erro: erro.message })
    }
  };
}

export default new ProjetoController()