const express = require('express');
const pool = require('../../db');
const { verificarToken, exigirRol } = require('../../authMiddleware');

// Rutas del alumno para "Mis clases" y su historial (F08). Se monta en index.js bajo /api/alumno.
const router = express.Router();

// Todas las rutas de este archivo son solo para alumnos con sesión iniciada.
router.use(verificarToken, exigirRol('alumno'));

// Clases a las que el alumno se unió. Las que están en curso van primero.
router.get('/clases', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT c.id, c.materia, c.activa,
              (SELECT MAX(s.fecha_inicio) FROM sesiones s WHERE s.clase_id = c.id) AS ultima_sesion
       FROM inscripciones i
       JOIN clases c ON c.id = i.clase_id
       WHERE i.alumno_id = $1
       ORDER BY c.activa DESC, ultima_sesion DESC NULLS LAST, i.fecha_union DESC`,
      [req.usuario.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus clases.' });
  }
});

const LIMITE_MAXIMO = 50;

// Historial de sesiones de una clase, de la más reciente a la más antigua, por páginas.
// Solo incluye las sesiones desde que el alumno se unió, pero conserva su número dentro de la clase.
router.get('/clases/:id/sesiones', async (req, res) => {
  const claseId = Number(req.params.id);
  const pagina = req.query.pagina === undefined ? 1 : Number(req.query.pagina);
  const limite = req.query.limite === undefined ? 10 : Number(req.query.limite);
  const valido = (n, min, max = Infinity) => Number.isInteger(n) && n >= min && n <= max;
  if (!valido(claseId, 1) || !valido(pagina, 1) || !valido(limite, 1, LIMITE_MAXIMO)) {
    return res.status(400).json({ error: 'Parámetros inválidos.' });
  }

  try {
    const inscripcion = await pool.query(
      'SELECT fecha_union FROM inscripciones WHERE alumno_id = $1 AND clase_id = $2',
      [req.usuario.id, claseId]
    );
    if (inscripcion.rows.length === 0) {
      return res.status(404).json({ error: 'No encontramos esa clase.' });
    }

    // Se pide un registro de más para saber si hay otra página (hay_mas) sin contar todo.
    const resultado = await pool.query(
      `SELECT id, numero, fecha_inicio, fecha_fin, en_curso, participaciones
       FROM (
         SELECT s.id, s.fecha_inicio, s.fecha_fin, (s.fecha_fin IS NULL) AS en_curso,
                ROW_NUMBER() OVER (ORDER BY s.fecha_inicio, s.id)::int AS numero,
                (SELECT COUNT(*)::int FROM turnos t
                 WHERE t.sesion_id = s.id AND t.alumno_id = $2 AND t.estado IN ('hablando', 'atendido')) AS participaciones
         FROM sesiones s
         WHERE s.clase_id = $1
       ) todas
       WHERE fecha_fin IS NULL OR fecha_fin >= $3
       ORDER BY fecha_inicio DESC, id DESC
       LIMIT $4 OFFSET $5`,
      [claseId, req.usuario.id, inscripcion.rows[0].fecha_union, limite + 1, (pagina - 1) * limite]
    );

    res.json({ sesiones: resultado.rows.slice(0, limite), hay_mas: resultado.rows.length > limite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
});

module.exports = router;
