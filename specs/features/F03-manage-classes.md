# F03 — Gestionar clases

## Objetivo
Permitir que el docente cree, consulte, edite, cierre y elimine sus clases, y que abra una
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
| Eliminar | `id` de la clase |

## Endpoints (todos requieren token de docente)
| Método | Ruta                       | Acción |
|--------|----------------------------|--------|
| POST   | /api/clases                | Crear clase (genera código único) |
| GET    | /api/clases                | Listar las clases del docente, más recientes primero |
| PUT    | /api/clases/:id            | Editar materia |
| PATCH  | /api/clases/:id/cerrar     | Cerrar clase (sus turnos activos pasan a `cancelado`) |
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

**Eliminar**
1. En una clase cerrada, el docente presiona "Eliminar".
2. El sistema pide confirmación indicando que se borrará también su historial de turnos.
3. La clase desaparece de la lista.

## Validaciones
- `materia` es obligatoria, se recortan los espacios y mide de 1 a 100 caracteres.
- El botón "Guardar" está deshabilitado mientras la materia esté vacía o se esté guardando.
- Solo el docente dueño de la clase puede editarla, cerrarla o eliminarla.
- Solo se puede eliminar una clase cerrada.
- Si el código generado ya existe, el backend genera otro (máximo 5 intentos).

## Estados de pantalla — `Classes`
- **Cargando:** indicador mientras llega la lista.
- **Datos:** lista con materia, código, fecha y estado (abierta/cerrada).
- **Vacía:** "Aún no tienes clases" con botón "Crear mi primera clase".
- **Error:** mensaje con botón "Reintentar".

## Casos de error
| Situación                         | Respuesta del backend | Qué ve el docente |
|-----------------------------------|-----------------------|-------------------|
| Materia vacía o > 100 caracteres  | 400                   | Mensaje bajo el campo |
| Token ausente, inválido o expirado| 401 / 403             | Se cierra la sesión y vuelve a `Login` |
| Un alumno llama a estos endpoints | 403                   | — |
| La clase no es suya               | 403                   | "No tienes permiso sobre esta clase" |
| La clase no existe                | 404                   | "La clase ya no existe" y se recarga la lista |
| Eliminar una clase abierta        | 409                   | "Cierra la clase antes de eliminarla" |
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
- [ ] No existen editar, cerrar ni eliminar.
- [ ] No se muestra el QR.

## Preguntas abiertas
- [ ] ¿Una clase cerrada se puede volver a abrir (con el mismo código, p. ej. la siguiente semana)?

## Criterios de aceptación
- [ ] El backend arranca sin errores con `node index.js`.
- [ ] El docente crea una clase y aparece primero en `Classes` con un código de 6 caracteres.
- [ ] No se puede guardar una clase sin materia: el botón está deshabilitado.
- [ ] El docente edita la materia y el cambio se ve en la lista sin cerrar la app.
- [ ] `TeacherSession` muestra el código y un QR que, al escanearlo, da ese mismo código.
- [ ] Al cerrar una clase, se marca como cerrada y nadie puede unirse con su código.
- [ ] Eliminar una clase abierta responde 409 y muestra el mensaje.
- [ ] Al eliminar una clase cerrada, desaparece de la lista.
- [ ] Un docente no puede editar ni eliminar la clase de otro docente (403).
- [ ] Un alumno no puede listar clases (403).
- [ ] Sin clases, se ve el estado vacío con el botón "Crear mi primera clase".

## Tasks
Se definen después de revisar esta spec.