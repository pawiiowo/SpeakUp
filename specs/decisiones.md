# Diario de decisiones

Registro de las decisiones técnicas y de producto de SpeakUp. Cada entrada explica qué se
decidió, qué alternativas había y por qué se eligió esa opción.

Formato de cada entrada:
- **Fecha** y **spec** relacionada.
- **Decisión:** qué se eligió.
- **Alternativas:** qué otras opciones había.
- **Por qué:** la razón de la elección.

---

### D01 — Desarrollo guiado por especificaciones (SDD)
- **Fecha:** 2026-11-09 · **Spec:** todas
- **Decisión:** Antes de implementar una feature se escribe su spec en `specs/`. El código
  debe coincidir con la spec, y la spec se actualiza si algo cambia.
- **Alternativas:** Seguir programando directamente con el plan semanal de commits.
- **Por qué:** Al revisar el código aparecieron diferencias entre lo planeado y lo
  implementado (rutas que no coinciden, columnas inexistentes). Las specs hacen visibles
  esos huecos y dejan claro cuándo una feature está terminada.

### D02 — Privacidad en la fila como principio central
- **Fecha:** 2026-11-09 · **Spec:** 00-project
- **Decisión:** Solo el docente ve los nombres de quienes están en la fila. El alumno solo ve
  su propia posición, y la proyección en el salón es anónima.
- **Alternativas:** Mostrar la fila con nombres a todos, como una lista pública.
- **Por qué:** El problema que resuelve la app es la ansiedad de participar frente al grupo.
  Si los compañeros vieran quién pidió la palabra, se perdería el anonimato que la hace útil.

### D03 — Navegación condicionada por sesión y rol
- **Fecha:** 2026-11-09 · **Spec:** 01-navigation
- **Decisión:** La app decide qué grupo de pantallas mostrar (`AuthStack`, `TeacherStack` o
  `StudentStack`) según si hay sesión y el rol del usuario.
- **Alternativas:** Una sola pila de pantallas donde se navega con `navigate('Login')` y se
  revisa el rol dentro de cada pantalla.
- **Por qué:** Así un usuario no puede llegar a pantallas del otro rol, y al cerrar sesión
  el botón "atrás" no regresa a pantallas privadas. Es el flujo de autenticación que
  recomienda React Navigation.

### D04 — Proyección anónima con código y QR en un modal
- **Fecha:** 2026-11-09 · **Spec:** 01-navigation
- **Decisión:** `ProjectionModal` muestra en una sola pantalla la fila anónima, el código de
  la clase y su QR.
- **Alternativas:** Pantallas separadas para el QR y para la fila, o no permitir proyectar.
- **Por qué:** El docente proyecta una sola vista. Los alumnos pueden unirse escaneando el QR
  y ver el avance de la fila sin que aparezcan nombres.

### D05 — Salir de la fila solo con confirmación
- **Fecha:** 2026-11-09 · **Spec:** 01-navigation
- **Decisión:** El alumno pierde su turno solo al presionar "Salir de la fila" y confirmar.
  Salir de la pantalla, cambiar de tab o cerrar la app no le quita el turno.
- **Alternativas:** Cancelar el turno automáticamente al salir de la pantalla.
- **Por qué:** Evita que un alumno pierda su lugar por accidente (una llamada, bloquear el
  teléfono), lo que aumentaría la ansiedad que la app busca reducir.

### D06 — La fila se guarda en la base de datos
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** Los turnos se guardan en la tabla `turnos` de PostgreSQL.
- **Alternativas:** Guardar la fila solo en memoria del servidor (un arreglo en Node.js).
- **Por qué:** La fila sobrevive si el servidor se reinicia, un alumno que pierde conexión
  recupera su lugar, y los mismos datos sirven para el historial de participación (F08).

### D07 — La posición se calcula, no se guarda
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** La posición de un alumno se calcula contando los turnos `en_espera` de la
  clase con `fecha_solicitud` anterior o igual a la suya.
- **Alternativas:** Guardar un campo `posicion` en cada turno.
- **Por qué:** Si la posición se guardara, cada vez que alguien sale o recibe la palabra
  habría que actualizar la posición de todos los demás, con riesgo de que queden
  desordenadas. Calcularla siempre da el valor correcto.

### D08 — La privacidad se aplica en el backend
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** El backend envía datos distintos según quién los pide: el docente recibe
  nombres; el alumno y la proyección, no.
- **Alternativas:** Enviar la fila completa a todos y ocultar los nombres en el frontend.
- **Por qué:** Si el nombre nunca llega al teléfono del alumno, no puede mostrarse por error
  ni leerse inspeccionando la app.

### D09 — Token en expo-secure-store
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** El token JWT se guarda en `expo-secure-store`. Los datos no sensibles del
  usuario (id, nombre, email, rol) se guardan en AsyncStorage.
- **Alternativas:** Guardar todo en AsyncStorage, como en la versión actual.
- **Por qué:** AsyncStorage guarda texto sin cifrar. SecureStore usa el almacenamiento seguro
  del sistema operativo (Keychain en iOS, Keystore en Android), adecuado para credenciales.

### D10 — Eliminar clase solo si está cerrada
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** Eliminar una clase es un borrado real (junto con sus turnos), permitido solo
  si la clase ya está cerrada.
- **Alternativas:** Borrado lógico (solo ocultarla) o permitir borrar en cualquier momento.
- **Por qué:** Cumple la "D" del CRUD que pide el curso y evita borrar por accidente una
  clase con alumnos conectados.

### D11 — Correo institucional obligatorio
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** El registro solo acepta correos `@uabc.edu.mx`, guardados en minúsculas.
- **Alternativas:** Aceptar cualquier correo.
- **Por qué:** La app es para uso en clases de la universidad. Guardar en minúsculas evita
  cuentas duplicadas como `Pau@uabc.edu.mx` y `pau@uabc.edu.mx`.

### D12 — Mismos nombres de campos en todas las capas
- **Fecha:** 2026-11-09 · **Spec:** 02-data-model
- **Decisión:** Los campos se llaman igual en la base de datos, la API y los tipos de
  TypeScript (snake_case en español, p. ej. `profesor_id`).
- **Alternativas:** camelCase en el frontend (`profesorId`) con conversión en la API.
- **Por qué:** Evita una capa de traducción de nombres que puede introducir errores, y
  coincide con lo que el backend ya devuelve.

### D13 — Un solo router de clases bajo `/api/clases`
- **Fecha:** 2026-11-09 · **Spec:** F03
- **Decisión:** Todas las rutas de clases (crear, listar, editar, cerrar, reabrir, eliminar
  y unirse) viven en un solo router montado en `/api/clases`. Se elimina `classRoutes.js`.
- **Alternativas:** Mantener las rutas en `index.js` junto al router `/api/classes`.
- **Por qué:** Había dos implementaciones distintas y el frontend llamaba a una ruta que no
  existía. Un solo router, en español como el resto del backend, evita esa confusión y
  deja `index.js` más limpio.

### D14 — Código nuevo al reabrir una clase
- **Fecha:** 2026-11-09 · **Spec:** F03
- **Decisión:** Una clase cerrada se puede reabrir, y al hacerlo recibe un código nuevo.
- **Alternativas:** Reabrir con el mismo código, o no permitir reabrir (crear una clase nueva
  cada sesión).
- **Por qué:** El docente reutiliza su clase cada sesión sin crearla de nuevo, y un código
  compartido en una sesión anterior deja de servir. El QR se genera a partir del código,
  así que también cambia sin trabajo extra.