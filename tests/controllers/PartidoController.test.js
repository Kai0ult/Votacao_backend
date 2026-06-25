import { jest } from "@jest/globals";
// execução 2
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

  describe("editar", () => {
    it("deve atualizar partido quando sigla é nova e não existe", async () => {
      // Arrange
      // Simula os dados enviados para edição
      const req = mockReq(
        {
          nome: "Partido Atualizado",
          sigla: "PAT",
        },
        {
          id: 1,
        },
      );

      const res = mockRes();

      // Simula um partido já existente no banco
      const partido = {
        id: 1,
        nome: "Partido Antigo",
        sigla: "PA",
        update: jest.fn().mockResolvedValue(),
      };

      // Simula que o partido foi encontrado
      mockFindByPk.mockResolvedValue(partido);

      // Simula que não existe outro partido usando a nova sigla
      mockFindOne.mockResolvedValue(null);

      // Act
      await PartidoController.editar(req, res);

      // Assert

      // Verifica se buscou o partido pelo ID
      expect(mockFindByPk).toHaveBeenCalledWith(1);

      // Verifica se pesquisou a nova sigla
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { sigla: "PAT" },
      });

      // Verifica se executou a atualização
      expect(partido.update).toHaveBeenCalledWith({
        nome: "Partido Atualizado",
        sigla: "PAT",
      });

      // Verifica resposta de sucesso
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        mensagem: "Partido atualizado com sucesso!",
        partido,
      });
    });
  });

  it("deve rejeitar sigla já cadastrada em outro partido", async () => {
    // Arrange
    const req = mockReq(
      {
        nome: "Partido Atualizado",
        sigla: "PT",
      },
      {
        id: 1,
      },
    );

    const res = mockRes();

    // Partido atual encontrado
    const partido = {
      id: 1,
      nome: "Partido Atual",
      sigla: "PAT",
    };

    // Outro partido utilizando a sigla informada
    const partidoExistente = {
      id: 2,
      sigla: "PT",
    };

    mockFindByPk.mockResolvedValue(partido);

    mockFindOne.mockResolvedValue(partidoExistente);

    // Act
    await PartidoController.editar(req, res);

    // Assert

    // Verifica se o controller encontrou o partido
    expect(mockFindByPk).toHaveBeenCalledWith(1);

    // Verifica se procurou outra ocorrência da sigla
    expect(mockFindOne).toHaveBeenCalledWith({
      where: { sigla: "PT" },
    });

    // Deve retornar erro de conflito
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      mensagem: "Sigla já cadastrada em outro partido!",
    });
  });
}); //aaaa
