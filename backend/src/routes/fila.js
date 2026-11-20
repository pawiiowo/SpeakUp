const express = require('express');
const pool = require('../../db');
const { verificarToken, exigirRol } = require('../../authMiddleware');
const { cargarClase, cargarClasePropia } = require('../middleware/clases');

// Rutas de la fila de una clase. Se monta en index.js bajo /api/clases/:id;
// mergeParams hace que req.params.id llegue hasta aquí.
const router = express.Router({ mergeParams: true });

// Filtros que se repiten: quién puede usar cada ruta.
const soloAlumno = [verificarToken, exigirRol('alumno'), cargarClase];
const soloDocente = [verificarToken, exigirRol('profesor'), cargarClasePropia];

// Estado de la fila visto por un alumno. Nunca incluye nombres ni ids de otros alumnos (D08).
// La posición se calcula numerando los turnos en espera por orden de llegada (D07).
async function estadoParaAlumno(clase, alumnoId) {
  const resultado = await pool.query(
    `WITH espera AS (
       SELECT alumno_id, ROW_NUMBER() OVER (ORDER BY fecha_solicitud, id) AS posicion
       FROM turnos WHERE clase_id = $1 AND estado = 'en_espera'
     )
     SELECT
       (SELECT estado FROM turnos
        WHERE clase_id = $1 AND alumno_id = $2 AND estado IN ('en_espera', 'hablando')) AS mi_estado,
       (SELECT posicion::int FROM espera WHERE alumno_id = $2) AS posicion,
       (SELECT COUNT(*)::int FROM espera) AS en_espera,
       EXISTS (SELECT 1 FROM turnos WHERE clase_id = $1 AND estado = 'hablando') AS alguien_hablando`,
    [clase.id, alumnoId]
  );
  const fila = resultado.rows[0];

  return {
    clase: { id: clase.id, materia: clase.materia, activa: clase.activa },
    mi_turno: fila.mi_estado ? { estado: fila.mi_estado, posicion: fila.posicion } : null,
    en_espera: fila.en_espera,
    alguien_hablando: fila.alguien_hablando,
  };
}

// El alumno consulta su lugar en la fila (la app lo pide cada 3 segundos, D22).
router.get('/fila/mia', soloAlumno, async (req, res) => {
  try {
    res.json(await estadoParaAlumno(req.clase, req.usuario.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la fila.' });
  }
});

module.exports = router;
