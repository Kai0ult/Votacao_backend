import {
  validaEmail,
  validaCpf,
  validaSenha
} from '../../utils/validators.js';

describe('validators.js', () => {

  describe('validaEmail', () => {

    test('deve retornar eValido true para email válido', () => {
      const resultado = validaEmail('teste@gmail.com');

      expect(resultado).toEqual({
        eValido: true,
        erros: []
      });
    });

    test('deve retornar eValido false para email sem @', () => {
      const resultado = validaEmail('testegmail.com');

      expect(resultado.eValido).toBe(false);
      expect(resultado.erros).toContain(
        'Formato de e-mail inválido.'
      );
    });

  });

  describe('validaCpf', () => {

    test('deve retornar eValido true para CPF válido', () => {
      const resultado = validaCpf('52998224725');

      expect(resultado).toEqual({
        eValido: true,
        erros: []
      });
    });

    test('deve retornar eValido false para CPF repetido', () => {
      const resultado = validaCpf('11111111111');

      expect(resultado.eValido).toBe(false);
      expect(resultado.erros).toContain(
        'CPF inválido.'
      );
    });

  });

  describe('validaSenha', () => {

    test('deve aceitar senha que atende todos os requisitos', () => {

        // Arrange
        const senha = 'Senha@123';

        // Act
        const resultado = validaSenha(senha);

        // Assert
        expect(resultado).toEqual({
        eValido: true,
        erros: []
        });

    });

    test('deve retornar múltiplos erros para senha que falha em tudo', () => {

        // Arrange
        const senha = 'abc';

        // Act
        const resultado = validaSenha(senha);

        // Assert
        expect(resultado.eValido).toBe(false);

        expect(resultado.erros).toContain(
        'A senha deve ter no mínimo 8 caracteres.'
        );

        expect(resultado.erros).toContain(
        'A senha deve conter pelo menos uma letra maiúscula.'
        );

        expect(resultado.erros).toContain(
        'A senha deve conter pelo menos um caractere especial.'
        );

    });

    });

});