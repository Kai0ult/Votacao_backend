import db from '../models/index.js'
const { Partido } = db

class PartidoController {
  cadastrar = async (req, res) => {
    try {
      const { nome, sigla } = req.body

      const partidoExistente = await Partido.findOne({ where: { sigla } })
      if (partidoExistente) {
        return res.status(400).json({ mensagem: 'Partido já cadastrado!' })
      }

      const novoPartido = await Partido.create({ nome, sigla })
      res.status(201).json({ mensagem: 'Partido cadastrado com sucesso!', partido: novoPartido })
    } catch (erro) {
      console.error('Erro ao cadastrar partido:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao cadastrar partido', erro: erro.message })
    }
  }

  listar = async (req, res) => {
    try {
      const partidos = await Partido.findAll()
      res.status(200).json(partidos)
    } catch (erro) {
      console.error('Erro ao listar partidos:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao listar partidos', erro: erro.message })
    }
  }
}

export default new PartidoController()