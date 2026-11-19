// Pruebas unitarias de backend/utils.js con el corredor de pruebas que trae Node.
// Ejecutar desde la carpeta backend con: npm test
const test = require('node:test');
const assert = require('node:assert');
const { generarCodigo, validarMateria, conCodigoUnico } = require('../utils');

// Simula el error que lanza PostgreSQL cuando el código de clase ya existe.
const errorCodigoRepetido = () =>
  Object.assign(new Error('código repetido'), { code: '23505', constraint: 'clases_codigo_key' });

test('generarCodigo devuelve 6 caracteres de A-Z y 0-9', () => {
  assert.match(generarCodigo(), /^[A-Z0-9]{6}$/);
});

test('validarMateria recorta los espacios', () => {
  assert.deepStrictEqual(validarMateria('  Aplicaciones Móviles  '), { valor: 'Aplicaciones Móviles' });
});

test('validarMateria rechaza vacío, solo espacios y valores que no son texto', () => {
  for (const materia of ['', '   ', undefined, null, 123]) {
    assert.ok(validarMateria(materia).error, `debió rechazar ${JSON.stringify(materia)}`);
  }
});

test('validarMateria acepta 100 caracteres y rechaza 101', () => {
  assert.strictEqual(validarMateria('x'.repeat(100)).valor.length, 100);
  assert.ok(validarMateria('x'.repeat(101)).error);
});

test('conCodigoUnico reintenta cuando el código ya existe', async () => {
  let intentos = 0;
  const resultado = await conCodigoUnico(async (codigo) => {
    intentos++;
    if (intentos < 3) throw errorCodigoRepetido();
    return codigo;
  });
  assert.strictEqual(intentos, 3);
  assert.match(resultado, /^[A-Z0-9]{6}$/);
});

test('conCodigoUnico se rinde después de 5 intentos', async () => {
  let intentos = 0;
  await assert.rejects(conCodigoUnico(async () => {
    intentos++;
    throw errorCodigoRepetido();
  }));
  assert.strictEqual(intentos, 5);
});

test('conCodigoUnico no reintenta otros errores', async () => {
  let intentos = 0;
  await assert.rejects(conCodigoUnico(async () => {
    intentos++;
    throw new Error('servidor caído');
  }), /servidor caído/);
  assert.strictEqual(intentos, 1);
});
