import { importarPartidosEmMassa } from '../../utils/partidoUtils.js';

describe('partidoUtils.js', () => {

  test('deve lançar erro para lista vazia', async () => {

    // Arrange
    const lista = [];

    // Act + Assert
    await expect(
      importarPartidosEmMassa(lista)
    ).rejects.toThrow(
      'A lista de partidos deve ser um array não vazio.'
    );

  });

  test('deve lançar erro para entradas sem nome ou sigla', async () => {

    // Arrange
    const lista = [
      { nome: 'Partido Teste' },
      { sigla: 'PT' },
      {}
    ];

    // Act + Assert
    await expect(
      importarPartidosEmMassa(lista)
    ).rejects.toThrow(
      'Nenhum partido válido encontrado na lista.'
    );

  });

});