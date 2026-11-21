function generarCodigo() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

// Valida el nombre de la materia de una clase.
// Devuelve { valor } con el texto ya recortado, o { error } con el mensaje para el usuario.
function validarMateria(materia) {
  if (typeof materia !== 'string' || materia.trim().length === 0) {
    return { error: 'El nombre de la materia es obligatorio.' };
  }
  const valor = materia.trim();
  if (valor.length > 100) {
    return { error: 'El nombre de la materia no puede tener más de 100 caracteres.' };
  }
  return { valor };
}

const DOMINIO_INSTITUCIONAL = '@uabc.edu.mx';
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['alumno', 'profesor'];

// Valida los datos del registro (D11): correo institucional guardado en minúsculas,
// nombre de 2 a 100 caracteres, contraseña de al menos 6 y rol alumno o profesor.
// Son las mismas reglas que revisa la app, pero aquí no se pueden saltar.
// Devuelve { valor } con los datos ya limpios, o { error } con el mensaje para el usuario.
function validarRegistro(datos) {
  const { nombre, email, password, rol } = datos ?? {};
  const campos = [nombre, email, password, rol];
  if (campos.some((campo) => typeof campo !== 'string' || campo.trim().length === 0)) {
    return { error: 'Todos los campos son obligatorios.' };
  }
  const nombreLimpio = nombre.trim();
  if (nombreLimpio.length < 2 || nombreLimpio.length > 100) {
    return { error: 'El nombre debe tener de 2 a 100 caracteres.' };
  }
  const emailLimpio = email.trim().toLowerCase();
  if (!PATRON_EMAIL.test(emailLimpio) || !emailLimpio.endsWith(DOMINIO_INSTITUCIONAL) || emailLimpio.length > 100) {
    return { error: 'Usa tu correo institucional @uabc.edu.mx.' };
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (!ROLES.includes(rol)) {
    return { error: 'El rol no es válido.' };
  }
  return { valor: { nombre: nombreLimpio, email: emailLimpio, password, rol } };
}

const MAX_INTENTOS_CODIGO = 5;

// Ejecuta guardar(codigo) con un código nuevo. Si PostgreSQL lo rechaza porque el código
// ya existe (error 23505 en la restricción única de clases.codigo), lo intenta con otro,
// hasta MAX_INTENTOS_CODIGO veces. Cualquier otro error se lanza tal cual.
async function conCodigoUnico(guardar) {
  for (let intento = 1; intento <= MAX_INTENTOS_CODIGO; intento++) {
    try {
      return await guardar(generarCodigo());
    } catch (error) {
      const codigoRepetido = error.code === '23505' && error.constraint === 'clases_codigo_key';
      if (!codigoRepetido) throw error;
    }
  }
  throw new Error('No se pudo generar un código único para la clase.');
}

module.exports = { generarCodigo, validarMateria, validarRegistro, conCodigoUnico };