const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 

const generateClassCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

router.post('/create', async (req, res) => {
  try {
    const { materia, profesor_id } = req.body;

    if (!materia) {
      return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
    }

    const codigo = generateClassCode();

    const queryText = `
      INSERT INTO clases (materia, profesor_id, codigo, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [materia, profesor_id || null, codigo, 'activa'];

    const result = await pool.query(queryText, values);

    return res.status(201).json({
      message: 'Clase creada exitosamente',
      clase: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear clase:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;