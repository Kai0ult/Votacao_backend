import db from '../models/index.js'
import puppeteer from 'puppeteer';
import { Parser } from 'json2csv';
const { Projeto, Voto, Usuario, Partido} = db

class ProjetoController {
  cadastrar = async (req, res) => {
    try {
      const { titulo, ementa, autor, tipo, dt_votacao, usuario_id, estado } = req.body

      const novoProjeto = await Projeto.create({
        titulo,
        ementa,
        autor,
        tipo,
        dt_votacao,
        usuario_id,
        estado: null
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
      const { titulo, ementa, autor, tipo, dt_votacao, usuario_id, estado } = req.body

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
        usuario_id,
        estado
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

  obterResultado = async (req, res) => {
    try {
      const { id } = req.params
      const contagem = await Voto.findAll({
        where: { projeto_id: id },
        attributes: [
          'opcao',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('usuario_id')), 'total_votos']
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

  obterResultadoPorPartido = async (req, res) => {
    try {
      const { id } = req.params
      const votos = await Voto.findAll({
        where: { projeto_id: id },
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['nome'],
          include: [{
            model: Partido,
            as: 'partido',
            attributes: ['sigla', 'nome']
          }]
        }]
      })

      const resultado = {};

      for(let voto of votos ){
        const siglaPartido = voto.usuario?.partido?.sigla || 'Sem Partido';
        
        if (!resultado[siglaPartido]) {
          resultado[siglaPartido] = { sim: 0, nao: 0, abstencao: 0 };
        }

        if (voto.opcao === 1)
          resultado[siglaPartido].sim++;
        else if (voto.opcao === 2)
          resultado[siglaPartido].nao++;
        else if (voto.opcao === 3)
          resultado[siglaPartido].abstencao++;
      }

      return res.status(200).json({
        projeto_id: id,
        total_votos: votos.length,
        por_partido: resultado
      });
    } catch (error) {
      console.error('Erro ao agrupar por partido:', error)
      res.status(500).json({ mensagem: 'Erro ao calcular resultados por partido.', erro: error.message})
    }
  }

  obterResultadoPorVereador = async (req, res) => {
    try {
      const { id } = req.params
      const votos = await this._buscarVotosDetalhados(id);

      const listaVotos = votos.map(voto => {
        let textoVoto = '';
        switch(voto.opcao) {
          case 1: textoVoto = 'Sim'; break;
          case 2: textoVoto = 'Não'; break;
          case 3: textoVoto = 'Abstenção'; break;
          default: textoVoto = 'Desconhecido';
        }

        return {
          vereador: voto.usuario.nome,
          partido: voto.usuario.partido ? voto.usuario.partido.sigla : 'Sem Partido',
          voto: textoVoto
        };
      });

      return res.status(200).json({
        projeto_id: id,
        listagem: listaVotos
      })
    } catch (error) {
      console.error('Erro ao listar votos por vereador:', error)
      res.status(500).json({ mensagem: 'Erro ao buscar votos detalhados.', erro: error.message})
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

  _buscarVotosDetalhados = async (projetoId) => {
    return await Voto.findAll({
      where: { projeto_id: projetoId },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['nome'],
        include: [{
          model: Partido,
          as: 'partido',
          attributes: ['sigla']
        }]
      }],
      order: [['usuario', 'nome', 'ASC']]
    });
  }

  downloadRelatorioPDF = async (req, res) => {
    try{
      const { id } = req.params;
      
      const projeto = await Projeto.findByPk(id);
      if (!projeto) {
        return res.status(404).json({ mensagem: "Projeto não encontrado!" });
      }

      const contagem = await Voto.findAll({
        where: { projeto_id: id },
        attributes: [
          'opcao',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('usuario_id')), 'total_votos']
        ],
        group: ['opcao'],
        raw: true
      });

      let sim = 0, nao = 0, abstencao = 0;
      contagem.forEach(item => {
        if (item.opcao === 1) sim = Number.parseInt(item.total_votos);
        if (item.opcao === 2) nao = Number.parseInt(item.total_votos);
        if (item.opcao === 3) abstencao = Number.parseInt(item.total_votos);
      });

      const listaVotos = await this._buscarVotosDetalhados(id);

      const linhasTabela = listaVotos.map(voto => {
        let texto = 'Desconhecido';

        if (voto.opcao === 1) { texto = 'Sim'; }
        if (voto.opcao === 2) { texto = 'Não'; }
        if (voto.opcao === 3) { texto = 'Abstenção'; }

        return `
          <tr>
            <td>${voto.usuario?.nome || 'Desconhecido'}</td>
            <td>${voto.usuario?.partido?.sigla || 'S/P'}</td>
            <td style="font-weight: bold;">${texto}</td>
          </tr>
        `;
      }).join('');

      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      const conteudoHTML = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { margin-bottom: 5px;color: #333; }
              .header { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px;}

              .resultado { 
                display: flex; gap: 20px; margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px;
              }
              .stat { font-size: 16px; margin-right: 15px; }

              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
              tr:nth-child(even) { background-color: #fafafa; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Votação</h1>
              <h2>${projeto.titulo}</h2>
              <p><strong>Ementa:</strong> ${projeto.ementa}</p>
              <p><strong>Autor:</strong> ${projeto.autor}</p>
            </div>
            
            <h3>Resumo da Votação</h3>
            <div class="resultado">
              <span class="stat" style="color: green"> Sim: ${sim}</span>
              <span class="stat" style="color: red"> Não: ${nao}</span>
              <span class="stat" style="color: gray"> Abstenção: ${abstencao}</span>
              <span class="stat"><strong>Total: ${sim+nao+abstencao}</strong></span>
            </div>

            <h3>Detalhamento dos Votos</h3>
            <table>
              <thead>
                <tr>
                  <th>Vereador</th>
                  <th>Partido</th>
                  <th>Voto</th>
                </tr>
              </thead>
              <tbody>
                ${linhasTabela} </tbody>
            </table>

            <p style="margin-top: 40px; font-size: 12px; color: #777;">
              Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
          </body>
        </html>
      `;

      await page.setContent(conteudoHTML, { waitUntil: 'domcontentloaded' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });

      await browser.close();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
        'Content-Disposition': `attachment; filename="relatorio_projeto_${id}.pdf"`
      });

      res.send(pdfBuffer);
    }catch (error){
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ mensagem: 'Erro ao gerar PDF.', erro: error.message})
    }
  }

  downloadRelatorioCSV = async (req, res) => {
    try {
      const { id } = req.params;

      const projeto = await Projeto.findByPk(id);
      if (!projeto) {
        return res.status(404).json({ mensagem: "Projeto não encontrado!" });
      }

      const votos = await Voto.findAll({
        where: { projeto_id: id },
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['nome'],
          include: [{
            model: Partido,
            as: 'partido',
            attributes: ['sigla']
          }]
        }]
      });

      const dadosParaCSV = votos.map(voto => {
        let textoVoto = '';
        switch(voto.opcao) {
          case 1: textoVoto = 'Sim'; break;
          case 2: textoVoto = 'Não'; break;
          case 3: textoVoto = 'Abstenção'; break;
          default: textoVoto = 'Desconhecido';
        }

        return {
          Vereador: voto.usuario?.nome || 'Desconhecido',
          Partido: voto.usuario?.partido?.sigla || 'S/P',
          Voto: textoVoto,
          Data: new Date(voto.createdAt).toLocaleDateString('pt-BR')
        };
      });

      const campos = ['Vereador', 'Partido', 'Voto', 'Data'];
      const json2csvParser = new Parser({ fields: campos, delimiter: ';' });
      const csv = json2csvParser.parse(dadosParaCSV);

      res.header('Content-Type', 'text/csv');
      res.attachment(`votos_projeto_${id}.csv`);
      return res.send(csv);
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      res.status(500).json({ mensagem: 'Erro ao gerar CSV.', erro: error.message });
    }
  }
}

export default new ProjetoController()