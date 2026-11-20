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

### D15 — 401 para token inválido y 403 para falta de permiso
- **Fecha:** 2026-11-10 · **Spec:** F03
- **Decisión:** Un token ausente, inválido o expirado responde 401. El 403 se usa solo cuando el
  usuario está identificado pero no tiene permiso (un alumno en una ruta de docente, o la clase de
  otro docente).
- **Alternativas:** Responder 403 en los dos casos, como hacía el middleware.
- **Por qué:** La app cierra la sesión cuando recibe 401. Si los dos casos fueran 403, un docente
  que intenta editar una clase ajena perdería su sesión sin razón.

### D16 — Reintentar el código de clase al recibir el error de duplicado
- **Fecha:** 2026-11-10 · **Spec:** F03
- **Decisión:** Para crear o reabrir una clase se intenta guardar un código aleatorio; si PostgreSQL
  lo rechaza por repetido (error 23505), se prueba con otro, hasta 5 veces.
- **Alternativas:** Consultar primero si el código existe y después insertarlo.
- **Por qué:** Entre la consulta y el guardado, otro docente podría obtener el mismo código. Al dejar
  que la restricción única de la base decida, no existe ese hueco.

### D17 — Cambios de esquema idempotentes en `schema.sql`
- **Fecha:** 2026-11-18 · **Spec:** 02-data-model
- **Decisión:** `schema.sql` usa `CREATE TABLE IF NOT EXISTS` y `ALTER TABLE ... IF NOT EXISTS`, y se
  aplica con `node setupDb.js`. Se puede correr varias veces sin error.
- **Alternativas:** Una herramienta de migraciones (por ejemplo, Prisma Migrate).
- **Por qué:** Son pocas tablas y trabajo sola; un solo archivo que se puede repetir es suficiente y
  no agrega otra herramienta que aprender antes de la entrega.

### D18 — Reglas de la fila protegidas por la base de datos
- **Fecha:** 2026-11-18 · **Spec:** 02-data-model
- **Decisión:** Dos índices únicos parciales en `turnos`: un alumno tiene como máximo un turno activo
  por clase, y una clase tiene como máximo un turno `hablando`.
- **Alternativas:** Revisar esas reglas solo en el código del backend.
- **Por qué:** Si el backend tuviera un error (o llegaran dos peticiones al mismo tiempo), la base de
  datos sigue impidiendo que se rompan las reglas.

### D19 — Base de datos en Supabase
- **Fecha:** 2026-11-10 · **Spec:** 00-project
- **Decisión:** La base PostgreSQL vive en Supabase y el backend se conecta con la URL del Session
  pooler.
- **Alternativas:** PostgreSQL en Render, como decía el documento de la idea.
- **Por qué:** La base ya estaba creada en Supabase. La conexión directa de Supabase solo tiene
  dirección IPv6 y fallaba desde mi red; el Session pooler funciona con IPv4.

### D20 — Consultas con `pg` sin ORM
- **Fecha:** 2026-11-10 · **Spec:** 00-project
- **Decisión:** El backend usa `pg` con consultas parametrizadas (`$1, $2`) y no usa Prisma.
- **Alternativas:** Prisma (sugerido en clase como más seguro).
- **Por qué:** La inyección SQL ocurre al concatenar texto del usuario en la consulta; las consultas
  parametrizadas ya lo evitan porque el valor viaja aparte. Prisma no era obligatorio y migrar
  implicaba reescribir todas las consultas y agregar configuración para un backend en CommonJS.

### D21 — Arquitectura cliente-servidor con backend monolítico
- **Fecha:** 2026-11-10 · **Spec:** 00-project
- **Decisión:** Tres capas: la app móvil (React Native con Expo), un backend monolítico (Node.js con
  Express, API REST) y PostgreSQL. Dentro del backend, las rutas se separan por módulo
  (`src/routes/clases.js`).
- **Alternativas:** Microservicios (un servicio por módulo).
- **Por qué:** Es un proyecto de una sola desarrolladora y de tamaño de curso. Un solo backend es más
  fácil de programar, probar y desplegar.

### D22 — La fila se actualiza consultando cada 3 segundos (polling)
- **Fecha:** 2026-11-18 · **Spec:** F05, F06
- **Decisión:** Las pantallas de la fila piden su estado al servidor cada 3 segundos.
- **Alternativas:** Socket.io, que avisa al instante.
- **Por qué:** Con el tiempo que queda antes de la entrega, polling tiene menos piezas que pueden
  fallar en la demo (servidor de sockets, reconexiones, eventos). Un retraso de hasta 3 segundos no
  se nota en un salón. Socket.io queda como trabajo futuro.

### D23 — Alcance del sprint final
- **Fecha:** 2026-11-18 · **Spec:** 00-project
- **Decisión:** Para la entrega se priorizan F01 a F06 (registro, sesión, clases, unirse, pedir la
  palabra y moderar la fila). Quedan como trabajo futuro: notificaciones (F07), historial (F08), la
  vista de proyección, el escáner de QR y pausar la fila.
- **Alternativas:** Intentar todas las features con menos pruebas y menos dominio del código.
- **Por qué:** En la presentación se califica que la app funcione, aguante casos límite y que yo
  sepa explicarla y modificarla. Una app más pequeña que domino cumple mejor eso.

### D24 — Desarrollo en iPhone con Expo Go y build final para Android
- **Fecha:** 2026-11-10 · **Spec:** 00-project
- **Decisión:** Pruebo la app en mi iPhone con Expo Go. El build de EAS para la entrega es de Android.
- **Alternativas:** Build de iOS.
- **Por qué:** Instalar un build propio en iPhone requiere una cuenta de pago de Apple Developer, y el
  simulador de iPhone solo funciona en Mac. El código es el mismo para las dos plataformas.
