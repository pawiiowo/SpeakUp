# API de SpeakUp

API REST del backend (Express 5 + PostgreSQL). Todas las rutas empiezan con `/api`.

- **URL base en desarrollo:** `http://<IP-de-la-laptop>:3000/api` (la misma que `EXPO_PUBLIC_API_URL`).
- **Formato:** JSON en el cuerpo de las peticiones y de las respuestas.
- **Autenticación:** las rutas marcadas con 🔒 piden el encabezado `Authorization: Bearer <token>`.
  El token se obtiene en `POST /auth/login` y dura 24 horas.
- **Errores:** siempre llegan como `{ "error": "mensaje para el usuario" }`.

## Códigos de error comunes

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos: campo vacío, materia de más de 100 caracteres, `id` no numérico, parámetros de página inválidos. |
| 401 | Falta el token, es inválido o expiró. La app cierra la sesión (D15). |
| 403 | El usuario no tiene permiso: rol equivocado, la clase es de otro docente, o el alumno no entró a la sesión de hoy. |
| 404 | La clase no existe, o el alumno no está inscrito en ella. |
| 409 | La acción choca con el estado actual: la clase ya está abierta o cerrada, el alumno ya está en la fila, etc. |
| 500 | Error del servidor o de la base de datos. |

## Resumen

| Método | Ruta | Rol | Para qué |
|---|---|---|---|
| POST | `/auth/register` | — | Crear cuenta |
| POST | `/auth/login` | — | Iniciar sesión |
| GET | `/auth/perfil` 🔒 | cualquiera | Datos del usuario |
| POST | `/clases` 🔒 | docente | Crear clase |
| GET | `/clases` 🔒 | docente | Mis clases |
| PUT | `/clases/:id` 🔒 | docente | Editar materia |
| PATCH | `/clases/:id/abrir` 🔒 | docente | Iniciar clase |
| PATCH | `/clases/:id/cerrar` 🔒 | docente | Terminar clase |
| DELETE | `/clases/:id` 🔒 | docente | Eliminar clase |
| GET | `/clases/:id/fila` 🔒 | docente | Ver la fila con nombres |
| POST | `/clases/:id/fila/siguiente` 🔒 | docente | Dar la palabra al siguiente |
| POST | `/clases/unirse` 🔒 | alumno | Entrar con el código o el QR |
| GET | `/clases/:id/fila/mia` 🔒 | alumno | Mi lugar en la fila |
| POST | `/clases/:id/turnos` 🔒 | alumno | Pedir la palabra |
| DELETE | `/clases/:id/turnos/mio` 🔒 | alumno | Salir de la fila |
| GET | `/alumno/clases` 🔒 | alumno | Mis clases |
| GET | `/alumno/clases/:id/sesiones` 🔒 | alumno | Historial paginado |
| GET | `/test-db` | — | Diagnóstico: revisa la conexión a la base |

## Autenticación (`backend/index.js`)

### POST `/auth/register`
Cuerpo: `{ "nombre", "email", "password", "rol" }`, donde `rol` es `"alumno"` o `"profesor"`.
El correo debe terminar en `@uabc.edu.mx` y se guarda en minúsculas (D11). El nombre va de 2 a 100
caracteres y la contraseña tiene al menos 6.

- **201** `{ mensaje, usuario: { id, nombre, email, rol } }`
- **400** si falta un campo, no cumple las reglas de arriba o el correo ya está registrado.

### POST `/auth/login`
Cuerpo: `{ "email", "password" }`. El correo se compara sin importar mayúsculas.

- **200** `{ mensaje, token, usuario: { id, nombre, email, rol } }`
- **400** si falta un campo o las credenciales no son válidas.

### GET `/auth/perfil` 🔒
- **200** `{ id, nombre, email, rol }`
- **404** si el usuario ya no existe.

## Clases del docente (`backend/src/routes/clases.js`)

Todas piden rol `profesor`. Las que llevan `:id` responden **403** si la clase es de otro docente.

Una clase se ve así:
```json
{ "id": 7, "codigo": "K3P9QZ", "materia": "Aplicaciones Móviles", "activa": true,
  "fila_pausada": false, "profesor_id": 2, "fecha_creacion": "2026-11-20T18:00:00.000Z" }
```

### POST `/clases`
Cuerpo: `{ "materia" }` (de 1 a 100 caracteres, se recortan los espacios).
La clase nace sin iniciar (`activa: false`, D27).

- **201** `{ mensaje, clase }`
- **400** materia vacía o demasiado larga.

### GET `/clases`
- **200** arreglo de clases, de la más nueva a la más vieja. Cada una trae además
  `tiene_sesiones` (si ya se impartió alguna vez, D35).

### PUT `/clases/:id`
Cuerpo: `{ "materia" }`.

- **200** `{ mensaje, clase }`
- **400** materia inválida.
- **409** la clase ya se impartió alguna vez y su materia no se puede cambiar (D35).

### PATCH `/clases/:id/abrir`
Inicia la clase: genera un código nuevo y abre una sesión del historial (D14, D32).

- **200** `{ mensaje: "Clase iniciada", clase }`
- **409** la clase ya está abierta.

### PATCH `/clases/:id/cerrar`
Termina la clase en una transacción: quien tenía la palabra queda `atendido`, quienes esperaban
quedan `cancelado` y la sesión se cierra.

- **200** `{ mensaje: "Clase terminada", clase }`
- **409** la clase ya está cerrada.

### DELETE `/clases/:id`
Borra la clase con sus turnos, sesiones e inscripciones.

- **204** sin cuerpo.
- **409** la clase está en curso; hay que terminarla primero.

## Fila del docente (`backend/src/routes/fila.js`)

### GET `/clases/:id/fila`
La app la pide cada 3 segundos (D22).

- **200**
```json
{ "clase": { "id": 7, "materia": "...", "codigo": "K3P9QZ", "activa": true },
  "hablando": { "turno_id": 31, "nombre": "Ana", "fecha_inicio": "..." },
  "en_espera": [ { "turno_id": 32, "nombre": "Luis", "posicion": 1 } ] }
```
`hablando` es `null` si nadie tiene la palabra.

### POST `/clases/:id/fila/siguiente`
En una transacción: quien hablaba pasa a `atendido` y el primero en espera pasa a `hablando`.

- **200** la fila actualizada (mismo formato que `GET /fila`).
- **409** la clase está cerrada.

## Alumno: entrar y la fila

### POST `/clases/unirse` (`clases.js`)
Cuerpo: `{ "codigo" }`. Se aceptan minúsculas y espacios; se convierte a mayúsculas.
Inscribe al alumno (o actualiza su inscripción) en la sesión de hoy (D32).

- **200** `{ mensaje, clase: { id, materia, codigo } }`
- **400** código vacío.
- **404** no hay una clase en curso con ese código.

### Rutas de la fila del alumno (`fila.js`)
Con la clase en curso, el alumno debe haber entrado hoy con el QR o el código. Si no, responden
**403** `{ error: "Entra con el QR o el código de hoy.", codigo: "SIN_ENTRADA" }`.

El estado de la fila para el alumno nunca incluye nombres de otros alumnos (D08):
```json
{ "clase": { "id": 7, "materia": "...", "activa": true },
  "mi_turno": { "estado": "en_espera", "posicion": 2 },
  "en_espera": 3, "alguien_hablando": true }
```
`mi_turno` es `null` si el alumno no está en la fila; `estado` puede ser `en_espera` o `hablando`.

#### GET `/clases/:id/fila/mia`
La app la pide cada 3 segundos. **200** con el estado de arriba.

#### POST `/clases/:id/turnos`
Pide la palabra.

- **201** el estado actualizado.
- **409** "La clase está cerrada." o "Ya estás en la fila."

#### DELETE `/clases/:id/turnos/mio`
Sale de la fila. Solo mientras espera; quien ya tiene la palabra no puede salir.

- **200** el estado actualizado.
- **409** "No estás esperando turno."

## Alumno: mis clases e historial (`backend/src/routes/alumno.js`)

### GET `/alumno/clases`
- **200** arreglo, con las clases en curso primero:
```json
[ { "id": 7, "materia": "...", "activa": true,
    "ultima_sesion": "2026-11-20T18:00:00.000Z", "entrada_hoy": true } ]
```
`entrada_hoy` indica si ya entró a la sesión en curso con el QR o el código.

### GET `/alumno/clases/:id/sesiones?pagina=1&limite=10`
Historial de la más reciente a la más antigua, solo desde que el alumno se unió.
`pagina` empieza en 1; `limite` va de 1 a 50 (por defecto 10).

- **200**
```json
{ "sesiones": [ { "id": 12, "numero": 5, "fecha_inicio": "...", "fecha_fin": "...",
                  "en_curso": false, "participaciones": 2 } ],
  "hay_mas": true }
```
- **400** parámetros inválidos.
- **404** el alumno no está inscrito en esa clase.
