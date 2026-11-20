const express = require('express');
const pool = require('../../db');
const { verificarToken, exigirRol } = require('../../authMiddleware');
const { validarMateria, conCodigoUnico } = require('../../utils');
const { cargarClasePropia } = require('../middleware/clases');

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

// El alumno busca una clase abierta por su código. Solo recibe los datos públicos de la clase.
router.post('/unirse', verificarToken, exigirRol('alumno'), async (req, res) => {
  const codigo = req.body?.codigo;
  if (typeof codigo !== 'string' || codigo.trim().length === 0) {
    return res.status(400).json({ error: 'Escribe el código de la clase.' });
  }

  try {
    const resultado = await pool.query(
      'SELECT id, materia, codigo FROM clases WHERE codigo = $1 AND activa = true',
      [codigo.trim().toUpperCase()]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'No hay una clase abierta con ese código.' });
    }

    res.json({ mensaje: 'Te uniste a la clase', clase: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al unirse a la clase.' });
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

// Cambia la materia de una clase del docente. El código no se edita.
router.put('/:id', verificarToken, exigirRol('profesor'), cargarClasePropia, async (req, res) => {
  const { valor: materia, error } = validarMateria(req.body?.materia);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const resultado = await pool.query(
      'UPDATE clases SET materia = $1 WHERE id = $2 RETURNING *',
      [materia, req.clase.id]
    );
    res.json({ mensaje: 'Clase actualizada', clase: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la clase.' });
  }
});

// Cierra una clase abierta y cancela sus turnos activos.
// Las dos actualizaciones van en una transacción: o se hacen las dos, o ninguna.
router.patch('/:id/cerrar', verificarToken, exigirRol('profesor'), cargarClasePropia, async (req, res) => {
  if (!req.clase.activa) {
    return res.status(409).json({ error: 'La clase ya está cerrada.' });
  }

  let cliente;
  try {
    cliente = await pool.connect();
    await cliente.query('BEGIN');
    const resultado = await cliente.query(
      'UPDATE clases SET activa = false WHERE id = $1 RETURNING *',
      [req.clase.id]
    );
    await cliente.query(
      `UPDATE turnos SET estado = 'cancelado', fecha_fin = NOW()
       WHERE clase_id = $1 AND estado IN ('en_espera', 'hablando')`,
      [req.clase.id]
    );
    await cliente.query('COMMIT');
    res.json({ mensaje: 'Clase cerrada', clase: resultado.rows[0] });
  } catch (error) {
    if (cliente) await cliente.query('ROLLBACK').catch(() => {});
    console.error(error);
    res.status(500).json({ error: 'Error al cerrar la clase.' });
  } finally {
    cliente?.release();
  }
});

// Reabre una clase cerrada con un código nuevo, para que el código de la sesión anterior
// ya no sirva. La fila empieza vacía porque al cerrar se cancelaron sus turnos.
router.patch('/:id/abrir', verificarToken, exigirRol('profesor'), cargarClasePropia, async (req, res) => {
  if (req.clase.activa) {
    return res.status(409).json({ error: 'La clase ya está abierta.' });
  }

  try {
    const clase = await conCodigoUnico(async (codigo) => {
      const resultado = await pool.query(
        'UPDATE clases SET codigo = $1, activa = true, fila_pausada = false WHERE id = $2 RETURNING *',
        [codigo, req.clase.id]
      );
      return resultado.rows[0];
    });
    res.json({ mensaje: 'Clase reabierta', clase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al reabrir la clase.' });
  }
});

// Elimina una clase cerrada. Sus turnos se borran solos por ON DELETE CASCADE.
router.delete('/:id', verificarToken, exigirRol('profesor'), cargarClasePropia, async (req, res) => {
  if (req.clase.activa) {
    return res.status(409).json({ error: 'Cierra la clase antes de eliminarla.' });
  }

  try {
    await pool.query('DELETE FROM clases WHERE id = $1', [req.clase.id]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la clase.' });
  }
});

module.exports = router;
