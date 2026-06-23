import {
  validaEmail,
  validaCpf
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

});