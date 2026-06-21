import { jest } from '@jest/globals';
import { ensureAuthenticated, checkRole } from '../../config/autenticacao.js';

const mockReq = (authenticated = false, user = {}) => ({
  isAuthenticated: jest.fn().mockReturnValue(authenticated),
  user
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Middlewares de Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureAuthenticated', () => {
    // Teste 1: Verifica se o usuário autenticado consegue passar pelo middleware (Igor Ryan)
    it('deve chamar next() quando autenticado', () => {
      const req = mockReq(true);
      const res = mockRes();
      const next = jest.fn();

      ensureAuthenticated(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    // Teste 2: Verifica se o acesso é bloqueado (401) para usuário não autenticado (Igor Ryan)
    it('deve retornar 401 quando nao autenticado', () => {
      const req = mockReq(false);
      const res = mockRes();
      const next = jest.fn();

      ensureAuthenticated(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado." });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkRole', () => {
    // Teste 3: Verifica se o middleware permite o acesso para o cargo correto (Admin = tipo 2) (Igor Ryan)
    it('deve chamar next() quando tipo e admin', () => {
      const req = mockReq(true, { tipo: 2 });
      const res = mockRes();
      const next = jest.fn();

      const middleware = checkRole(2);
      middleware(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    // Teste 4: Verifica se o middleware bloqueia (403) quando o cargo não tem permissão (Igor Ryan)
    it('deve retornar 403 quando tipo e vereador', () => {
      const req = mockReq(true, { tipo: 1 });
      const res = mockRes();
      const next = jest.fn();

      const middleware = checkRole(2);
      middleware(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Acesso negado." });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
