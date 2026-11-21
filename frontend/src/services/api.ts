import axios, { isAxiosError } from 'axios';
import { leer } from './almacenamiento';

// La URL del backend viene del archivo .env (ver .env.example). Debe ser la IP de la
// computadora en la red Wi-Fi, no "localhost": el celular es otro dispositivo.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.186:3000/api';

// Claves donde se guarda la sesión (ver almacenamiento.ts).
export const CLAVE_TOKEN = 'speakup_token';
export const CLAVE_USUARIO = 'speakup_usuario';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// Antes de cada petición, agrega el token guardado (si hay sesión).
api.interceptors.request.use(async (config) => {
  const token = await leer(CLAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthContext registra aquí qué hacer cuando el backend responde 401 (token inválido o expirado).
let alExpirarSesion: (() => void) | null = null;

export function registrarAlExpirarSesion(funcion: (() => void) | null) {
  alExpirarSesion = funcion;
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401 && alExpirarSesion) {
      alExpirarSesion();
    }
    return Promise.reject(error);
  }
);

// Convierte cualquier error de una petición en un mensaje claro para el usuario.
export function mensajeDeError(error: unknown): string {
  if (isAxiosError(error)) {
    const mensajeDelServidor = (error.response?.data as { error?: string } | undefined)?.error;
    if (mensajeDelServidor) return mensajeDelServidor;
    if (!error.response) return 'No se pudo conectar. Revisa tu internet e intenta de nuevo.';
  }
  return 'Ocurrió un error. Intenta de nuevo.';
}

export default api;
