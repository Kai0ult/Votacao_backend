
import { jest } from '@jest/globals';


const mockProjetoCreate = jest.fn();
const mockProjetoFindAll = jest.fn();
const mockProjetoFindByPk = jest.fn();
const mockVotoFindAll = jest.fn();


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
    Usuario: {},
    Partido: {},
    Sequelize: { fn: jest.fn(), col: jest.fn() }
  }
}));


jest.unstable_mockModule('puppeteer', () => ({
  default: { launch: jest.fn() }
}));

jest.unstable_mockModule('json2csv', () => ({
  Parser: jest.fn()
}));


const { default: ProjetoController } = await import('../../controllers/ProjetoController.js');


const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
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
  });
});
