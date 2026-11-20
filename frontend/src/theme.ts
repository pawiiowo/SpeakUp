// Colores y medidas de la app, tomados del prototipo de Figma (specs/features/FE-frontend.md).
// Todas las pantallas usan estos valores para que el estilo sea el mismo en toda la app.
export const colores = {
  fondo: '#FAF6EE',
  superficie: '#EFEAE0',
  primario: '#D98A6C',
  texto: '#3A322D',
  textoSuave: '#7A7169',
  fila: '#473D35',
  activo: '#5DAE5A',
  peligro: '#A8322A',
  blanco: '#FFFFFF',
} as const;

export const espacio = { xs: 4, s: 8, m: 16, l: 24, xl: 32 } as const;

export const radio = { campo: 12, tarjeta: 20, boton: 999 } as const;
