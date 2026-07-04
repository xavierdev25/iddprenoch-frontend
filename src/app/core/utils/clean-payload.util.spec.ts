import { stripEmptyStrings } from './clean-payload.util';

describe('stripEmptyStrings', () => {
  it('convierte campos en \'\' a undefined', () => {
    const result = stripEmptyStrings({ correo: '', foto: '', nombre: 'Ana' });
    expect(result).toEqual({ correo: undefined, foto: undefined, nombre: 'Ana' });
  });

  it('no toca valores no vacíos ni otros tipos (number, undefined, null)', () => {
    const result = stripEmptyStrings({ nombre: 'Ana', iglesiaId: 3, ministerioId: undefined, foto: null as unknown as string });
    expect(result).toEqual({ nombre: 'Ana', iglesiaId: 3, ministerioId: undefined, foto: null });
  });

  it('no muta el objeto original', () => {
    const original = { correo: '' };
    stripEmptyStrings(original);
    expect(original.correo).toBe('');
  });
});
