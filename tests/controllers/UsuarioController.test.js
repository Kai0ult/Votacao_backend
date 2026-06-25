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

const mockPassportAuthenticate = jest.fn();

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare
  }
}));

jest.unstable_mockModule('passport', () => ({
  default: {
    authenticate: mockPassportAuthenticate
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

  describe('cadastrar', () => {
    // TESTE 1 - execução 2
    it('deve rejeitar email ja existente', async () => {
      const req = mockReq({ email: 'teste@teste.com' });
      const res = mockRes();
      mockFindOne.mockResolvedValue({ id: 1, email: 'teste@teste.com' });

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve rejeitar se email for invalido de acordo com validador', async () => {
      const req = mockReq({ email: 'emailinvalido', cpf: '123' });
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);
      mockValidaEmail.mockReturnValue({ eValido: false, erros: ['Email inválido'] });

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Email inválido' });
    });

    // TESTE 2 - execução 2
    it('deve rejeitar CPF invalido', async () => {
      const req = mockReq({ email: 'novo@teste.com', cpf: '123' });
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);
      mockValidaEmail.mockReturnValue({ eValido: true });
      mockValidaCpf.mockReturnValue({ eValido: false, erros: ['CPF inválido'] });

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve rejeitar se senha nao atender aos requisitos', async () => {
      const req = mockReq({ email: 'novo@teste.com', cpf: '12345678900', senha: '123' });
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);
      mockValidaEmail.mockReturnValue({ eValido: true });
      mockValidaCpf.mockReturnValue({ eValido: true });
      mockValidaSenha.mockReturnValue({ eValido: false, erros: ['Senha muito curta'] });

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'A senha não atende aos requisitos.',
        erros: ['Senha muito curta']
      });
    });

    it('deve rejeitar se partido informado nao existir', async () => {
      const req = mockReq({
        nome: 'João', email: 'joao@teste.com', senha: '123', cpf: '12345678900', partido_id: 99
      });
      const res = mockRes();
      mockFindOne.mockResolvedValue(null);
      mockValidaEmail.mockReturnValue({ eValido: true });
      mockValidaCpf.mockReturnValue({ eValido: true });
      mockValidaSenha.mockReturnValue({ eValido: true });
      mockPartidoFindByPk.mockResolvedValue(null);

      await UsuarioController.cadastrar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Partido informado não existe!' });
    });

    // TESTE 1 - execução 3
    it('deve cadastrar com sucesso com todos os dados validos', async () => {
      const req = mockReq({
        nome: 'João', email: 'joao@teste.com', senha: '123', cpf: '12345678900', partido_id: 1
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

    it('deve retornar 500 se erro ao cadastrar', async () => {
      const req = mockReq({ email: 'erro@teste.com' });
      const res = mockRes();
      mockFindOne.mockRejectedValue(new Error('Erro no BD'));

      await UsuarioController.cadastrar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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

    it('deve atualizar senha com sucesso quando nova senha e fornecida e for valida', async () => {
      const req = mockReq({
        senhaAtual: 'senhaAntiga123',
        senhaNova: 'SenhaNova123!'
      }, { id: 1 });
      const res = mockRes();

      const usuarioMock = {
        id: 1,
        senha: 'hash_antigo',
        update: jest.fn().mockResolvedValue()
      };
      mockFindByPk.mockResolvedValue(usuarioMock);
      mockBcryptCompare.mockResolvedValue(true);
      mockValidaSenha.mockReturnValue({ eValido: true });
      mockBcryptHash.mockResolvedValue('hash_novo');

      await UsuarioController.editar(req, res);

      expect(usuarioMock.update).toHaveBeenCalledWith({
        nome: undefined,
        email: undefined,
        cpf: undefined,
        tipo: undefined,
        partido_id: undefined,
        senha: 'hash_novo'
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve rejeitar se senha nova for invalida', async () => {
      const req = mockReq({
        senhaAtual: 'senhaAntiga123',
        senhaNova: '123'
      }, { id: 1 });
      const res = mockRes();

      const usuarioMock = {
        id: 1,
        senha: 'hash_antigo'
      };
      mockFindByPk.mockResolvedValue(usuarioMock);
      mockBcryptCompare.mockResolvedValue(true);
      mockValidaSenha.mockReturnValue({ eValido: false, erros: ['Senha muito curta'] });

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'A senha nova não atende aos requisitos.',
        erros: ['Senha muito curta']
      });
    });

    it('deve retornar 404 se usuario nao encontrado ao editar', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockFindByPk.mockResolvedValue(null);

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve rejeitar se partido informado na edicao nao existir', async () => {
      const req = mockReq({ partido_id: 99 }, { id: 1 });
      const res = mockRes();

      const usuarioMock = { id: 1, partido_id: 2 };
      mockFindByPk.mockResolvedValue(usuarioMock);
      mockPartidoFindByPk.mockResolvedValue(null);

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Partido informado não existe!' });
    });

    it('deve retornar 500 em caso de erro na edicao', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockFindByPk.mockRejectedValue(new Error('Erro no BD'));

      await UsuarioController.editar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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

    it('deve retornar 500 se erro ao listar', async () => {
      const req = mockReq();
      const res = mockRes();
      mockFindAll.mockRejectedValue(new Error('Erro no BD'));

      await UsuarioController.listar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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

    it('deve excluir o usuario com sucesso', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();

      const usuarioMock = {
        id: 1,
        destroy: jest.fn().mockResolvedValue()
      };
      mockFindByPk.mockResolvedValue(usuarioMock);

      await UsuarioController.excluir(req, res);

      expect(usuarioMock.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 500 se erro ao excluir', async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();
      mockFindByPk.mockRejectedValue(new Error('Erro no BD'));

      await UsuarioController.excluir(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    it('deve autenticar com sucesso', () => {
      const req = { logIn: jest.fn() };
      const res = mockRes();
      const next = jest.fn();

      const usuarioMock = { id: 1, nome: 'João', email: 'joao@teste.com', tipo: 1 };

      mockPassportAuthenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, usuarioMock, null);
        };
      });

      req.logIn.mockImplementation((usuario, cb) => {
        cb(null);
      });

      UsuarioController.login(req, res, next);

      expect(req.logIn).toHaveBeenCalledWith(usuarioMock, expect.any(Function));
      expect(res.json).toHaveBeenCalledWith({
        mensagem: "Login realizado com sucesso!",
        usuario: { id: 1, nome: 'João', email: 'joao@teste.com', tipo: 1 }
      });
    });

    it('deve retornar 500 se authenticate retornar erro', () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      mockPassportAuthenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(new Error('Erro interno'), null, null);
        };
      });

      UsuarioController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro interno", erro: expect.any(Error) });
    });

    it('deve retornar 401 se credenciais invalidas', () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      mockPassportAuthenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, false, { message: 'Senha incorreta' });
        };
      });

      UsuarioController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Senha incorreta' });
    });

    it('deve retornar 500 se logIn falhar ao criar sessao', () => {
      const req = { logIn: jest.fn() };
      const res = mockRes();
      const next = jest.fn();

      const usuarioMock = { id: 1 };
      mockPassportAuthenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, usuarioMock, null);
        };
      });

      req.logIn.mockImplementation((usuario, cb) => {
        cb(new Error('Sessão inválida'));
      });

      UsuarioController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('me', () => {
    it('deve retornar usuario se autenticado', () => {
      const req = { isAuthenticated: jest.fn().mockReturnValue(true), user: { id: 1, nome: 'João' } };
      const res = mockRes();

      UsuarioController.me(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1, nome: 'João' });
    });

    it('deve retornar 401 se nao autenticado', () => {
      const req = { isAuthenticated: jest.fn().mockReturnValue(false) };
      const res = mockRes();

      UsuarioController.me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('deve deslogar com sucesso', () => {
      const req = {
        logout: jest.fn((cb) => cb(null)),
        session: { destroy: jest.fn((cb) => cb()) }
      };
      const res = mockRes();
      res.clearCookie = jest.fn();

      UsuarioController.logout(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Logout realizado com sucesso' });
    });

    it('deve retornar 500 se logout falhar', () => {
      const req = {
        logout: jest.fn((cb) => cb(new Error('Erro logout')))
      };
      const res = mockRes();

      UsuarioController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});