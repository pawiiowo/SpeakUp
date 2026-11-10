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
El alumno se une a la clase con un código o QR, pide la palabra y ve su posición exacta
en una fila virtual. El docente ve la fila en tiempo real y decide cuándo dar la palabra,
pasar al siguiente o pausar.

## Principio central: privacidad en la fila
- Solo el **docente** ve los nombres de los alumnos en la fila, en su propio dispositivo.
- Un **alumno** solo ve su propia posición (p. ej. "Eres el #3") y el estado de la fila.
  Nunca ve nombres de otros alumnos.
- El docente puede **proyectar** la fila en el salón. La vista proyectada es **anónima**:
  muestra turnos sin nombres.
- Toda feature nueva debe respetar este principio.

## MVP
| ID  | Feature                                              | Actor   | Estado actual |
|-----|------------------------------------------------------|---------|---------------|
| F01 | Registro de usuario (alumno/docente)                 | Ambos   | Implementado (JS, falta pasar a TS) |
| F02 | Inicio y cierre de sesión persistente                | Ambos   | Parcial (no navega después del login, no hay logout) |
| F03 | Gestionar clases (crear, listar, editar, cerrar) + QR | Docente | Parcial (crear y listar en backend) |
| F04 | Unirse a clase (código manual o QR)                  | Alumno  | Solo backend |
| F05 | Pedir / cancelar la palabra y ver mi posición        | Alumno  | Pendiente |
| F06 | Moderar la fila (dar palabra, siguiente, pausar) + vista de proyección anónima | Docente | Pendiente |
| F07 | Aviso de turno (vibración + notificación)            | Alumno  | Pendiente |
| F08 | Historial de participación (lista paginada)          | Ambos   | Pendiente |

## Funcionalidades futuras
- Estadísticas de participación por alumno para el docente.
- Preguntas escritas anónimas.
- Modo oscuro y accesibilidad (bonus del curso).

## Requisitos del curso (no funcionales)
- Navegación con Stack + Tabs + Modal (mínimo 5 pantallas).
- Estado global con Context API.
- TypeScript en modo strict (migrar pantallas `.js` a `.tsx`).
- 12+ pruebas unitarias y 4+ de integración.
- README, diagrama de arquitectura, documentación de la API, `.env.example`, build con EAS.
- Diario de decisiones en `specs/decisiones.md`.

## Restricciones técnicas (ya decididas)
- Frontend: React Native + Expo SDK 57, React Navigation, React Native Paper.
- Backend: Node.js + Express 5, Socket.io.
- Base de datos: PostgreSQL en Supabase.
- Pruebas en dispositivo físico con Expo Go.