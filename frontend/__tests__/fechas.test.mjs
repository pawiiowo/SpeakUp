// Pruebas unitarias de etiquetaDeFecha (src/utils/fechas.ts), que agrupa el historial.
// Se le pasa "ahora" fijo para que el resultado no dependa del día en que se corre la prueba.
import test from 'node:test';
import assert from 'node:assert';
import { etiquetaDeFecha } from '../src/utils/fechas.ts';

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
