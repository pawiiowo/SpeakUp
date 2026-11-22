# F08 (reducida) — Mis clases e historial del alumno (spec corta)

## Objetivo
El alumno ve las clases a las que se ha unido, con la clase en curso hasta arriba, y dentro de cada una
el historial de sesiones con cuántas participaciones tuvo en cada una (prototipo de Figma, pantallas
"Materias", "Lista de sesiones" y "Participaciones sesión").

## Datos nuevos (02-data-model)
- `sesiones`: una fila cada vez que el docente inicia la clase (`clase_id`, `codigo`, `fecha_inicio`,
  `fecha_fin`). Solo puede haber una sesión abierta por clase.
- `inscripciones`: qué alumno se unió a qué clase (`alumno_id`, `clase_id`, `fecha_union`).
- `turnos.sesion_id`: la sesión en la que se pidió el turno.

## Cambios a lo que ya existe
- Iniciar clase (`PATCH /api/clases/:id/abrir`) también crea la sesión, en la misma transacción.
- Terminar clase (`PATCH /api/clases/:id/cerrar`) también cierra la sesión.
- Pedir la palabra guarda el turno en la sesión abierta.
- Unirse registra la inscripción y **la sesión de hoy a la que entró** (`inscripciones.sesion_id`).
- **Entrada de cada clase (D32):** para ver la fila o pedir la palabra en una clase en curso, el alumno debe
  haber entrado a la sesión de hoy con el QR o el código. Si no, responde 403 con `codigo: 'SIN_ENTRADA'`.

## Endpoints nuevos (solo alumnos)
| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | /api/alumno/clases | `[{ id, materia, activa, ultima_sesion, entrada_hoy }]`, las clases en curso primero |
| GET | /api/alumno/clases/:id/sesiones?pagina=1&limite=10 | `{ sesiones: [{ id, numero, fecha_inicio, fecha_fin, en_curso, participaciones }], hay_mas }`, las más recientes primero |

`participaciones` cuenta los turnos del alumno en esa sesión que llegaron a tener la palabra
(`hablando` o `atendido`). `numero` es el número de la sesión dentro de la clase (Sesión 1, 2, 3…).

## Pantallas
- Tab **Mis clases** del alumno (junto a Unirse y Perfil): FlatList con "● En curso" arriba. Al tocar la
  clase en curso: si ya entró hoy, va a su fila; si no, va a Unirse con el aviso "Para entrar a <materia>
  escanea el QR o escribe el código de hoy". Al tocar otra, a su historial.
- **Historial de la clase**: FlatList **paginada** (carga 10 y pide más al llegar al final), agrupada por
  fecha (Hoy, Ayer, fecha). Las sesiones en las que el alumno participó llevan un punto terracota y, al
  tocarlas, abren un modal con el día en una línea y el horario abajo (por ejemplo, "Viernes, 20 de noviembre"
  y "10:05 a.m. a 11:30 a.m.") y "En esta sesión realizaste N participaciones". Las sesiones sin participaciones
  se ven en gris con un punto gris y no se pueden tocar (D33). Una leyenda arriba de la lista explica los
  dos puntos: "● Participaste" y "● Sin participaciones".

## Casos de error
| Situación | Respuesta | Qué ve el alumno |
|-----------|-----------|------------------|
| Pide el historial de una clase a la que no se unió | 404 | "No encontramos esa clase" |
| `pagina` o `limite` inválidos | 400 | — (la app siempre manda valores válidos) |
| Un docente usa estas rutas | 403 | — |
| Aún no se ha unido a ninguna clase | 200 con lista vacía | "Aún no te has unido a ninguna clase" + botón "Unirme" |
| Sin internet | — | Aviso, sin borrar la última lista |

## Criterios de aceptación
- [x] Después de unirse a una clase, aparece en "Mis clases" del alumno.
- [x] La clase en curso aparece primero, con "● En curso".
- [ ] El modal de una sesión muestra su día y su horario de inicio y fin.
- [x] Cada vez que el docente inicia la clase se crea una sesión nueva en el historial.
- [x] El historial carga de 10 en 10 al llegar al final de la lista.
- [x] Una sesión muestra cuántas veces el alumno tuvo la palabra.
- [x] Una sesión sin participaciones aparece en gris, con punto gris, y no se puede tocar.
- [x] Un alumno no puede ver el historial de una clase a la que no se unió.
- [x] Un alumno inscrito no puede pedir la palabra en una clase nueva sin entrar con el QR o el código de hoy.
- [x] Después de entrar hoy, puede volver a la fila desde "Mis clases" sin escribir el código otra vez.

## Tasks
- [x] H01 — Agregar esta spec.
- [x] H02 — Tablas `sesiones` e `inscripciones` y `turnos.sesion_id`.
- [x] H03 — Iniciar y terminar clase abren y cierran la sesión.
- [x] H04 — Pedir la palabra guarda la sesión; unirse registra la inscripción.
- [x] H05 — Endpoints del alumno (mis clases e historial paginado).
- [x] H06 — Tab "Mis clases" del alumno.
- [x] H07 — Historial paginado con el modal de participaciones.

## Fuera de alcance
- Asistencia: el historial muestra participación, no si el alumno asistió (D33).
