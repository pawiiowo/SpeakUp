const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const verificarToken = require('./authMiddleware');
require('dotenv').config();
const { generarCodigo } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor de SpeakUp funcionando correctamente');
});

app.get('/api/test-db', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ mensaje: 'Conexión exitosa a la Base de Datos', hora: resultado.rows[0].now });
  } catch (error) {
    console.error('Error al conectar con la BD:', error);
    res.status(500).json({ error: 'Error al conectar con la base de datos', detalle: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existeUsuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptado = await bcrypt.hash(password, salt);

    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, passwordEncriptado, rol]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor ingresa correo y contraseña' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const usuario = resultado.rows[0];

    const passwordCorrecto = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecto) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_por_defecto',
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/auth/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos del perfil' });
  }
});

app.post('/api/clases/crear', verificarToken, async (req, res) => {
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

app.post('/api/clases/unirse', verificarToken, async (req, res) => {
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

app.get('/api/clases', verificarToken, async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});