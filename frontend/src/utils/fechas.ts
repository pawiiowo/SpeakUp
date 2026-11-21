// Etiqueta para agrupar el historial como en el prototipo: "Hoy", "Ayer" o la fecha.
// Recibe "ahora" como parámetro para poder probarla con fechas fijas.
export function etiquetaDeFecha(fechaIso: string, ahora: Date = new Date()): string {
  const fecha = new Date(fechaIso);
  const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicioDelDia(ahora) - inicioDelDia(fecha)) / 86_400_000);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
}
