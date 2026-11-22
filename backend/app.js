const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verificarToken } = require('./authMiddleware');
const { validarRegistro } = require('./utils');
const clasesRoutes = require('./src/routes/clases');
const filaRoutes = require('./src/routes/fila');
const alumnoRoutes = require('./src/routes/alumno');

// La aplicación Express con todas sus rutas. No abre ningún puerto: eso lo hace index.js.
// Así las pruebas de integración pueden cargar la app y levantarla en un puerto libre.
const app = express();

// No anuncia que el servidor usa Express (encabezado X-Powered-By): es información que solo le sirve a un atacante.
app.disable('x-powered-by');

// CORS solo aplica a navegadores: la app del teléfono no lo usa. Se permite únicamente el origen de la versión
// web de Expo (con la que se prueba el rol docente en la laptop), no cualquier página.
// Para agregar otros orígenes, sepáralos con comas en CORS_ORIGINS dentro del .env.
const origenesPermitidos = (process.env.CORS_ORIGINS || 'http://localhost:8081')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

app.use('/api/clases', clasesRoutes);
app.use('/api/clases/:id', filaRoutes);
app.use('/api/alumno', alumnoRoutes);

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
  // D11: correo institucional en minúsculas y demás reglas del registro.
  const { valor, error } = validarRegistro(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { nombre, email, password, rol } = valor;

  try {
    // LOWER también encuentra cuentas viejas guardadas con mayúsculas.
    const existeUsuario = await pool.query('SELECT 1 FROM usuarios WHERE LOWER(email) = $1', [email]);
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
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Por favor ingresa correo y contraseña' });
  }

  try {
    // El correo se compara en minúsculas (D11), así "Pau@uabc.edu.mx" y "pau@uabc.edu.mx" son la misma cuenta.
    const resultado = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [
      email.trim().toLowerCase(),
    ]);
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
      process.env.JWT_SECRET,
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

module.exports = app;
