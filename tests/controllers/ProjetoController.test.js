
import { jest } from '@jest/globals';


const mockProjetoCreate = jest.fn();
const mockProjetoFindAll = jest.fn();
const mockProjetoFindByPk = jest.fn();
const mockVotoFindAll = jest.fn();
const mockUsuarioFindByPk = jest.fn();
const mockPuppeteerLaunch = jest.fn();
const mockParserParse = jest.fn();
const mockParserConstructor = jest.fn().mockImplementation(() => ({
  parse: mockParserParse
}));


jest.unstable_mockModule('../../models/index.js', () => ({
  default: {
    Projeto: {
      create: mockProjetoCreate,
      findAll: mockProjetoFindAll,
      findByPk: mockProjetoFindByPk,
    },
    Voto: {
      findAll: mockVotoFindAll,
    },
    Usuario: {
      findByPk: mockUsuarioFindByPk,
    },
    Partido: {},
    Sequelize: { fn: jest.fn(), col: jest.fn() }
  }
}));


jest.unstable_mockModule('puppeteer', () => ({
  default: { launch: mockPuppeteerLaunch }
}));

jest.unstable_mockModule('json2csv', () => ({
  Parser: mockParserConstructor
}));


const { default: ProjetoController } = await import('../../controllers/ProjetoController.js');


const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.attachment = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('ProjetoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cadastrar', () => {
    it('deve criar projeto com sucesso e garantir estado null', async () => {

      const dadosProjeto = {
        titulo: 'Projeto de Lei Municipal',
        ementa: 'Ementa do projeto de teste',
        autor: 'Vereador Silva',
        tipo: 'Lei Ordinária',
        dt_votacao: '2026-07-01',
        usuario_id: 1,
      };
      const req = mockReq(dadosProjeto);
      const res = mockRes();
      const projetoCriado = { id: 1, ...dadosProjeto, estado: null };
      mockProjetoCreate.mockResolvedValue(projetoCriado);


      await ProjetoController.cadastrar(req, res);


      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockProjetoCreate).toHaveBeenCalledWith({
        titulo: 'Projeto de Lei Municipal',
        ementa: 'Ementa do projeto de teste',
        autor: 'Vereador Silva',
        tipo: 'Lei Ordinária',
        dt_votacao: '2026-07-01',
        usuario_id: 1,
        estado: null
      });
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Projeto cadastrado com sucesso!',
        projeto: projetoCriado
      });
    });
  });

  describe('listar', () => {
    it('deve retornar lista de projetos', async () => {

      const req = mockReq();
      const res = mockRes();
      const projetosMock = [
        { id: 1, titulo: 'Projeto A', estado: null },
        { id: 2, titulo: 'Projeto B', estado: 'aprovado' }
      ];
      mockProjetoFindAll.mockResolvedValue(projetosMock);

      await ProjetoController.listar(req, res);


      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(projetosMock);
      expect(mockProjetoFindAll).toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar 404 quando projeto nao existe', async () => {
      const req = mockReq({}, { id: 999 });
      const res = mockRes();
      mockProjetoFindByPk.mockResolvedValue(null);

      await ProjetoController.buscarPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Projeto não encontrado!' });
      expect(mockProjetoFindByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('obterResultado', () => {
    it('deve calcular totais de sim/nao/abstencao corretamente', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockVotoFindAll.mockResolvedValue([
        { opcao: 1, total_votos: '3' },
        { opcao: 2, total_votos: '1' },
        { opcao: 3, total_votos: '2' }
      ]);

      await ProjetoController.obterResultado(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        projeto_id: 1,
        total_votos: 6,
        detalhes: {
          sim: 3,
          nao: 1,
          abstencao: 2
        }
      });
      expect(mockVotoFindAll).toHaveBeenCalled();
    });
  });

  describe('obterResultadoPorPartido', () => {
    it('deve agrupar votos por sigla do partido', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockVotoFindAll.mockResolvedValue([
        { opcao: 1, usuario: { nome: 'User 1', partido: { sigla: 'PT' } } },
        { opcao: 2, usuario: { nome: 'User 2', partido: { sigla: 'PT' } } },
        { opcao: 1, usuario: { nome: 'User 3', partido: { sigla: 'PSDB' } } },
        { opcao: 3, usuario: { nome: 'User 4', partido: null } }
      ]);

      await ProjetoController.obterResultadoPorPartido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        projeto_id: 1,
        total_votos: 4,
        por_partido: {
          PT: { sim: 1, nao: 1, abstencao: 0 },
          PSDB: { sim: 1, nao: 0, abstencao: 0 },
          'Sem Partido': { sim: 0, nao: 0, abstencao: 1 }
        }
      });
      expect(mockVotoFindAll).toHaveBeenCalled();
    });
  });

  describe('obterResultadoPorVereador', () => {
    it('deve converter opcao numerica para texto', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();

      // Mock _buscarVotosDetalhados on ProjetoController instance directly
      const mockVotosDetalhados = [
        { opcao: 1, usuario: { nome: 'Vereador A', partido: { sigla: 'PT' } } },
        { opcao: 2, usuario: { nome: 'Vereador B', partido: null } },
        { opcao: 3, usuario: { nome: 'Vereador C', partido: { sigla: 'PSDB' } } },
        { opcao: 4, usuario: { nome: 'Vereador D', partido: null } }
      ];
      const originalBuscarVotos = ProjetoController._buscarVotosDetalhados;
      ProjetoController._buscarVotosDetalhados = jest.fn().mockResolvedValue(mockVotosDetalhados);

      await ProjetoController.obterResultadoPorVereador(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        projeto_id: 1,
        listagem: [
          { vereador: 'Vereador A', partido: 'PT', voto: 'Sim' },
          { vereador: 'Vereador B', partido: 'Sem Partido', voto: 'Não' },
          { vereador: 'Vereador C', partido: 'PSDB', voto: 'Abstenção' },
          { vereador: 'Vereador D', partido: 'Sem Partido', voto: 'Desconhecido' }
        ]
      });
      expect(ProjetoController._buscarVotosDetalhados).toHaveBeenCalledWith(1);

      // Restore original function
      ProjetoController._buscarVotosDetalhados = originalBuscarVotos;
    });

    it('deve retornar 500 em caso de erro', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      const originalBuscarVotos = ProjetoController._buscarVotosDetalhados;
      ProjetoController._buscarVotosDetalhados = jest.fn().mockRejectedValue(new Error('Erro no BD'));

      await ProjetoController.obterResultadoPorVereador(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Erro ao buscar votos detalhados.',
        erro: 'Erro no BD'
      });

      ProjetoController._buscarVotosDetalhados = originalBuscarVotos;
    });
  });

  describe('buscarPorId adicional', () => {
    it('deve retornar o projeto se ele existir', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      const projetoMock = { id: 1, titulo: 'Projeto A' };
      mockProjetoFindByPk.mockResolvedValue(projetoMock);

      await ProjetoController.buscarPorId(req, res);

      expect(res.json).toHaveBeenCalledWith(projetoMock);
    });

    it('deve retornar 500 se erro ao buscarPorId', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockRejectedValue(new Error('Erro interno do BD'));

      await ProjetoController.buscarPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('cadastrar erro', () => {
    it('deve retornar 500 em caso de erro', async () => {
      const req = mockReq({ titulo: 'Projeto Novo' });
      const res = mockRes();
      mockProjetoCreate.mockRejectedValue(new Error('Erro ao criar'));

      await ProjetoController.cadastrar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('listar erro', () => {
    it('deve retornar 500 em caso de erro', async () => {
      const req = mockReq();
      const res = mockRes();
      mockProjetoFindAll.mockRejectedValue(new Error('Erro ao listar'));

      await ProjetoController.listar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('editar', () => {
    it('deve atualizar o projeto com sucesso', async () => {
      const req = mockReq({
        titulo: 'Título atualizado',
        usuario_id: 2
      }, { id: 1 });
      const res = mockRes();

      const projetoMock = {
        id: 1,
        usuario_id: 1,
        update: jest.fn().mockResolvedValue()
      };

      mockProjetoFindByPk.mockResolvedValue(projetoMock);
      mockUsuarioFindByPk.mockResolvedValue({ id: 2, nome: 'Novo Usuário' });

      await ProjetoController.editar(req, res);

      expect(projetoMock.update).toHaveBeenCalledWith({
        titulo: 'Título atualizado',
        ementa: undefined,
        autor: undefined,
        tipo: undefined,
        dt_votacao: undefined,
        usuario_id: 2,
        estado: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Projeto atualizado com sucesso!',
        projeto: projetoMock
      });
    });

    it('deve retornar 404 se projeto nao existe', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockResolvedValue(null);

      await ProjetoController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Projeto não encontrado!' });
    });

    it('deve retornar 400 se usuario_id informado nao existe', async () => {
      const req = mockReq({ usuario_id: 99 }, { id: 1 });
      const res = mockRes();

      const projetoMock = { id: 1, usuario_id: 1 };
      mockProjetoFindByPk.mockResolvedValue(projetoMock);
      mockUsuarioFindByPk.mockResolvedValue(null);

      await ProjetoController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário informado não existe!' });
    });

    it('deve retornar 500 em caso de erro na edicao', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockRejectedValue(new Error('Erro no BD'));

      await ProjetoController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('excluir', () => {
    it('deve excluir o projeto com sucesso', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();

      const projetoMock = {
        id: 1,
        destroy: jest.fn().mockResolvedValue()
      };
      mockProjetoFindByPk.mockResolvedValue(projetoMock);

      await ProjetoController.excluir(req, res);

      expect(projetoMock.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Projeto excluído com sucesso!' });
    });

    it('deve retornar 404 se projeto nao encontrado', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockResolvedValue(null);

      await ProjetoController.excluir(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Projeto não encontrado!' });
    });

    it('deve retornar 500 se erro ao excluir', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockRejectedValue(new Error('Erro no BD'));

      await ProjetoController.excluir(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('obterResultado erro', () => {
    it('deve retornar 500 se erro ao obter resultado', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockVotoFindAll.mockRejectedValue(new Error('Erro no BD'));

      await ProjetoController.obterResultado(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('obterResultadoPorPartido erro', () => {
    it('deve retornar 500 se erro ao obter resultado por partido', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockVotoFindAll.mockRejectedValue(new Error('Erro no BD'));

      await ProjetoController.obterResultadoPorPartido(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('downloadRelatorioPDF', () => {
    it('deve gerar e baixar PDF com sucesso', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();

      const projetoMock = { id: 1, titulo: 'Projeto A', ementa: 'Ementa A', autor: 'Autor A' };
      mockProjetoFindByPk.mockResolvedValue(projetoMock);

      mockVotoFindAll.mockResolvedValue([
        { opcao: 1, total_votos: '3' },
        { opcao: 2, total_votos: '1' }
      ]);

      const mockVotosDetalhados = [
        { opcao: 1, usuario: { nome: 'Vereador A', partido: { sigla: 'PT' } } },
        { opcao: 2, usuario: { nome: 'Vereador B', partido: null } }
      ];

      const originalBuscarVotos = ProjetoController._buscarVotosDetalhados;
      ProjetoController._buscarVotosDetalhados = jest.fn().mockResolvedValue(mockVotosDetalhados);

      const mockPageInstance = {
        newPage: jest.fn().mockReturnThis(),
        setContent: jest.fn().mockResolvedValue(true),
        pdf: jest.fn().mockResolvedValue(Buffer.from('PDF_CONTENT')),
      };

      const mockBrowserInstance = {
        newPage: jest.fn().mockResolvedValue(mockPageInstance),
        close: jest.fn().mockResolvedValue(true),
      };

      mockPuppeteerLaunch.mockResolvedValue(mockBrowserInstance);

      await ProjetoController.downloadRelatorioPDF(req, res);

      expect(res.set).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(Buffer.from('PDF_CONTENT'));
      expect(mockBrowserInstance.close).toHaveBeenCalled();

      ProjetoController._buscarVotosDetalhados = originalBuscarVotos;
    });

    it('deve retornar 404 se projeto nao existe ao gerar PDF', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockResolvedValue(null);

      await ProjetoController.downloadRelatorioPDF(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Projeto não encontrado!' });
    });

    it('deve retornar 500 em caso de erro ao gerar PDF', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockRejectedValue(new Error('Erro PDF'));

      await ProjetoController.downloadRelatorioPDF(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('downloadRelatorioCSV', () => {
    it('deve gerar e baixar CSV com sucesso', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();

      const projetoMock = { id: 1, titulo: 'Projeto A' };
      mockProjetoFindByPk.mockResolvedValue(projetoMock);

      const mockVotosDetalhados = [
        { opcao: 1, createdAt: '2026-06-25T12:00:00.000Z', usuario: { nome: 'Vereador A', partido: { sigla: 'PT' } } },
        { opcao: 2, createdAt: '2026-06-25T12:00:00.000Z', usuario: { nome: 'Vereador B', partido: null } }
      ];

      const originalBuscarVotos = ProjetoController._buscarVotosDetalhados;
      ProjetoController._buscarVotosDetalhados = jest.fn().mockResolvedValue(mockVotosDetalhados);

      mockParserParse.mockReturnValue('CSV_DATA');

      await ProjetoController.downloadRelatorioCSV(req, res);

      expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.attachment).toHaveBeenCalledWith('votos_projeto_1.csv');
      expect(res.send).toHaveBeenCalledWith('CSV_DATA');

      ProjetoController._buscarVotosDetalhados = originalBuscarVotos;
    });

    it('deve retornar 404 se projeto nao existe ao gerar CSV', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockResolvedValue(null);

      await ProjetoController.downloadRelatorioCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 500 em caso de erro ao gerar CSV', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockProjetoFindByPk.mockRejectedValue(new Error('Erro CSV'));

      await ProjetoController.downloadRelatorioCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
