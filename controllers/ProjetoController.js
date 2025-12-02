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

  editar = async (req, res) => {
    try {
      const { id } = req.params
      const { titulo, ementa, autor, tipo, dt_votacao, usuario_id } = req.body

      const projeto = await Projeto.findByPk(id)
      if (!projeto) {
        return res.status(404).json({ mensagem: 'Projeto não encontrado!' })
      }

      // Verificar se o usuário existe (se usuario_id foi fornecido)
      if (usuario_id && usuario_id !== projeto.usuario_id) {
        const usuarioExistente = await db.Usuario.findByPk(usuario_id)
        if (!usuarioExistente) {
          return res.status(400).json({ mensagem: 'Usuário informado não existe!' })
        }
      }

      await projeto.update({
        titulo,
        ementa,
        autor,
        tipo,
        dt_votacao,
        usuario_id
      })

      res.status(200).json({ mensagem: 'Projeto atualizado com sucesso!', projeto })
    } catch (erro) {
      console.error('Erro ao editar projeto:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao editar projeto', erro: erro.message })
    }
  }

  excluir = async (req, res) => {
    try {
      const { id } = req.params

      const projeto = await Projeto.findByPk(id)
      if (!projeto) {
        return res.status(404).json({ mensagem: 'Projeto não encontrado!' })
      }

      await projeto.destroy()
      res.status(200).json({ mensagem: 'Projeto excluído com sucesso!' })
    } catch (erro) {
      console.error('Erro ao excluir projeto:', erro)
      res.status(500).json({ mensagem: 'Erro interno ao excluir projeto', erro: erro.message })
    }
  }

  buscarPorId = async (req, res) => {
    try {
      const { id } = req.params

      const projeto = await Projeto.findByPk(id)

      if (!projeto) {
        return res.status(404).json({ mensagem: "Projeto não encontrado!" })
      }

      res.json(projeto)
    } catch (erro) {
      console.error("Erro ao buscar projeto:", erro)
      res.status(500).json({ mensagem: "Erro interno", erro: erro.message })
    }
  }
}

export default new ProjetoController()