
import { jest } from '@jest/globals';


const mockUsuarioFindByPk = jest.fn();
const mockProjetoFindByPk = jest.fn();
const mockVotoFindOne = jest.fn();
const mockVotoCreate = jest.fn();
const mockVotoFindAll = jest.fn();


jest.unstable_mockModule('../../models/index.js', () => ({
  default: {
    Voto: {
      findOne: mockVotoFindOne,
      create: mockVotoCreate,
      findAll: mockVotoFindAll,
    },
    Usuario: {
      findByPk: mockUsuarioFindByPk,
    },
    Projeto: {
      findByPk: mockProjetoFindByPk,
    },
  }
}));


const { default: VotacaoController } = await import('../../controllers/VotacaoController.js');
const { default: db } = await import('../../models/index.js');
const { Usuario, Projeto } = db;


const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('VotacaoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarVoto', () => {
    it('deve rejeitar quando campos obrigatórios faltam', async () => {

      const req = mockReq({ usuario_id: 1 });
      const res = mockRes();


      await VotacaoController.registrarVoto(req, res);


      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Campos obrigatórios: usuario_id, projeto_id e opcao'
      });
    });

    it('deve rejeitar voto duplicado', async () => {

      const req = mockReq({ usuario_id: 1, projeto_id: 10, opcao: 1 });
      const res = mockRes();
      mockUsuarioFindByPk.mockResolvedValue({ id: 1, nome: 'Vereador Teste' });
      mockProjetoFindByPk.mockResolvedValue({ id: 10, titulo: 'Projeto Teste' });
      mockVotoFindOne.mockResolvedValue({ id: 99, usuario_id: 1, projeto_id: 10, opcao: 1 });

      await VotacaoController.registrarVoto(req, res);


      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Este vereador ja registrou um voto para este projeto. Não é permitido votar mais de uma vez no mesmo projeto.'
      });

      expect(mockVotoFindOne).toHaveBeenCalledWith({
        where: { usuario_id: 1, projeto_id: 10 }
      });
    });

    // Teste 5: Fluxo completo de sucesso ao registrar um novo voto válido (Igor Ryan)
    it('deve registrar voto com sucesso (fluxo completo)', async () => {
      const req = mockReq({ usuario_id: 1, projeto_id: 1, opcao: 1 });
      const res = mockRes();

      mockUsuarioFindByPk.mockResolvedValue({ id: 1, nome: 'Vereador 1' });
      mockProjetoFindByPk.mockResolvedValue({ id: 1, titulo: 'Projeto 1' });
      mockVotoFindOne.mockResolvedValue(null);
      mockVotoCreate.mockResolvedValue({ id: 1, usuario_id: 1, projeto_id: 1, opcao: 1 });

      await VotacaoController.registrarVoto(req, res);

      expect(mockUsuarioFindByPk).toHaveBeenCalledWith(1);
      expect(mockProjetoFindByPk).toHaveBeenCalledWith(1);
      expect(mockVotoFindOne).toHaveBeenCalled();
      expect(mockVotoCreate).toHaveBeenCalledWith({ usuario_id: 1, projeto_id: 1, opcao: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensagem: 'Voto registrado com sucesso!'
      }));
    });

    // Teste 6: Fluxo de erro ao tentar registrar voto para um vereador inexistente (Igor Ryan)
    it('deve retornar 404 se vereador nao existe', async () => {
      const req = mockReq({ usuario_id: 99, projeto_id: 1, opcao: 1 });
      const res = mockRes();

      mockUsuarioFindByPk.mockResolvedValue(null);

      await VotacaoController.registrarVoto(req, res);

      expect(mockUsuarioFindByPk).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Vereador não encontrado!' });
    });

    // Teste 7: Fluxo de erro ao tentar registrar voto para um projeto inexistente (Igor Ryan)
    it('deve retornar 404 se projeto nao existe', async () => {
      const req = mockReq({ usuario_id: 1, projeto_id: 99, opcao: 1 });
      const res = mockRes();

      mockUsuarioFindByPk.mockResolvedValue({ id: 1, nome: 'Vereador 1' });
      mockProjetoFindByPk.mockResolvedValue(null);

      await VotacaoController.registrarVoto(req, res);

      expect(mockUsuarioFindByPk).toHaveBeenCalledWith(1);
      expect(mockProjetoFindByPk).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Projeto não encontrado!' });
    });
  });

  describe('listarVotos', () => {
    // Teste 8: Fluxo de sucesso listando os votos com os dados populados dos relacionamentos (Igor Ryan)
    it('deve retornar votos com dados de usuario e projeto', async () => {
      const req = mockReq();
      const res = mockRes();

      const votosMock = [
        { id: 1, opcao: 1, usuario: { id: 1, nome: 'Ver 1' }, projeto: { id: 1, titulo: 'Proj 1' } }
      ];
      mockVotoFindAll.mockResolvedValue(votosMock);

      await VotacaoController.listarVotos(req, res);

      expect(mockVotoFindAll).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({ model: Usuario, as: 'usuario' }),
          expect.objectContaining({ model: Projeto, as: 'projeto' })
        ])
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(votosMock);
    });
  });
});
