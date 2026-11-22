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

// Día y horario de una sesión para el modal del historial, por ejemplo
// "Viernes, 20 de noviembre · 10:05 a.m. a 11:30 a.m.". Si la sesión no ha terminado, solo dice desde qué hora.
export function horarioDeSesion(inicioIso: string, finIso: string | null): string {
  const inicio = new Date(inicioIso);
  const dia = inicio.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const hora = (fecha: Date) => fecha.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  const diaConMayuscula = dia.charAt(0).toUpperCase() + dia.slice(1);
  return finIso
    ? `${diaConMayuscula} · ${hora(inicio)} a ${hora(new Date(finIso))}`
    : `${diaConMayuscula} · desde ${hora(inicio)}`;
}
