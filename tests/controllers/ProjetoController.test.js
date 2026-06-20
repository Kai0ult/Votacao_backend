
import { jest } from '@jest/globals';


const mockProjetoCreate = jest.fn();
const mockProjetoFindAll = jest.fn();


jest.unstable_mockModule('../../models/index.js', () => ({
  default: {
    Projeto: {
      create: mockProjetoCreate,
      findAll: mockProjetoFindAll,
      findByPk: jest.fn(),
    },
    Voto: {
      findAll: jest.fn(),
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
});
