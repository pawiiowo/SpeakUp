// Pruebas unitarias de las validaciones de los formularios (src/utils/validaciones.ts).
// Ejecutar desde la carpeta frontend con: npm test
// Node 22.18 o más nuevo lee los archivos .ts directamente, sin compilarlos.
import test from 'node:test';
import assert from 'node:assert';
import {
  validarEmail,
  validarEmailInstitucional,
  validarPasswordLogin,
  validarNombre,
  validarPasswordNueva,
  validarConfirmacion,
  validarMateria,
  validarCodigoClase,
} from '../src/utils/validaciones.ts';

test('validarEmail pide el correo y revisa su formato', () => {
  assert.strictEqual(validarEmail(''), 'Escribe tu correo.');
  assert.ok(validarEmail('pau@uabc'));
  assert.ok(validarEmail('pau uabc.edu.mx'));
  assert.strictEqual(validarEmail(' pau@uabc.edu.mx '), null);
});

test('validarEmailInstitucional solo acepta @uabc.edu.mx, sin importar mayúsculas (D11)', () => {
  assert.strictEqual(validarEmailInstitucional('pau@gmail.com'), 'Usa tu correo institucional @uabc.edu.mx.');
  assert.strictEqual(validarEmailInstitucional('Pau@UABC.edu.mx'), null);
});

test('validarPasswordLogin solo pide que no esté vacía', () => {
  assert.strictEqual(validarPasswordLogin(''), 'Escribe tu contraseña.');
  assert.strictEqual(validarPasswordLogin('x'), null);
});

test('validarNombre pide de 2 a 100 caracteres', () => {
  assert.ok(validarNombre(' a '));
  assert.ok(validarNombre('a'.repeat(101)));
  assert.strictEqual(validarNombre('Paulina'), null);
});

test('validarPasswordNueva pide al menos 6 caracteres', () => {
  assert.ok(validarPasswordNueva('12345'));
  assert.strictEqual(validarPasswordNueva('123456'), null);
});

test('validarConfirmacion revisa que las contraseñas coincidan', () => {
  assert.strictEqual(validarConfirmacion('123456', '123457'), 'Las contraseñas no coinciden.');
  assert.strictEqual(validarConfirmacion('123456', '123456'), null);
});

test('validarMateria rechaza vacío y más de 100 caracteres', () => {
  assert.ok(validarMateria('   '));
  assert.ok(validarMateria('a'.repeat(101)));
  assert.strictEqual(validarMateria('a'.repeat(100)), null);
});

test('validarCodigoClase pide 6 letras o números', () => {
  assert.strictEqual(validarCodigoClase(''), 'Escribe el código de la clase.');
  assert.strictEqual(validarCodigoClase('ABC'), 'El código debe tener 6 letras o números.');
  assert.ok(validarCodigoClase('ABC-12'));
  assert.strictEqual(validarCodigoClase(' abc123 '), null);
});
