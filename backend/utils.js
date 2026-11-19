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

module.exports = { generarCodigo, validarMateria };