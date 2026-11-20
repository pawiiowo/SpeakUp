# F04–F06 — Fila de participación (spec corta)

## Objetivo
El alumno se une a una clase con su código, pide la palabra, ve su posición y puede salir de la fila.
El docente ve la fila con nombres y da la palabra al siguiente.

## Actores
Alumno (rol `alumno`) y docente (rol `profesor`).

## Endpoints (todos requieren token)
| Método | Ruta | Rol | Acción |
|--------|------|-----|--------|
| POST   | /api/clases/unirse              | alumno   | Busca una clase abierta por código y devuelve sus datos públicos |
| GET    | /api/clases/:id/fila/mia        | alumno   | Estado de la fila para el alumno (sin nombres) |
| POST   | /api/clases/:id/turnos          | alumno   | Pedir la palabra |
| DELETE | /api/clases/:id/turnos/mio      | alumno   | Salir de la fila |
| GET    | /api/clases/:id/fila            | profesor | Fila completa con nombres (solo el dueño de la clase) |
| POST   | /api/clases/:id/fila/siguiente  | profesor | El que habla pasa a `atendido` y el primero en espera recibe la palabra |

## Respuestas
- **Alumno** (`fila/mia`, pedir y salir): `{ clase: { id, materia, activa }, mi_turno: { estado, posicion } | null, en_espera, alguien_hablando }`.
  `posicion` solo existe si está `en_espera`. Nunca incluye nombres ni ids de otros alumnos (D08).
- **Docente** (`fila` y `siguiente`): `{ clase, hablando: { turno_id, nombre, fecha_inicio } | null, en_espera: [{ turno_id, nombre, posicion }] }`.
- **Unirse**: `{ mensaje, clase: { id, materia, codigo } }`.

## Reglas
- La posición se calcula: turnos `en_espera` de la clase con `fecha_solicitud` anterior o igual (D07).
- Un alumno tiene como máximo un turno activo por clase (D18).
- "Siguiente" hace dos cambios en una transacción: el turno `hablando` pasa a `atendido` y el primero
  `en_espera` pasa a `hablando`. Si nadie espera, solo termina el turno actual.
- Solo se puede salir de la fila estando `en_espera`.
- La app consulta la fila cada 3 segundos (D22).

## Casos de error
| Situación | Respuesta | Qué ve el usuario |
|-----------|-----------|-------------------|
| Código vacío o que no es texto | 400 | "Escribe el código de la clase" |
| Código de una clase cerrada o inexistente | 404 | "No hay una clase abierta con ese código" |
| Pedir la palabra con la clase cerrada | 409 | "La clase está cerrada" |
| Pedir la palabra con un turno activo | 409 | "Ya estás en la fila" |
| Salir sin estar en espera | 409 | "No estás esperando turno" |
| La clase no existe | 404 | "La clase ya no existe" |
| Un docente usa rutas de alumno, o al revés | 403 | — |
| La fila de otro docente | 403 | "No tienes permiso sobre esta clase" |
| "Siguiente" con la clase cerrada | 409 | "La clase está cerrada" |
| Token inválido o expirado | 401 | Vuelve a `Login` |
| Sin internet / servidor caído | — | "No se pudo conectar. Intenta de nuevo" |

## Criterios de aceptación
Backend verificado con 30 peticiones a una base de prueba (2026-11-20). Se marcan cuando la pantalla esté lista.
- [ ] Un alumno se une con el código (sin importar mayúsculas) y no puede unirse a una clase cerrada.
- [ ] Al pedir la palabra, el alumno ve su posición; si lo pide dos veces, responde 409.
- [ ] Con tres alumnos en espera, sus posiciones son 1, 2 y 3; si sale el 1, los otros pasan a 1 y 2.
- [ ] El docente ve los nombres en orden; ninguna respuesta de alumno contiene nombres.
- [ ] "Siguiente" da la palabra al primero y marca como atendido al que hablaba.
- [ ] Al cerrar la clase, los turnos activos quedan cancelados y el alumno ve la clase cerrada.

## Tasks (backend)
- [x] T01 — Agregar esta spec.
- [x] T02 — Mover `cargarClasePropia` a `src/middleware/clases.js` y agregar `cargarClase` (cualquier rol).
- [x] T03 — `unirse`: solo alumnos, valida el código y devuelve solo datos públicos de la clase.
- [x] T04 — `GET /:id/fila/mia` (estado del alumno).
- [x] T05 — `POST /:id/turnos` (pedir la palabra).
- [x] T06 — `DELETE /:id/turnos/mio` (salir de la fila).
- [x] T07 — `GET /:id/fila` (fila del docente con nombres).
- [x] T08 — `POST /:id/fila/siguiente` (dar la palabra al siguiente).
