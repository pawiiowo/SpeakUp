# Bitácora de IA

Registro de cómo usé la IA (Claude, dentro del proyecto "SpeakUp" en claude.ai) durante el
desarrollo: qué le pedí, qué me propuso, qué acepté, rechacé o corregí, y cómo lo verifiqué.
Las decisiones técnicas que salen de aquí se explican en `specs/decisiones.md`.

Formato de cada entrada:
- **Pedí:** qué le pedí a la IA.
- **Propuso:** qué respondió o sugirió.
- **Decidí:** qué acepté, rechacé o corregí.
- **Verifiqué:** cómo comprobé que era correcto.

---

## 2026-11-10

### 1. Lista de tasks de F03
- **Pedí:** leer la spec F03 y el modelo de datos y proponer tasks pequeñas, empezando por el backend.
- **Propuso:** 19 tasks con un commit cada una. Además encontró tres problemas que no estaban en la
  spec: `backend/node_modules` está subido al repo, el middleware responde 403 tanto para token
  inválido como para falta de permiso, y cerrar o eliminar una clase necesita la tabla `turnos`,
  que todavía no existe.
- **Decidí:** aceptar las tasks y separar los códigos: 401 para token inválido o expirado y 403 solo
  para falta de permiso. Si no, la app cerraría la sesión de un docente que solo intentó editar una
  clase ajena.
- **Verifiqué:** leí `backend/authMiddleware.js` y confirmé que respondía 403 con token inválido.

### 2. ¿Render o Supabase?
- **Pedí:** ayuda para revisar datos de la base antes de cambiar la tabla `clases`.
- **Propuso:** se refería a "la base en Render", porque así lo decía `specs/00-project.md`.
- **Decidí:** no lo di por hecho, porque yo recordaba haber usado Supabase.
- **Verifiqué:** revisé el host de `DATABASE_URL` en mi `.env`: era `db.<id>.supabase.co`. La spec
  tenía el dato equivocado (venía del documento de la idea). Lo corregí en un commit aparte
  (`fix(specs): corrige proveedor de la base de datos`).

### 3. La base no conectaba (ENOTFOUND)
- **Pedí:** ayuda con el error `getaddrinfo ENOTFOUND` al consultar la base.
- **Propuso:** dos posibles causas: proyecto de Supabase pausado o red sin IPv6.
- **Decidí:** revisar una por una antes de cambiar algo.
- **Verifiqué:** en el dashboard el proyecto estaba pausado; lo restauré, pero siguió fallando.
  Con `nslookup` vi que el host solo tenía dirección IPv6. Cambié `DATABASE_URL` a la URL del
  Session pooler (IPv4) y la consulta funcionó.

### 4. Clases de prueba sin docente
- **Pedí:** saber si podía poner `profesor_id NOT NULL` en la tabla `clases`.
- **Propuso:** primero contar las clases con `profesor_id` nulo, porque esas filas harían fallar el cambio.
- **Decidí:** salieron 8, todas creadas por mí para probar la app. Acepté borrarlas.
- **Verifiqué:** la consulta, después del borrado, devolvió `Clases sin docente: 0`.

### 5. Pegar un archivo completo se cortó
- **Pedí:** el contenido completo de la spec F03 para pegarlo en mi archivo.
- **Propuso:** primero me mandó archivos para descargar; le pedí el texto en el chat y me dio el archivo entero.
- **Decidí:** al pegarlo, el texto se cortó a la mitad. Desde entonces pido cambios pequeños, por secciones.
- **Verifiqué:** `git diff` mostraba en rojo secciones enteras que no debían borrarse. También así detecté
  después que, al reemplazar la tabla de casos de error, había borrado sin querer la fila "Sin internet".

### 6. Líneas vacías de más
- **Pedí:** quitar el `require` de `classRoutes` en `index.js` (T02).
- **Propuso:** borrar las líneas y "dejar la línea vacía donde estaba".
- **Decidí:** seguir esa instrucción dejó tres líneas vacías seguidas; borré la que sobraba.
- **Verifiqué:** `git diff` mostraba una línea vacía en verde que no tenía por qué estar.

### 7. Prisma
- **Pedí:** qué implicaba lo que dijo el profesor sobre usar Prisma porque las consultas en código son vulnerables.
- **Propuso:** explicó que la vulnerabilidad es la inyección SQL, que ocurre al concatenar texto del usuario
  en la consulta, y que mis consultas ya usan parámetros (`$1, $2`). Prisma aportaría migraciones y tipos,
  pero obligaría a reescribir todas las consultas.
- **Decidí:** no usar Prisma, porque no es obligatorio. Sigo con `pg` y consultas parametrizadas.
- **Verifiqué:** revisé `backend/index.js`: todas las consultas usan `$1, $2` con un arreglo de valores.

### 8. Notificaciones push en Expo Go
- **Pedí:** si convenía usar notificaciones push con Expo Go, como recomendó el profesor.
- **Propuso:** buscó la documentación de Expo SDK 57: las push remotas ya no funcionan en Expo Go desde
  SDK 53 (hace falta un development build), pero las notificaciones locales sí.
- **Decidí:** dejarlo para la feature de aviso de turno; con el sprint final quedó fuera del alcance.
- **Verifiqué:** la documentación oficial de `expo-notifications` para SDK 57.

### 9. Arquitectura
- **Pedí:** qué arquitectura usa SpeakUp; yo pensaba que era un monolito.
- **Propuso:** cliente-servidor de tres capas (app móvil, backend, base de datos) con un backend monolítico.
- **Decidí:** usar esa descripción, más precisa que solo "monolito".

### 10. Ritmo de trabajo
- **Pedí:** que me diera pasos más pequeños, porque me dio muchos pasos seguidos.
- **Decidí:** trabajar un paso a la vez, verificando cada uno con `git diff` o la terminal.

## 2026-11-18

### 11. Plan del sprint final
- **Pedí:** un plan para terminar antes de la entrega del 22 de noviembre.
- **Propuso:** recortar el alcance al flujo principal (login, crear clase, unirse, pedir turno, el docente ve
  la fila y da la palabra), actualizar la fila consultando cada 3 segundos en lugar de Socket.io, y trabajar
  por bloques de 2 a 4 tasks por prompt, con un commit por task.
- **Decidí:** trabajar por bloques (también me lo habían sugerido) y actualizar la fila con consultas
  cada 3 segundos (polling). Socket.io da actualizaciones al instante, pero agrega un servidor de sockets,
  reconexiones y eventos que pueden fallar en la demo. Con polling, la fila tarda como máximo 3 segundos en
  actualizarse, que es aceptable en un salón. Socket.io queda como trabajo futuro.
- **Verifiqué:** pendiente: probar en la demo que la posición del alumno cambia sola en pocos segundos.

### 12. Tablas `clases` y `turnos` (T04 y T05)
- **Pedí:** completar la tabla `clases` y crear la tabla `turnos` según el modelo de datos.
- **Propuso:** `ALTER TABLE ... IF NOT EXISTS` para actualizar la base que ya existe en Supabase (un
  `CREATE TABLE IF NOT EXISTS` no cambia una tabla existente) y, además, dos índices únicos parciales que
  no le pedí: un alumno no puede tener dos turnos activos en la misma clase, y una clase no puede tener a
  dos alumnos hablando a la vez.
- **Decidí:** aceptar los índices, porque son reglas que ya estaban en `02-data-model` y así la base de
  datos las protege aunque el backend tuviera un error.
- **Verifiqué:** la IA probó el `schema.sql` dos veces seguidas en una base de prueba (sin errores, y un
  turno duplicado fue rechazado). Después corrí `node setupDb.js` contra Supabase y respondió
  "Tablas creadas exitosamente".

### 13. Autenticación, validación y código de clase (T06 a T09)
- **Pedí:** responder 401 con token inválido, un middleware que exija el rol de profesor, validar la materia
  y reintentar el código de clase si ya existe.
- **Propuso:** para el código, intentar guardarlo directamente y reintentar solo si PostgreSQL lo rechaza por
  repetido (error 23505), en lugar de consultar antes si existe. Si se consulta primero, dos docentes podrían
  obtener el mismo código entre la consulta y el guardado.
- **Decidí:** aceptar.
- **Verifiqué:** pruebas rápidas con casos límite: materia vacía, solo espacios, 100 y 101 letras; código
  repetido 2 veces y luego libre (funciona al tercer intento), repetido siempre (se rinde a los 5), y otro
  tipo de error (no reintenta). El servidor siguió arrancando.

### 14. Router de clases (T10 a T13)
- **Pedí:** mover las rutas de clases a su propio archivo, crear clase con `POST /api/clases`, listar solo las
  clases del docente y verificar que la clase pertenezca al docente.
- **Propuso:** primero mover las rutas sin cambiar su comportamiento (un commit de `refactor`) y después
  corregirlas en commits separados. Al revisar su propio cambio antes del commit, detectó que en Express 5
  `req.body` es `undefined` cuando la petición llega sin cuerpo JSON, y que `req.body.materia` habría
  provocado un error 500. Lo cambió a `req.body?.materia` para que un formulario vacío responda 400 con
  el mensaje "La materia es obligatoria".
- **Decidí:** aceptar las dos cosas. Separar el `refactor` de las correcciones hace que cada commit se
  pueda revisar por sí solo.
- **Verifiqué:** la IA levantó un PostgreSQL de prueba con mi código y corrió 34 peticiones a los endpoints
  de clases (T10 a T17): crear, listar, editar, cerrar, reabrir y eliminar, más casos límite (materia vacía,
  sin cuerpo, 101 letras, sin token, token inválido, alumno, clase ajena, id no numérico, clase inexistente,
  cerrar dos veces, eliminar una clase abierta). Todas respondieron lo que dice la spec. También comprobó que
  al cerrar se cancelan los turnos activos, que el código viejo deja de servir al reabrir y que al eliminar
  se borran los turnos.

### 15. Error de la IA al cerrar una clase (T15)
- **Pedí:** el endpoint para cerrar una clase y cancelar sus turnos en una transacción.
- **Propuso:** una primera versión con `pool.connect()` fuera del `try`. Al revisarla antes de subirla, la
  misma IA notó que, si la base de datos estuviera caída, ese error no se manejaría y la app no recibiría
  el JSON de error esperado.
- **Decidí:** aceptar la corrección: mover `pool.connect()` dentro del `try` y hacer el `ROLLBACK` solo si
  hubo conexión. Se reescribió el commit, que aún no estaba subido.
- **Verifiqué:** en la prueba de punta a punta, cerrar una clase respondió 200 y su turno activo quedó
  `cancelado`. Aprendizaje: también hay que revisar qué pasa cuando el servidor o la base fallan.

## 2026-11-20

### 16. Backend de la fila (F04 a F06)
- **Pedí:** una spec corta de la fila y su backend: unirse, pedir la palabra, salir, ver mi posición, ver la
  fila (docente) y dar la palabra al siguiente.
- **Propuso:** juntar "dar la palabra" y "pasar al siguiente" en un solo botón ("Siguiente"), calcular la
  posición numerando los turnos en espera por orden de llegada (`ROW_NUMBER`), separar las rutas de la fila
  en `src/routes/fila.js` y que las respuestas para el alumno nunca incluyan nombres. También corrigió
  `unirse`: antes un docente podía usarlo y la respuesta incluía datos del docente (`profesor_id`).
- **Decidí:** aceptar el botón único "Siguiente" porque simplifica la pantalla del docente para la demo.
- **Verifiqué:** la IA corrió 30 peticiones contra una base de prueba: posiciones 1, 2 y 3; al salir el
  primero, los demás suben; pedir dos veces da 409; el docente ve los nombres en orden y el alumno nunca
  recibe nombres; "Siguiente" da la palabra al primero y marca como atendido al que hablaba; con la clase
  cerrada no se puede pedir la palabra.

### 17. Frontend base y pruebas en mi iPhone
- **Pedí:** el frontend con la UX de mi prototipo de Figma.
- **Propuso:** leer el prototipo (colores y pantallas), componentes propios en lugar de React Native Paper
  (D25), subir a SDK 58 (D26) y usar el `SafeAreaView` de `react-native-safe-area-context` porque el de
  React Native está obsoleto.
- **Decidí:** aceptar, y al probar en el iPhone le pedí cambios: quitar los emojis (logo e íconos), un modal
  propio en lugar del menú de iOS, que la clase no nazca con la sesión abierta (D27) y cambiar textos que
  confundían "sesión" de la clase con la de la cuenta (D30).
- **Verifiqué:** probé en el iPhone. Encontré que el placeholder del correo salía con letras separadas
  (iOS reusaba el estilo del campo del código) y que sin backend la lista no avisaba nada; la IA corrigió
  las dos cosas. La conexión fallaba porque a mi `.env` le faltaba el puerto `:3000`.

### 18. Estimación de tiempos
- **Pedí:** cuánto tardaría agregar "Mis clases" del alumno con su historial.
- **Propuso:** primero estimó ~4.5–5 horas.
- **Decidí:** le señalé que sus tiempos eran de una persona escribiendo el código, y que cosas que estimó en
  45 minutos las hacía en 10. Corrigió a ~1–1.5 horas, la mayor parte en mis pruebas, y con eso decidí
  hacerlo (D28).

### 19. Historial del alumno: un error encontrado por las pruebas
- **Pedí:** el backend del historial (sesiones, inscripciones y participaciones).
- **Propuso:** tablas `sesiones` e `inscripciones`, y que iniciar y terminar clase abrieran y cerraran la sesión.
- **Decidí:** aceptar.
- **Verifiqué:** la IA probó todo contra una base de prueba, y una de sus pruebas falló: al terminar la clase, el
  turno de quien tenía la palabra quedaba `cancelado`, así que esa participación no contaba en el historial.
  Se corrigió primero la spec y luego el código: quien hablaba queda `atendido` y solo los que esperan se
  cancelan.

### 20. Error de tipos que encontré yo
- **Pedí:** la pantalla del historial con FlatList paginada.
- **Propuso:** un pie de lista que valía `null` mientras no cargaba más.
- **Decidí:** al correr `npx tsc --noEmit` en mi computadora salió un error: en React Native 0.88,
  `ListFooterComponent` no acepta `null`. La IA no había podido correr `tsc` en su entorno. Se corrigió a `undefined`.
- **Verifiqué:** volví a correr `tsc` sin errores.

### 21. ¿Cómo entra un alumno inscrito a una clase nueva?
- **Pedí:** al probar, noté que un alumno que ya se había unido una vez entraba a la fila de cualquier clase
  nueva sin código, y no entendía si eso estaba bien.
- **Propuso:** dos lógicas: entrar directo por estar inscrito, o pedir el QR o el código en cada clase.
  Recomendó la segunda porque la app es para clases presenciales y es coherente con D14.
- **Decidí:** la segunda, pero le pedí que no fuera solo con QR, porque alguien podría no poder usar la cámara.
  Se aceptan QR o código (D32).
- **Verifiqué:** 9 pruebas nuevas contra la base de prueba (sin entrar → 403, entrar → puede pedir la palabra,
  sesión nueva → vuelve a pedir el código, el código viejo ya no sirve) y la prueba en mi iPhone.

### 22. ¿Registrar asistencia en el historial?
- **Pedí:** que las sesiones donde el alumno no participó se vieran en gris, y pregunté si también se podía
  marcar a qué clases faltó.
- **Propuso:** guardar cada entrada a la clase y marcar "Sin asistencia" en las sesiones sin entrada.
- **Decidí:** no hacerlo. Tomar asistencia sería otra feature fuera del objetivo de la app, se siente como
  vigilancia y la app no sabe si el alumno estuvo en el salón (D33). Pedí que la sesión gris tuviera la leyenda
  "Sin participaciones" y que hubiera un punto de color distinto para cada caso.
- **Verifiqué:** en mi iPhone, las sesiones sin participaciones salen en gris y no se pueden tocar.

### 23. Modales que se cerraban solos
- **Pedí:** al probar noté que el modal se cerraba al tocar fuera; quería que solo se cerrara con sus botones
  y que la IA revisara los demás modales.
- **Propuso:** cambiar el componente `ModalOpciones`, que usan todos los modales, en vez de cada pantalla.
- **Decidí:** aceptar, porque un solo cambio arregla todos.
- **Verifiqué:** toqué fuera de cada modal y ninguno se cerró.

### 24. Copia local para usar la app sin internet
- **Pedí:** cumplir el requisito de persistencia local.
- **Propuso:** guardar las listas (mis clases y la primera página del historial) con AsyncStorage y borrar la
  copia al cerrar sesión. Comparó con SQLite y con SecureStore (D34).
- **Decidí:** aceptar AsyncStorage: son listas pequeñas y SQLite era más de lo necesario. Al probar, el aviso
  rojo se sentía alarmante aunque sí había datos; acepté cambiarlo a gris y la IA ajustó el texto a "No se pudo
  actualizar", porque la copia también sale cuando falla el servidor y no solo sin internet.
- **Verifiqué:** con el backend apagado, cerré y abrí Expo Go y la lista guardada siguió saliendo, sin pantalla
  roja.

### 25. La materia no cambia después de la primera sesión
- **Pedí:** que el docente no pueda renombrar una clase que ya impartió, para no confundir a los alumnos.
- **Propuso:** esconder "Editar materia" con un dato `tiene_sesiones` y además validar en el backend con un 409
  dentro del mismo `UPDATE` (D35).
- **Decidí:** aceptar. La validación en el backend importa porque se puede llamar a la API sin la app.
- **Verifiqué:** pruebas contra la base de prueba (editar antes de iniciar da 200, después da 409) y en la app.

### 26. Documentación que encontró diferencias con la spec
- **Pedí:** adelantar la documentación de la API y de la arquitectura.
- **Propuso:** documentar los endpoints leyendo el código en vez de las specs. Al hacerlo encontró tres
  problemas: el backend no exigía el correo institucional (D11), firmaba los tokens con una clave por defecto
  si faltaba `JWT_SECRET`, y `backend/node_modules` estaba subido al repositorio.
- **Decidí:** corregirlos de inmediato, cada uno en su propio commit. El registro ahora valida en el backend
  (con Postman se podía saltar la validación de la app), el servidor no arranca sin `JWT_SECRET` y
  `node_modules` salió del repositorio sin borrarse de mi computadora.
- **Verifiqué:** 4 pruebas unitarias nuevas de `validarRegistro` (11 en total), 8 pruebas contra la base de
  prueba (correo de Gmail rechazado, mayúsculas guardadas en minúsculas, login con mayúsculas) y en la app.

### 27. Pasada de casos límite
- **Pedí:** probar los casos límite que puede pedir el profesor: sin internet, servidor caído, campos vacíos,
  texto largo, doble toque, clase cerrada, listas vacías, permiso de cámara denegado, salir y volver, y token
  expirado.
- **Propuso:** pasos exactos por bloques y simular el token expirado cambiando `JWT_SECRET` en el `.env`,
  porque así ningún token viejo sirve, igual que si hubieran pasado las 24 horas.
- **Decidí:** corregir lo que encontré: el mensaje del código ahora dice "debe tener 6 letras o números", el
  título de los modales se corta a 2 líneas con nombres largos, y el aviso de sesión expirada usa el modal propio,
  porque con `Alert` no se veía en la versión web.
- **Verifiqué:** repetí los pasos de cada corrección en el iPhone y en la laptop; los demás casos salieron bien
  sin pantalla roja.

### 28. SonarQube Cloud reprobó el PR a main
- **Pedí:** entender por qué el análisis de SonarQube Cloud falló (confiabilidad C y seguridad B) y corregirlo.
- **Propuso:** tres tipos de corrección: marcar con `void` las promesas que no se esperan a propósito (como
  recargar la lista), cambiar el patrón del correo por uno sin partes que se traslapen para que no se atore con
  textos largos, y quitar la URL `http` escrita en el código como respaldo, para que la URL venga solo del `.env`.
- **Decidí:** aceptar las tres. La URL sigue siendo `http` en la red local de desarrollo porque el backend corre
  en mi laptop; en producción sería `https`.
- **Verifiqué:** 11 pruebas unitarias, el patrón con correos válidos e inválidos y con un texto de 50,000
  caracteres, `tsc` sin errores, la app en el iPhone y el nuevo análisis de SonarQube en el PR.

### 29. Build del APK con EAS
- **Pedí:** generar el APK de Android que pide la entrega.
- **Propuso:** un perfil `preview` en `eas.json` que genera un APK, la URL del backend en ese perfil (el `.env` no
  se sube a la nube de Expo) y permitir `http` en Android con `expo-build-properties`, porque el backend corre en
  mi red local (D36).
- **Decidí:** aceptar. Al vincular el proyecto, `eas init` agregó el permiso de micrófono; la IA lo notó y lo
  quitamos, porque la app solo usa la cámara para leer el QR y no debe pedir permisos que no usa.
- **Verifiqué:** el build terminó en EAS y generó el APK con su link de descarga.

### 30. Pruebas unitarias, de integración y cobertura
- **Pedí:** completar las pruebas que pide el curso (12 unitarias, 4 de integración y cobertura).
- **Propuso:** probar las funciones puras del frontend (`validaciones.ts` y `fechas.ts`) con `node --test`, que
  ya lee TypeScript sin instalar Jest; separar `app.js` de `index.js` para que las pruebas carguen la app sin abrir
  el puerto; y pruebas de integración que hacen peticiones HTTP reales pero terminan antes de la base de datos
  (token faltante o expirado, rol equivocado, correo no institucional, materia vacía, id inválido, página muy
  grande), para no tocar Supabase ni crear datos.
- **Decidí:** aceptar. La cobertura del backend queda en 50 % porque las rutas que consultan la base no se cubren
  con estas pruebas; esas rutas las probó la IA contra una base de prueba durante el desarrollo.
- **Verifiqué:** `npm test` en `backend` (18 pruebas: 11 unitarias y 7 de integración) y en `frontend`
  (11 unitarias), y el reporte con `npm run test:cobertura`.
