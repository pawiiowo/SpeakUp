# SpeakUp

Fila virtual para pedir la palabra en clase. El alumno pide participar desde su teléfono, ve su lugar en la fila
y recibe un aviso cuando es su turno; el docente ve la fila y da la palabra en orden de llegada. Busca que
participar sea más equitativo y reducir la ansiedad de levantar la mano.

Proyecto final de **Aplicaciones Móviles, UABC** · Paulina Mendoza Quiroz.

## Funciones
**Docente**
- Crea, edita y elimina clases. Cada vez que inicia una clase se genera un código nuevo y su QR.
- Comparte el código, ve la fila con nombres (se actualiza cada 3 s) y da la palabra al siguiente.
- Termina la clase: quien tenía la palabra cuenta como participación y la fila se vacía.

**Alumno**
- Entra a la clase de hoy escaneando el QR o escribiendo el código.
- Pide la palabra, ve su lugar sin ver los nombres de los demás y puede salir de la fila.
- Recibe vibración y una notificación cuando le toca.
- Consulta sus clases y el historial de sesiones con sus participaciones (paginado).

**Ambos:** registro con correo institucional `@uabc.edu.mx`, sesión que se recuerda al abrir la app y copia local
de las listas para verlas sin internet.

## Tecnologías
| Parte | Tecnologías |
|---|---|
| App | React Native con Expo SDK 58, TypeScript strict, React Navigation 7 (Stack + Tabs + Modal), axios |
| Funciones nativas | Compartir (`Share`), notificación local (`expo-notifications`), cámara para el QR (`expo-camera`) |
| Datos en el teléfono | `expo-secure-store` (token) y AsyncStorage (copia de listas) |
| Backend | Node.js con Express 5, JWT, bcryptjs, `pg` con consultas parametrizadas |
| Base de datos | PostgreSQL en Supabase |
| Build | EAS Build (APK de Android) |

Arquitectura cliente-servidor de 3 capas; detalles en [docs/arquitectura.md](docs/arquitectura.md).

## Estructura
```
SpeakUp/
├── backend/    API REST (Express) y esquema de la base de datos
├── frontend/   App móvil (Expo + TypeScript)
├── docs/       Documentación de la API y de la arquitectura
└── specs/      Specs (SDD), diario de decisiones y bitácora de IA
```

## Cómo correrlo

### Requisitos
- Node.js 22.18 o más nuevo.
- Un proyecto de PostgreSQL en Supabase (el plan gratis se pausa tras una semana sin uso: hay que darle
  **Restore** y esperar a que diga *Healthy*).
- Expo Go en el teléfono, en la misma red Wi-Fi que la computadora.

### 1. Backend
```
cd backend
npm install
```
Copia `backend/.env.example` como `backend/.env` y llena:
- `DATABASE_URL`: en Supabase, **Connect → Session pooler** (la conexión directa solo funciona con IPv6).
- `JWT_SECRET`: una cadena larga y aleatoria. Sin ella el servidor no arranca.

Crea las tablas (se puede correr varias veces sin borrar datos) y arranca el servidor:
```
node setupDb.js
node index.js
```
Debe decir `Servidor escuchando en el puerto 3000`.

### 2. App
```
cd frontend
npm install
```
Copia `frontend/.env.example` como `frontend/.env` y pon la IP de tu computadora en la red Wi-Fi
(en Windows: `ipconfig`, *Dirección IPv4*):
```
EXPO_PUBLIC_API_URL=http://TU-IP:3000/api
```
Arranca Expo:
```
npx expo start
```
- **Teléfono:** escanea el QR con la cámara (iPhone) o con Expo Go (Android).
- **Navegador:** presiona `w`. Sirve para probar el rol de docente en la computadora mientras el teléfono es el
  alumno.

## Pruebas
```
cd backend
npm test                  # 11 unitarias + 8 de integración de la API
npm run test:cobertura

cd frontend
npm test                  # 11 unitarias (validaciones y fechas)
npm run test:cobertura
npx tsc --noEmit          # TypeScript sin errores
```
Las pruebas de integración levantan el servidor y hacen peticiones HTTP reales, pero no usan la base de datos.

## APK de Android
Descarga: https://expo.dev/accounts/pawii.0/projects/speakup/builds/317a1691-d403-45d1-911c-b5c90805802e

El APK se conecta al backend en la red local (`http://192.168.1.81:3000/api`, configurado en
`frontend/eas.json`), así que solo funciona en la misma red Wi-Fi que la computadora con el backend encendido
(D36). Para generar otro:
```
cd frontend
eas build -p android --profile preview
```

## Documentación
| Documento | Contenido |
|---|---|
| [docs/api.md](docs/api.md) | Endpoints, cuerpos, respuestas y errores |
| [docs/arquitectura.md](docs/arquitectura.md) | Capas, decisiones de arquitectura y dónde está cada archivo |
| [specs/](specs/) | Specs del proyecto, navegación, modelo de datos y una por feature |
| [specs/decisiones.md](specs/decisiones.md) | Diario de decisiones |
| [specs/bitacora-ia.md](specs/bitacora-ia.md) | Bitácora de uso de IA |
