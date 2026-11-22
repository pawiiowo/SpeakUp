// Pruebas unitarias de etiquetaDeFecha (src/utils/fechas.ts), que agrupa el historial.
// Se le pasa "ahora" fijo para que el resultado no dependa del día en que se corre la prueba.
import test from 'node:test';
import assert from 'node:assert';
import { etiquetaDeFecha, horarioDeSesion } from '../src/utils/fechas.ts';

const ahora = new Date(2026, 10, 21, 18, 0); // 21 de noviembre de 2026, 6 PM

test('etiquetaDeFecha dice "Hoy" para una sesión del mismo día', () => {
  assert.strictEqual(etiquetaDeFecha(new Date(2026, 10, 21, 8, 0).toISOString(), ahora), 'Hoy');
});

test('etiquetaDeFecha dice "Ayer" aunque hayan pasado menos de 24 horas', () => {
  assert.strictEqual(etiquetaDeFecha(new Date(2026, 10, 20, 23, 30).toISOString(), ahora), 'Ayer');
});

test('etiquetaDeFecha muestra la fecha para sesiones más viejas', () => {
  const etiqueta = etiquetaDeFecha(new Date(2026, 10, 18, 10, 0).toISOString(), ahora);
  assert.match(etiqueta, /18/);
  assert.match(etiqueta, /noviembre/);
});

test('horarioDeSesion muestra el día con mayúscula y abajo la hora de inicio y fin', () => {
  const texto = horarioDeSesion(new Date(2026, 10, 20, 10, 5).toISOString(), new Date(2026, 10, 20, 11, 30).toISOString());
  assert.match(texto, /^Viernes/);
  assert.match(texto, /20 de noviembre/);
  assert.match(texto, /noviembre\n10:05.* a .*11:30/);
});

test('horarioDeSesion dice "Desde" si la sesión no ha terminado', () => {
  const texto = horarioDeSesion(new Date(2026, 10, 21, 9, 0).toISOString(), null);
  assert.match(texto, /\nDesde 9:00/);
});
