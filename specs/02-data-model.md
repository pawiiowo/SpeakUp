# Modelo de datos

## Objetivo
Definir las entidades de SpeakUp, sus campos, relaciones y reglas, antes de modificar
la base de datos o crear tipos en el frontend.

## Entidades

### Usuario (tabla `usuarios`) — F01, F02
| Campo    | Tipo         | Reglas |
|----------|--------------|--------|
| id       | SERIAL       | PK |
| nombre   | VARCHAR(100) | Obligatorio |
| email    | VARCHAR(100) | Obligatorio, único, debe terminar en `@uabc.edu.mx`. Se guarda en minúsculas |
| password | VARCHAR(255) | Hash bcrypt. Nunca se envía al frontend |
| rol      | VARCHAR(20)  | `profesor` o `alumno` |

### Clase (tabla `clases`) — F03, F04
| Campo          | Tipo         | Reglas |
|----------------|--------------|--------|
| id             | SERIAL       | PK |
| codigo         | VARCHAR(6)   | Único, 6 caracteres A-Z y 0-9, generado por el backend. Se regenera al reabrir la clase |
| materia        | VARCHAR(100) | Obligatorio. Editable |
| profesor_id    | INT          | FK → usuarios.id, obligatorio |
| activa         | BOOLEAN      | `true` = abierta. `false` = cerrada (nadie puede unirse ni pedir turno) |
| fila_pausada   | BOOLEAN      | `true` = los alumnos no pueden pedir turno. Default `false` |
| fecha_creacion | TIMESTAMP    | Default `NOW()` |

### Turno (tabla `turnos`) — F05, F06, F07, F08
| Campo           | Tipo        | Reglas |
|-----------------|-------------|--------|
| id              | SERIAL      | PK |
| clase_id        | INT         | FK → clases.id |
| alumno_id       | INT         | FK → usuarios.id (rol alumno) |
| estado          | VARCHAR(20) | `en_espera`, `hablando`, `atendido`, `cancelado` |
| fecha_solicitud | TIMESTAMP   | Default `NOW()`. Define el orden de la fila |
| fecha_inicio    | TIMESTAMP   | Cuando recibe la palabra. Null mientras espera |
| fecha_fin       | TIMESTAMP   | Cuando termina o cancela. Null mientras está activo |

## Relaciones
```text
Usuario (profesor) 1 ── N Clase
Clase              1 ── N Turno
Usuario (alumno)   1 ── N Turno
```

## Ciclo de vida de un turno
```text
en_espera ──(docente da la palabra)──> hablando ──(docente pasa al siguiente)──> atendido
    │
    └──(alumno presiona "Salir de la fila" y confirma)──> cancelado
```

## Reglas del negocio
- Un alumno tiene como máximo **un turno activo** (`en_espera` o `hablando`) por clase.
- Una clase tiene como máximo **un turno `hablando`** a la vez.
- No se puede pedir turno si la clase está cerrada (`activa = false`) o pausada.
- La **posición** no se guarda: se calcula contando los turnos `en_espera` de la clase con
  `fecha_solicitud` anterior o igual.
- Al cerrar una clase, sus turnos activos pasan a `cancelado`.
- Una clase solo se puede **eliminar** si está cerrada (`activa = false`). Al eliminarla se
  borran también sus turnos (`ON DELETE CASCADE` en `turnos.clase_id`).

## Datos que recibe cada rol (privacidad)
| Vista                        | Recibe                                          | Nunca recibe |
|------------------------------|-------------------------------------------------|--------------|
| Docente — `TeacherSession`   | Lista de turnos con `nombre` del alumno, estado y orden | password |
| Proyección — `ProjectionModal` | Código, estado de la fila, número de turnos en espera, si alguien está hablando | nombres, ids de alumnos |
| Alumno — `StudentQueue`      | Su `posicion`, su `estado`, total en espera, estado de la fila | nombres o ids de otros alumnos |

## Datos locales del dispositivo
| Dato          | Dónde             | Para qué |
|---------------|-------------------|----------|
| Token JWT     | expo-secure-store | Autenticar peticiones (dato sensible) |
| Datos del usuario (`id`, `nombre`, `email`, `rol`) | AsyncStorage | Decidir qué tabs mostrar al abrir la app |

## Convención de nombres
Los campos se llaman igual en la base de datos, en las respuestas de la API y en los tipos
de TypeScript (snake_case, en español), para no tener que traducir nombres entre capas.

## Diferencias con el código actual
- [ ] `clases.fecha_creacion` no existe en `schema.sql`, pero `GET /api/clases` ordena por ella.
- [ ] Falta `clases.fila_pausada`.
- [ ] Falta la tabla `turnos`.
- [ ] `clases.profesor_id` permite NULL.
- [ ] `generarCodigo()` no reintenta si el código ya existe.
- [ ] El token se guarda en AsyncStorage (pasar a expo-secure-store).
- [ ] El registro acepta correos de cualquier dominio y no los convierte a minúsculas.
- [ ] No existe endpoint para editar ni eliminar una clase.

## Decisiones tomadas
- Eliminar clase es un borrado real, permitido solo con la clase cerrada, para evitar
  borrar por accidente una clase en uso.
- El registro exige correo institucional `@uabc.edu.mx`.
- El token JWT se guarda en expo-secure-store; los datos no sensibles del usuario, en AsyncStorage.