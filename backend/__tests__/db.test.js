// Prueba unitaria de cómo se leen las fechas de PostgreSQL (D37). No se conecta a la base:
// solo revisa la función que convierte el texto de una fecha en un Date de JavaScript.
const test = require('node:test');
const assert = require('node:assert');
const { types } = require('pg');
require('../db');

test('las fechas TIMESTAMP de la base se leen como UTC, sin importar la zona de la computadora', () => {
  const leer = types.getTypeParser(1114);
  assert.strictEqual(leer('2026-11-22 04:47:00').toISOString(), '2026-11-22T04:47:00.000Z');
  assert.strictEqual(leer('2026-11-22 04:47:00.123456').toISOString(), '2026-11-22T04:47:00.123Z');
});
