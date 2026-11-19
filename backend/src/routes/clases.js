const express = require('express');
const pool = require('../../db');
const { verificarToken } = require('../../authMiddleware');
const { generarCodigo } = require('../../utils');

// Todas las rutas de clases. Se monta en index.js bajo /api/clases.
const router = express.Router();

router.post('/crear', verificarToken, async (req, res) => {
  const { materia } = req.body;

  if (req.usuario.rol !== 'profesor') {
    return res.status(403).json({ error: 'Solo los profesores pueden crear clases.' });
  }

  if (!materia) {
    return res.status(400).json({ error: 'El nombre de la materia es obligatorio.' });
  }

  try {
    const codigo = generarCodigo();
    const nuevaClase = await pool.query(
      'INSERT INTO clases (codigo, materia, profesor_id) VALUES ($1, $2, $3) RETURNING *',
      [codigo, materia, req.usuario.id]
    );

    res.status(201).json({
      mensaje: 'Clase creada exitosamente',
      clase: nuevaClase.rows[0]
    });
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

router.get('/', verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol === 'profesor') {
      const clases = await pool.query(
        'SELECT * FROM clases WHERE profesor_id = $1 ORDER BY fecha_creacion DESC',
        [req.usuario.id]
      );
      return res.json(clases.rows);
    } else {
      const clases = await pool.query(
        'SELECT * FROM clases WHERE activa = true ORDER BY fecha_creacion DESC'
      );
      return res.json(clases.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las clases' });
  }
});

module.exports = router;
