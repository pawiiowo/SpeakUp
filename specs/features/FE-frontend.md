# Frontend del sprint final (spec corta)

## Objetivo
Pantallas de la app móvil para el flujo principal: sesión, clases del docente y fila del alumno y del
docente. Base visual: prototipo de alta fidelidad en Figma ("IHC_YENIWIWI_SpeakUp", página "Alta fidelidad").

## Estilo (tomado del prototipo)
| Uso | Color |
|-----|-------|
| Fondo | `#FAF6EE` |
| Tarjetas y campos | `#EFEAE0` |
| Botón principal | `#D98A6C` |
| Texto | `#3A322D` |
| Contenedor de la fila | `#473D35` |
| Clase abierta ("Sesión activa") | `#5DAE5A` |
| Acción peligrosa ("Salir de la fila", "Cerrar clase") | `#A8322A` |

## Navegación (React Navigation 7)
- Sin sesión: `Login` → `Register`.
- Docente: tabs **Mis clases** y **Perfil**. Desde Mis clases: `ClassForm` (modal, crear o editar) y
  `TeacherSession` (código, QR y fila).
- Alumno: tabs **Unirse** y **Perfil**. Desde Unirse: `StudentQueue` (mi lugar en la fila).
- La sesión (token y usuario) vive en `AuthContext` y se guarda en SecureStore; al abrir la app se restaura.

## Pantallas y estados
| Pantalla | Cargando | Vacío | Error |
|----------|----------|-------|-------|
| Login / Register | Botón deshabilitado con "Entrando..." | — | Mensaje bajo el formulario |
| Mis clases | Indicador | "Aún no tienes clases" + botón | Mensaje + "Reintentar" |
| TeacherSession | Indicador | "Nadie ha pedido la palabra" | Aviso sin borrar la última fila |
| Unirse | Botón deshabilitado | — | Mensaje bajo el campo |
| StudentQueue | Indicador | "Nadie está esperando" | Aviso sin borrar el último estado |

## Casos límite
Sin internet o servidor caído (mensaje, nunca pantalla roja) · campos vacíos (botón deshabilitado) ·
texto largo (`maxLength`) · doble toque (botón deshabilitado mientras envía) · lista vacía · orientación
vertical fija · cerrar y volver a abrir la app (sesión guardada) · token expirado (vuelve a Login) ·
clase cerrada mientras el alumno espera (mensaje y regreso a Unirse).

## Tasks
- [x] FE01 — Agregar esta spec.
- [ ] FE02 — Tema y componentes base (`Pantalla`, `Boton`, `Campo`).
- [ ] FE03 — Servicio `api` (URL por variable de entorno, token desde SecureStore, mensajes de error).
- [ ] FE04 — `AuthContext`: iniciar sesión, cerrar sesión, restaurar al abrir y salir si llega un 401.
- [ ] FE05 — Navegación por rol.
- [ ] FE06 — Login y Registro con validación.
- [ ] FE07 — Perfil con cerrar sesión.
- [ ] FE08 — Mis clases (lista con estados).
- [ ] FE09 — Crear y editar clase (modal).
- [ ] FE10 — Sesión del docente: código, QR, fila cada 3 s, "Siguiente", cerrar y reabrir.
- [ ] FE11 — Unirse con código.
- [ ] FE12 — Mi lugar en la fila: posición cada 3 s, pedir la palabra y salir.
