// Validaciones de los formularios. Son funciones puras (sin pantallas ni red), así que se pueden
// probar con pruebas unitarias. Cada una devuelve un mensaje de error o null si todo está bien.

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string): string | null {
  if (email.trim().length === 0) return 'Escribe tu correo.';
  if (!PATRON_EMAIL.test(email.trim())) return 'El correo no tiene un formato válido.';
  return null;
}

export function validarPasswordLogin(password: string): string | null {
  return password.length === 0 ? 'Escribe tu contraseña.' : null;
}

export function validarNombre(nombre: string): string | null {
  const limpio = nombre.trim();
  if (limpio.length < 2) return 'Escribe tu nombre completo.';
  if (limpio.length > 100) return 'El nombre no puede tener más de 100 caracteres.';
  return null;
}

export function validarPasswordNueva(password: string): string | null {
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

export function validarConfirmacion(password: string, confirmacion: string): string | null {
  return password === confirmacion ? null : 'Las contraseñas no coinciden.';
}

export function validarMateria(materia: string): string | null {
  const limpia = materia.trim();
  if (limpia.length === 0) return 'Escribe el nombre de la materia.';
  if (limpia.length > 100) return 'El nombre no puede tener más de 100 caracteres.';
  return null;
}

export function validarCodigoClase(codigo: string): string | null {
  const limpio = codigo.trim();
  if (limpio.length === 0) return 'Escribe el código de la clase.';
  if (!/^[A-Za-z0-9]{6}$/.test(limpio)) return 'El código tiene 6 letras o números.';
  return null;
}
