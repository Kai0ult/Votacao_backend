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

  obterResultado = async (req, res) => {
    try {
      const { id } = req.params
      const contagem = await Voto.findAll({
        where: { projeto_id: id },
        attributes: [
          'opcao',
          [Sequelize.fn('COUNT', Sequelize.col('usuario_id')), 'total_votos']
        ],
        group: ['opcao'],
        raw: true
      })

      const resultadoFormatado = {
        sim: 0,
        nao: 0,
        abstencao: 0
      }

      for(let item of contagem){
        if (item.opcao === 1)
          resultadoFormatado.sim = Number.parseInt(item.total_votos);
        if (item.opcao === 2) 
          resultadoFormatado.nao = Number.parseInt(item.total_votos);
        if (item.opcao === 3) 
          resultadoFormatado.abstencao = Number.parseInt(item.total_votos);
      }

      const totalGeral = resultadoFormatado.sim + resultadoFormatado.nao + resultadoFormatado.abstencao;

      return res.status(200).json({
        projeto_id: id,
        total_votos: totalGeral,
        detalhes: resultadoFormatado
      });
    } catch (error) {
      console.error('Erro ao calcular resultados.', error)
      res.status(500).json({ mensagem: 'Erro ao calcular resultados.', erro: error.message})
    }
  }
}

export default new ProjetoController()