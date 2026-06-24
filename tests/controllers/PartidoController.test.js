import { jest } from "@jest/globals";

// Mocks
const mockFindOne = jest.fn();
const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule("../../models/index.js", () => ({
  default: {
    Partido: {
      findOne: mockFindOne,
      findAll: mockFindAll,
      findByPk: mockFindByPk,
      create: mockCreate,
    },
  },
}));

jest.unstable_mockModule("../../utils/partidoUtils.js", () => ({
  importarPartidosEmMassa: jest.fn(),
}));

const { default: PartidoController } =
  await import("../../controllers/PartidoController.js");

const mockReq = (body = {}, params = {}) => ({
  body,
  params,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("PartidoController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("cadastrar", () => {
    it("deve criar partido quando sigla não existe", async () => {
      // Arrange
      const req = mockReq({
        nome: "Partido Teste",
        sigla: "PTT",
      });

      const res = mockRes();

      const partidoCriado = {
        id: 1,
        nome: "Partido Teste",
        sigla: "PTT",
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(partidoCriado);

      // Act
      await PartidoController.cadastrar(req, res);

      // Assert
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { sigla: "PTT" },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        nome: "Partido Teste",
        sigla: "PTT",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: "Partido cadastrado com sucesso!",
        partido: partidoCriado,
      });
    });

    it("deve retornar 400 quando sigla já existe", async () => {
      // Arrange
      const req = mockReq({
        nome: "Partido Teste",
        sigla: "PT",
      });

      const res = mockRes();

      mockFindOne.mockResolvedValue({
        id: 1,
        sigla: "PT",
      });

      // Act
      await PartidoController.cadastrar(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        mensagem: "Partido já cadastrado!",
      });

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("listar", () => {
    it("deve retornar array de partidos", async () => {
      // Arrange
      const req = mockReq();
      const res = mockRes();

      const partidos = [
        { id: 1, sigla: "PT" },
        { id: 2, sigla: "MDB" },
      ];

      mockFindAll.mockResolvedValue(partidos);

      // Act
      await PartidoController.listar(req, res);

      // Assert
      expect(mockFindAll).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(partidos);
    });
  });

  describe("excluir", () => {
    it("deve retornar 404 quando partido não existe", async () => {
      // Arrange
      const req = mockReq({}, { id: 99 });
      const res = mockRes();

      mockFindByPk.mockResolvedValue(null);

      // Act
      await PartidoController.excluir(req, res);

      // Assert
      expect(mockFindByPk).toHaveBeenCalledWith(99);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith({
        mensagem: "Partido não encontrado!",
      });
    });
  });
});
