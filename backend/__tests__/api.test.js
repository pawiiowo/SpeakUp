// Pruebas de integración: levantan la app de Express en un puerto libre y le hacen peticiones HTTP reales.
// Revisan que las capas trabajen juntas (rutas, middlewares de token y rol, validaciones y respuestas).
// Todas terminan antes de consultar la base de datos, así que no necesitan Supabase ni crean datos.
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

// Se fija la clave antes de cargar la app para poder firmar tokens de prueba.
process.env.JWT_SECRET = 'clave-de-prueba';
const app = require('../app');

let servidor;
let base;

test.before(async () => {
  servidor = app.listen(0); // 0 = el sistema elige un puerto libre
  await new Promise((listo) => servidor.once('listening', listo));
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});

test.after(() => servidor.close());

const token = (rol, opciones = { expiresIn: '1h' }) => jwt.sign({ id: 1, rol }, process.env.JWT_SECRET, opciones);

async function peticion(metodo, ruta, { cuerpo, tokenUsado } = {}) {
  const respuesta = await fetch(base + ruta, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(tokenUsado ? { Authorization: `Bearer ${tokenUsado}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  return { status: respuesta.status, datos: await respuesta.json() };
}

test('sin token responde 401', async () => {
  const { status } = await peticion('GET', '/clases');
  assert.strictEqual(status, 401);
});

test('con un token expirado responde 401 (la app cierra la sesión)', async () => {
  const expirado = jwt.sign({ id: 1, rol: 'profesor', exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET);
  const { status, datos } = await peticion('GET', '/clases', { tokenUsado: expirado });
  assert.strictEqual(status, 401);
  assert.match(datos.error, /expirado/);
});

test('un alumno no puede usar las rutas del docente (403)', async () => {
  const { status } = await peticion('GET', '/clases', { tokenUsado: token('alumno') });
  assert.strictEqual(status, 403);
});

test('el registro rechaza correos que no son @uabc.edu.mx (400, D11)', async () => {
  const { status, datos } = await peticion('POST', '/auth/register', {
    cuerpo: { nombre: 'Prueba', email: 'prueba@gmail.com', password: '123456', rol: 'alumno' },
  });
  assert.strictEqual(status, 400);
  assert.match(datos.error, /institucional/);
});

test('crear una clase sin materia responde 400', async () => {
  const { status } = await peticion('POST', '/clases', { cuerpo: { materia: '   ' }, tokenUsado: token('profesor') });
  assert.strictEqual(status, 400);
});

test('un id de clase que no es número responde 400', async () => {
  const { status } = await peticion('PUT', '/clases/abc', { cuerpo: { materia: 'Redes' }, tokenUsado: token('profesor') });
  assert.strictEqual(status, 400);
});

test('el historial rechaza un límite de página mayor a 50 (400)', async () => {
  const { status } = await peticion('GET', '/alumno/clases/1/sesiones?limite=100', { tokenUsado: token('alumno') });
  assert.strictEqual(status, 400);
});

test('CORS solo permite el origen de la versión web de Expo', async () => {
  const permitido = await fetch(`${base}/clases`, { headers: { Origin: 'http://localhost:8081' } });
  assert.strictEqual(permitido.headers.get('access-control-allow-origin'), 'http://localhost:8081');
  const otro = await fetch(`${base}/clases`, { headers: { Origin: 'https://pagina-ajena.com' } });
  assert.strictEqual(otro.headers.get('access-control-allow-origin'), null);
  assert.strictEqual(otro.headers.get('x-powered-by'), null);
});
