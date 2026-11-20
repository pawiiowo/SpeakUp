const pool = require('../../db');

// Busca la clase de req.params.id y la deja en req.clase.
// id no numérico -> 400, la clase no existe -> 404. No revisa quién es el dueño.
async function cargarClase(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id de la clase no es válido.' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM clases WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'La clase ya no existe.' });
    }
    req.clase = resultado.rows[0];
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar la clase.' });
  }
}

// Igual que cargarClase, pero además revisa que la clase sea del docente que hace la petición.
// Usar después de verificarToken y exigirRol('profesor').
function cargarClasePropia(req, res, next) {
  cargarClase(req, res, () => {
    if (req.clase.profesor_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permiso sobre esta clase.' });
    }
    next();
  });
}

module.exports = { cargarClase, cargarClasePropia };
