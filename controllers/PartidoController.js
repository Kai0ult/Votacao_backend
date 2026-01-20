import db from '../models/index.js'
import { importarPartidosEmMassa } from '../utils/partidoUtils.js'
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

  // edição

  editar = async (req, res) => {
    try {
      const { id } = req.params
      const { nome, sigla } = req.body

      const partido = await Partido.findByPk(id)
      if (!partido) {
        return res.status(404).json({ mensagem: 'Partido não encontrado!' })
      }

      // Verificar se a sigla já existe em outro partido
      if (sigla && sigla !== partido.sigla) {
        const partidoExistente = await Partido.findOne({ where: { sigla } })
        if (partidoExistente) {
          return res.status(400).json({ mensagem: 'Sigla já cadastrada em outro partido!' })
        }
      }

      await partido.update({ nome, sigla })
      res.status(200).json({ mensagem: 'Partido atualizado com sucesso!', partido })
    } catch (erro) {
      console.error('Erro ao editar partido:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao editar partido', erro: erro.message })
    }
  }

  //exclusão

  excluir = async (req, res) => {
    try {
      const { id } = req.params

      const partido = await Partido.findByPk(id)
      if (!partido) {
        return res.status(404).json({ mensagem: 'Partido não encontrado!' })
      }

      await partido.destroy()
      res.status(200).json({ mensagem: 'Partido excluído com sucesso!' })
    } catch (erro) {
      console.error('Erro ao excluir partido:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao excluir partido', erro: erro.message })
    }
  }

  cadastrarEmMassa = async (req, res) => {
    try {
      const listaPartidos = req.body;
      const resultado = await importarPartidosEmMassa(listaPartidos);
      res.status(201).json({
        mensagem: 'Importação de varios partidos concluído',
        detalhes: resultado
      });
    } catch (erro) {
      console.error('Erro na importação:', erro);
      res.status(500).json({ mensagem: 'Erro na importação', erro: erro.message });
    }
  }
}

export default new PartidoController()