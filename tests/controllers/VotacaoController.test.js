
import { jest } from '@jest/globals';


const mockUsuarioFindByPk = jest.fn();
const mockProjetoFindByPk = jest.fn();
const mockVotoFindOne = jest.fn();
const mockVotoCreate = jest.fn();


jest.unstable_mockModule('../../models/index.js', () => ({
  default: {
    Voto: {
      findOne: mockVotoFindOne,
      create: mockVotoCreate,
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
  });
});
