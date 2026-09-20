// Evalúa la fortaleza de una contraseña como 'debil' | 'intermedia' | 'fuerte'.
// Criterios evaluados (cada uno suma puntos):
//   - longitud >= 8
//   - longitud >= 12
//   - contiene mayúscula
//   - contiene minúscula
//   - contiene número
//   - contiene símbolo especial
export type FortalezaClave = 'debil' | 'intermedia' | 'fuerte';

export function evaluarFortalezaClave(clave: string): FortalezaClave {
  let puntos = 0;

  if (clave.length >= 8) puntos++;
  if (clave.length >= 12) puntos++;
  if (/[A-Z]/.test(clave)) puntos++;
  if (/[a-z]/.test(clave)) puntos++;
  if (/[0-9]/.test(clave)) puntos++;
  if (/[^A-Za-z0-9]/.test(clave)) puntos++;

  if (puntos <= 2) return 'debil';
  if (puntos <= 4) return 'intermedia';
  return 'fuerte';
}