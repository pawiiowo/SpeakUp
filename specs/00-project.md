# SpeakUp

## Nombre
SpeakUp.

## Problema
En clases presenciales o híbridas, muchos estudiantes no participan por miedo a la burla,
presión social o ansiedad de hablar en público. Además, al levantar la mano no saben
cuándo les tocará hablar, y el docente suele dar la palabra a los mismos alumnos extrovertidos.

## Usuario objetivo
- **Principal — Alumno:** estudiante universitario en clase presencial/híbrida que quiere
  participar, pero le genera ansiedad levantar la mano frente al grupo.
- **Secundario — Docente:** profesor que quiere moderar la participación de forma ordenada
  y equitativa durante la clase.

## Propuesta de solución
Una app móvil que reemplaza "levantar la mano" por una solicitud digital discreta.
El alumno entra a la clase de hoy con el QR o el código, pide la palabra y ve su posición
exacta en una fila virtual. El docente ve la fila (se actualiza cada 3 segundos) y da la
palabra al siguiente en orden de llegada.

## Principio central: privacidad en la fila
- Solo el **docente** ve los nombres de los alumnos en la fila, en su propio dispositivo.
- Un **alumno** solo ve su propia posición (p. ej. "Eres el #3") y el estado de la fila.
  Nunca ve nombres de otros alumnos.
- Una futura vista para **proyectar** la fila en el salón tendría que ser **anónima**: turnos
  sin nombres. La pantalla actual del docente muestra nombres, así que no es para proyectar.
- Toda feature nueva debe respetar este principio.

## MVP
El alcance cambió durante el sprint final: F07 y F08 se habían dejado fuera (D23), pero se
agregaron después (D28, D29). Estado al 21 de noviembre de 2026:

| ID  | Feature                                              | Actor   | Estado | Spec |
|-----|------------------------------------------------------|---------|--------|------|
| F01 | Registro con correo institucional (D11)              | Ambos   | Terminado | FE-frontend |
| F02 | Inicio y cierre de sesión persistente                | Ambos   | Terminado | FE-frontend |
| F03 | Gestionar clases (crear, listar, editar, iniciar, terminar, eliminar) + QR | Docente | Terminado | F03 |
| F04 | Entrar a la clase de hoy con QR o código (D32)       | Alumno  | Terminado | F05, F08 |
| F05 | Pedir / cancelar la palabra y ver mi posición        | Alumno  | Terminado | F05 |
| F06 | Moderar la fila (dar la palabra al siguiente)        | Docente | Terminado | F05 |
| F07 | Aviso de turno (vibración + notificación local)      | Alumno  | Terminado (D29) | F05, FE-frontend |
| F08 | Historial de participación del alumno (paginado)     | Alumno  | Terminado (D28, D33) | F08 |

Las features sin spec propia (F01, F02, F04, F06, F07) quedaron dentro de otras specs porque
son parte del mismo flujo.

## Funcionalidades futuras
- Vista de proyección anónima y pausar la fila (la columna `fila_pausada` ya existe, pero no se usa).
- Historial de participación para el docente.
- Actualización en tiempo real con Socket.io en lugar de polling (D22).
- Estadísticas de participación por alumno para el docente.
- Preguntas escritas anónimas.
- Modo oscuro y accesibilidad (bonus del curso).

## Requisitos del curso (no funcionales)
- Navegación con Stack + Tabs + Modal (mínimo 5 pantallas).
- Estado global con Context API.
- TypeScript en modo strict.
- 12+ pruebas unitarias y 4+ de integración.
- README, diagrama de arquitectura, documentación de la API, `.env.example`, build con EAS.
- Diario de decisiones en `specs/decisiones.md`.

Todos están cubiertos; ver la sección "Pruebas" del README.

## Restricciones técnicas (ya decididas)
- Frontend: React Native + Expo SDK 58 (D26), TypeScript, React Navigation 7 y componentes
  propios con el estilo del prototipo de Figma en lugar de React Native Paper (D25).
- Backend: Node.js + Express 5 (API REST); la fila se actualiza con polling (D22).
- Base de datos: PostgreSQL en Supabase.
- Pruebas en dispositivo físico (iPhone) con Expo Go, el rol docente en la versión web y un
  emulador de Android; build final de EAS para Android como APK (D24, D36).
- Funciones nativas: compartir, notificación local y cámara para leer el QR (D29).