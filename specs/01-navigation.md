# Navegación

## Objetivo
Definir las pantallas de SpeakUp, cómo se agrupan (Stack, Tabs, Modal) según la sesión
y el rol del usuario, y qué datos viajan entre pantallas.

## Regla de entrada
1. Al abrir la app se muestra `Splash` mientras se lee la sesión guardada (AsyncStorage).
2. Sin sesión válida → `AuthStack`.
3. Con sesión válida → `TeacherTabs` si el rol es `profesor`, `StudentTabs` si es `alumno`.
4. Un usuario nunca puede navegar a pantallas del otro rol.

## Mapa de pantallas
RootStack
├── Splash
│
├── AuthStack                         (sin sesión)
│   ├── Login                         F02
│   └── Register                      F01
│
├── TeacherTabs                       (rol: profesor)
│   ├── Classes      — Mis clases     F03
│   ├── History      — Historial      F08
│   └── Profile      — Perfil/salir   F02
│   ├── ClassForm         (stack)     F03  crear / editar clase
│   ├── TeacherSession    (stack)     F03, F06  código + QR + fila con nombres
│   └── ProjectionModal   (modal)     F06  fila anónima para proyectar
│
└── StudentTabs                       (rol: alumno)
    ├── JoinClass    — Unirse         F04
    ├── History      — Historial      F08
    └── Profile      — Perfil/salir   F02
    ├── QrScanner         (modal)     F04  cámara para escanear el QR
    └── StudentQueue      (stack)     F05, F07  pedir turno y ver mi posición

Total: 12 pantallas (requisito del curso: mínimo 5, con Stack + Tabs + Modal).

## Parámetros entre pantallas
| Desde          | Hacia           | Parámetros            | Nota |
|----------------|-----------------|-----------------------|------|
| Classes        | ClassForm       | `{ claseId? }`        | Sin `claseId` = crear; con `claseId` = editar |
| Classes        | TeacherSession  | `{ claseId }`         | Abrir la sesión de una clase |
| TeacherSession | ProjectionModal | `{ claseId }`         | La vista no recibe nombres |
| JoinClass      | QrScanner       | —                     | |
| JoinClass      | StudentQueue    | `{ claseId }`         | Después de validar el código |
| QrScanner      | StudentQueue    | `{ claseId }`         | Reemplaza al escáner (no se regresa a la cámara) |

## Reglas de privacidad en navegación
- `ProjectionModal` y `StudentQueue` nunca reciben ni muestran nombres de alumnos.
- Solo `TeacherSession` muestra nombres.

## Casos negativos
- **Token expirado o inválido (401/403)** en cualquier pantalla → cerrar sesión y volver a `Login` con mensaje.
- **Cerrar sesión** → volver a `AuthStack`. El botón "atrás" no regresa a pantallas privadas.
- **Permiso de cámara negado** en `QrScanner` → cerrar el modal y volver a `JoinClass`, que permite escribir el código a mano.
- **Clase cerrada por el docente** mientras el alumno está en `StudentQueue` → volver a `JoinClass` con mensaje.
- **Sin conexión al abrir la app** → si hay sesión guardada, entrar a las tabs y mostrar estado de error en cada pantalla (no expulsar al usuario).

## Relación con el código actual
| Pantalla actual               | Pasa a ser                      |
|-------------------------------|---------------------------------|
| `LoginScreen.js`              | `Login`                         |
| `RegisterScreen.js`           | `Register`                      |
| `TeacherDashboardScreen.js`   | Se divide en `Classes` + `ClassForm` |
| `TeacherSessionScreen.js` (en stash) | `TeacherSession`         |

## Preguntas abiertas
- [ ] ¿`ProjectionModal` muestra también el código y el QR para que los alumnos se unan?
- [ ] Si el alumno sale de `StudentQueue` mientras está en la fila, ¿pierde su turno?

## Criterios de aceptación
- [ ] Sin sesión, la app abre en `Login`.
- [ ] Un docente que inicia sesión ve 3 tabs: Mis clases, Historial, Perfil.
- [ ] Un alumno que inicia sesión ve 3 tabs: Unirse, Historial, Perfil.
- [ ] Al cerrar la app y volver a abrirla con sesión guardada, entra directo a sus tabs.
- [ ] Al cerrar sesión, el botón "atrás" de Android no regresa a pantallas privadas.
- [ ] `ProjectionModal` y `QrScanner` se abren como modal.
- [ ] Ninguna pantalla del alumno ni la proyección muestran nombres de otros alumnos.