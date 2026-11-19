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

module.exports = { generarCodigo, validarMateria, conCodigoUnico };