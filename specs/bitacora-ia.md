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
