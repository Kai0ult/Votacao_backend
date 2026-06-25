import { jest } from '@jest/globals';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockPartidoFindByPk = jest.fn();

const mockValidaCpf = jest.fn();
const mockValidaEmail = jest.fn();
const mockValidaSenha = jest.fn();

const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare
  }
}));

jest.unstable_mockModule('../../models/index.js', () => ({
  default: {
    Usuario: { 
      findAll: mockFindAll,
      findByPk: mockFindByPk,
      findOne: mockFindOne,
      create: mockCreate,
    },
    Partido: { findByPk: mockPartidoFindByPk },
    Sequelize: { fn: jest.fn(), col: jest.fn() }
  }
}));

jest.unstable_mockModule('../../utils/validators.js', () => ({
  validaCpf: mockValidaCpf,
  validaEmail: mockValidaEmail,
  validaSenha: mockValidaSenha
}));

const { default: UsuarioController } = await import('../../controllers/UsuarioController.js');

const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UsuarioController', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  describe('cadastrar', () => {
    // TESTE 1 - execução 2
    it('deve rejeitar email ja existente', async () => {
      const req = mockReq({ body: { email: 'teste@teste.com' } });
      const res = mockRes();
      mockFindOne.mockResolvedValue({ id: 1, email: 'teste@teste.com' });

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400); 
    });

    // TESTE 2 - execução 2
    it('deve rejeitar CPF invalido', async () => {
      const req = mockReq({ body: { email: 'novo@teste.com', cpf: '123' } });
      const res = mockRes();
      mockFindOne.mockResolvedValue(null); 
      mockValidaEmail.mockReturnValue({ eValido: true });
      mockValidaCpf.mockReturnValue({ eValido: false, erros: ['CPF inválido'] });

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400); 
    });

    // TESTE 1 - execução 3
    it('deve cadastrar com sucesso com todos os dados validos', async () => {
      const req = mockReq({ 
        body: { nome: 'João', email: 'joao@teste.com', senha: '123', cpf: '12345678900', partido_id: 1 } 
      });
      const res = mockRes();
      
      const usuarioCriado = { id: 1, nome: 'João', email: 'joao@teste.com' };

      mockFindOne.mockResolvedValue(null); 
      mockValidaEmail.mockReturnValue({ eValido: true });
      mockValidaCpf.mockReturnValue({ eValido: true });
      mockValidaSenha.mockReturnValue({ eValido: true });
      mockPartidoFindByPk.mockResolvedValue({ id: 1, nome: 'Partido Ficticio' });
      mockBcryptHash.mockResolvedValue('senha_criptografada_hash');
      mockCreate.mockResolvedValue(usuarioCriado);

      await UsuarioController.cadastrar(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Usuário cadastrado com sucesso!',
        usuario: usuarioCriado
      });
    });
  });

  describe('editar', () => {
    // TESTE 2 - execução 3
    it('deve exigir senha atual e nova juntas', async () => {
      const req = mockReq(
        { senhaNova: 'novaSenha123' }, 
        { id: 1 }
      );
      const res = mockRes();
      
      mockFindByPk.mockResolvedValue({ id: 1, email: 'teste@teste.com', update: jest.fn() });

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Para alterar a senha, preencha tanto a senha atual quanto a nova.'
      });
    });

    // TESTE 3 - execução 3
    it('deve rejeitar se senha atual incorreta', async () => {
      const req = mockReq(
        { senhaAtual: 'senhaErrada', senhaNova: 'novaSenha123' }, 
        { id: 1 }
      );
      const res = mockRes();
      
      mockFindByPk.mockResolvedValue({ id: 1, senha: 'hash_antigo', update: jest.fn() });
      
      mockBcryptCompare.mockResolvedValue(false);

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Senha atual incorreta.' });
    });

    // TESTE 4 - execução 3
    it('deve rejeitar email ja usado por outro usuario', async () => {
      const req = mockReq(
        { email: 'novo_email@teste.com' }, 
        { id: 1 }
      );
      const res = mockRes();
      
      mockFindByPk.mockResolvedValue({ id: 1, email: 'meu_email@teste.com', update: jest.fn() });
      
      mockFindOne.mockResolvedValue({ id: 2, email: 'novo_email@teste.com' });

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Email já cadastrado em outro usuário!' });
    });
  });

  describe('listar', () => {
    // TESTE 3 - execução 2
    it('deve retornar lista de usuarios', async () => {
      const req = mockReq();
      const res = mockRes();
      mockFindAll.mockResolvedValue([{ id: 1, nome: 'João' }]);

      await UsuarioController.listar(req, res);
      expect(res.status).toHaveBeenCalledWith(200); 
    });
  });

  describe('excluir', () => {
    // TESTE 4 - execução 2
    it('deve retornar 404 se usuario nao encontrado', async () => {
      const req = mockReq({}, { id: 99 }); 
      const res = mockRes();
      mockFindByPk.mockResolvedValue(null);

      await UsuarioController.excluir(req, res);
      expect(res.status).toHaveBeenCalledWith(404); 
    });
  });
});