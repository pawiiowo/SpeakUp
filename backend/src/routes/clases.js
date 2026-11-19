const express = require('express');
const pool = require('../../db');
const { verificarToken, exigirRol } = require('../../authMiddleware');
const { validarMateria, conCodigoUnico } = require('../../utils');

// Todas las rutas de clases. Se monta en index.js bajo /api/clases.
const router = express.Router();

// Crea una clase del docente con un código único de 6 caracteres.
router.post('/', verificarToken, exigirRol('profesor'), async (req, res) => {
  const { valor: materia, error } = validarMateria(req.body?.materia);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const clase = await conCodigoUnico(async (codigo) => {
      const resultado = await pool.query(
        'INSERT INTO clases (codigo, materia, profesor_id) VALUES ($1, $2, $3) RETURNING *',
        [codigo, materia, req.usuario.id]
      );
      return resultado.rows[0];
    });

    res.status(201).json({ mensaje: 'Clase creada exitosamente', clase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la clase.' });
  }
});

router.post('/unirse', verificarToken, async (req, res) => {
  const { codigo } = req.body;

  if (req.usuario.rol !== 'alumno') {
    return res.status(403).json({ error: 'Solo los alumnos pueden unirse a clases' });
  }

  if (!codigo) {
    return res.status(400).json({ error: 'El código de la clase es obligatorio' });
  }

  try {
    const clase = await pool.query(
      'SELECT * FROM clases WHERE codigo = $1 AND activa = true',
      [codigo.toUpperCase()]
    );

    if (clase.rows.length === 0) {
      return res.status(404).json({ error: 'Clase no encontrada o inactiva' });
    }

    res.json({
      mensaje: 'Te has unido exitosamente a la clase',
      clase: clase.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al unirse a la clase' });
  }
});

// Lista las clases del docente, las más recientes primero.
router.get('/', verificarToken, exigirRol('profesor'), async (req, res) => {
  try {
    const clases = await pool.query(
      'SELECT * FROM clases WHERE profesor_id = $1 ORDER BY fecha_creacion DESC',
      [req.usuario.id]
    );
    res.json(clases.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las clases' });
  }
});

module.exports = router;
