# F03 — Gestionar clases

## Objetivo
Permitir que el docente cree, consulte, edite, cierre, reabra y elimine sus clases, y que abra una
sesión donde se muestran el código y el QR para que los alumnos se unan.

## Actor
Docente (rol `profesor`).

## Precondiciones
- El docente inició sesión (token válido).

## Datos de entrada
| Acción   | Datos |
|----------|-------|
| Crear    | `materia` |
| Editar   | `materia` (el código no se edita) |
| Cerrar   | `id` de la clase |
| Reabrir  | `id` de la clase |
| Eliminar | `id` de la clase |

## Endpoints (todos requieren token de docente)
| Método | Ruta                       | Acción |
|--------|----------------------------|--------|
| POST   | /api/clases                | Crear clase (genera código único) |
| GET    | /api/clases                | Listar las clases del docente, más recientes primero |
| PUT    | /api/clases/:id            | Editar materia |
| PATCH  | /api/clases/:id/cerrar     | Cerrar clase (sus turnos activos pasan a `cancelado`) |
| PATCH  | /api/clases/:id/abrir      | Reabrir clase cerrada con un código nuevo; la fila empieza vacía |
| DELETE | /api/clases/:id            | Eliminar clase cerrada y sus turnos |

## Flujo principal
**Crear**
1. En `Classes`, el docente presiona "Nueva clase".
2. Se abre `ClassForm` vacío.
3. Escribe la materia y presiona "Guardar".
4. El sistema valida, genera el código y guarda la clase.
5. Regresa a `Classes` y la nueva clase aparece primero en la lista.

**Editar**
1. En `Classes`, el docente elige "Editar" en una clase.
2. Se abre `ClassForm` con la materia actual.
3. Cambia la materia y presiona "Guardar".
4. Regresa a `Classes` con el nombre actualizado.

**Abrir sesión**
1. En `Classes`, el docente toca una clase abierta.
2. Se abre `TeacherSession` con la materia, el código en grande y su QR.

**Cerrar**
1. En `TeacherSession` o en `Classes`, el docente presiona "Cerrar clase".
2. El sistema pide confirmación.
3. La clase queda cerrada y se marca así en la lista.

**Reabrir**
1. En `Classes`, el docente presiona "Reabrir" en una clase cerrada.
2. El sistema genera un código nuevo y la clase queda abierta.
3. Se abre `TeacherSession` con el código nuevo y su QR. La fila empieza vacía.

**Eliminar**
1. En una clase cerrada, el docente presiona "Eliminar".
2. El sistema pide confirmación indicando que se borrará también su historial de turnos.
3. La clase desaparece de la lista.

## Validaciones
- `materia` es obligatoria, se recortan los espacios y mide de 1 a 100 caracteres.
- El botón "Guardar" está deshabilitado mientras la materia esté vacía o se esté guardando.
- Solo el docente dueño de la clase puede editarla, cerrarla o eliminarla.
- Solo se puede eliminar una clase cerrada.
- Solo se puede cerrar una clase abierta.
- Solo se puede reabrir una clase cerrada. Al reabrir, `fila_pausada` vuelve a `false`.
- La materia se puede editar con la clase abierta o cerrada.
- El `id` de la ruta debe ser un número entero positivo.
- Al crear o reabrir, si el código generado ya existe, el backend genera otro (máximo 5 intentos).

## Respuestas del backend
| Acción                          | Éxito | Cuerpo |
|---------------------------------|-------|--------|
| Crear                           | 201   | `{ mensaje, clase }` |
| Listar                          | 200   | Arreglo de clases |
| Editar, cerrar, reabrir         | 200   | `{ mensaje, clase }` |
| Eliminar                        | 204   | Sin cuerpo |
| Cualquier error                 | 4xx/5xx | `{ error }` con el mensaje |

## Estados de pantalla — `Classes`
- **Cargando:** indicador mientras llega la lista.
- **Datos:** lista con materia, código, fecha y estado (abierta/cerrada).
- **Vacía:** "Aún no tienes clases" con botón "Crear mi primera clase".
- **Error:** mensaje con botón "Reintentar".

## Casos de error
| Situación                         | Respuesta del backend | Qué ve el docente |
|-----------------------------------|-----------------------|-------------------|
| Materia vacía o > 100 caracteres  | 400                   | Mensaje bajo el campo |
| Token ausente, inválido o expirado| 401                   | Se cierra la sesión y vuelve a `Login` |
| Un alumno llama a estos endpoints | 403                   | — |
| La clase no es suya               | 403                   | "No tienes permiso sobre esta clase" |
| `id` no numérico                  | 400                   | — (la app siempre envía ids válidos) |
| La clase no existe                | 404                   | "La clase ya no existe" y se recarga la lista |
| Eliminar una clase abierta        | 409                   | "Cierra la clase antes de eliminarla" |
| Cerrar una clase que ya está cerrada | 409                | "La clase ya está cerrada" |
| Reabrir una clase que ya está abierta | 409               | "La clase ya está abierta" |
| Sin internet / servidor caído     | —                     | "No se pudo conectar. Intenta de nuevo" |

## Resultado esperado
El docente administra sus clases desde la tab `Classes` y puede mostrar el código y el QR
de cualquier clase abierta para que los alumnos se unan.

## Diferencias con el código actual
- [ ] `backend/src/routes/classRoutes.js` contiene una pantalla de React; el backend no arranca.
- [ ] Hay dos implementaciones de clases (`/api/clases/*` en `index.js` y `/api/classes` en el router).
- [ ] El frontend llama a `/classes/create`, que no coincide con ninguna ruta válida.
- [ ] `GET /api/clases` ordena por `fecha_creacion`, que no existe.
- [ ] `GET /api/clases` devuelve a los alumnos todas las clases activas de todos los docentes.
- [ ] `app.listen` se llama dos veces en `index.js`.
- [ ] No existen editar, cerrar, reabrir ni eliminar.
- [ ] No se muestra el QR.

## Decisiones tomadas
- Una clase cerrada se puede reabrir. Al reabrirla se genera un código nuevo (y por lo tanto
  un QR nuevo), para que un código compartido en una sesión anterior ya no sirva.
- Todas las rutas de clases viven en un solo router bajo `/api/clases`.
- Un token ausente, inválido o expirado responde 401; 403 se usa solo para falta de permiso.
  Así el frontend cierra la sesión únicamente con 401.
- La tabla `turnos` se crea en esta feature porque cerrar y eliminar clases dependen de ella.

## Criterios de aceptación
- [ ] El backend arranca sin errores con `node index.js`.
- [ ] El docente crea una clase y aparece primero en `Classes` con un código de 6 caracteres.
- [ ] No se puede guardar una clase sin materia: el botón está deshabilitado.
- [ ] El docente edita la materia y el cambio se ve en la lista sin cerrar la app.
- [ ] `TeacherSession` muestra el código y un QR que, al escanearlo, da ese mismo código.
- [ ] Al cerrar una clase, se marca como cerrada y nadie puede unirse con su código.
- [ ] Al reabrir una clase cerrada, tiene un código distinto al anterior y la fila está vacía.
- [ ] El código anterior de una clase reabierta ya no permite unirse.
- [ ] Eliminar una clase abierta responde 409 y muestra el mensaje.
- [ ] Al eliminar una clase cerrada, desaparece de la lista.
- [ ] Un docente no puede editar ni eliminar la clase de otro docente (403).
- [ ] Un alumno no puede listar clases (403).
- [ ] Una petición con token expirado responde 401 y la app regresa a `Login`.
- [ ] Cerrar una clase ya cerrada responde 409.
- [ ] Sin clases, se ve el estado vacío con el botón "Crear mi primera clase".

## Tasks
Cada task es un commit en `feature/f03-gestionar-clases`.

### Backend
- [ ] T01 — Agregar las tasks a esta spec.
- [ ] T02 — Eliminar `src/routes/classRoutes.js` y su montaje en `/api/classes`.
- [ ] T03 — Llamar a `app.listen` una sola vez, al final de `index.js`.
- [ ] T04 — Completar `clases` en `schema.sql`: `fecha_creacion`, `fila_pausada` y
  `profesor_id NOT NULL`, con `ALTER TABLE ... IF NOT EXISTS` para la base existente.
- [ ] T05 — Crear la tabla `turnos` con `CHECK` de `estado` y `ON DELETE CASCADE`.
- [ ] T06 — Responder 401 cuando el token falta, es inválido o expiró.
- [ ] T07 — Agregar el middleware `exigirRol('profesor')` (403 para otros roles).
- [ ] T08 — Agregar `validarMateria()`: recorta espacios y exige de 1 a 100 caracteres.
- [ ] T09 — Reintentar con otro código si el generado ya existe (error `23505`), máximo 5 intentos.
- [ ] T10 — Mover crear, unirse y listar a un router en `/api/clases` sin cambiar su comportamiento.
- [ ] T11 — Crear clase en `POST /api/clases` con validación y código único.
- [ ] T12 — `GET /api/clases` devuelve solo las clases del docente, más recientes primero.
- [ ] T13 — Agregar el middleware `cargarClasePropia`: id no numérico 400, no existe 404, ajena 403.
- [ ] T14 — `PUT /api/clases/:id` edita la materia.
- [ ] T15 — `PATCH /api/clases/:id/cerrar` cierra la clase y cancela sus turnos activos en una transacción.
- [ ] T16 — `PATCH /api/clases/:id/abrir` reabre con código nuevo y `fila_pausada = false`.
- [ ] T17 — `DELETE /api/clases/:id` elimina una clase cerrada (204).
- [ ] T18 — Pruebas unitarias de `validarMateria` y del reintento de código.
- [ ] T19 — Actualizar diferencias, criterios de aceptación y el diario de decisiones.

### Frontend
Se detallan después de revisar el stash de `TeacherSessionScreen`. Orden previsto: recuperar el
stash, instalar dependencias, tipo `Clase` y servicio de clases, `Classes`, `ClassForm`,
`TeacherSession` con QR, y acciones de cerrar, reabrir y eliminar.