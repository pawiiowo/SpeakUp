import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api, { CLAVE_TOKEN, CLAVE_USUARIO, registrarAlExpirarSesion } from '../services/api';
import { Rol, Usuario } from '../types';

type AuthValor = {
  usuario: Usuario | null;
  restaurando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (datos: { nombre: string; email: string; password: string; rol: Rol }) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthValor | null>(null);

// Estado global de la sesión. Cualquier pantalla puede saber quién inició sesión con useAuth(),
// sin pasar el usuario de pantalla en pantalla.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [restaurando, setRestaurando] = useState(true);
  const avisoMostrado = useRef(false);

  const cerrarSesion = useCallback(async () => {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
    await SecureStore.deleteItemAsync(CLAVE_USUARIO);
    setUsuario(null);
  }, []);

  // Al abrir la app, recupera la sesión guardada para no pedir el login cada vez.
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(CLAVE_TOKEN);
        const guardado = await SecureStore.getItemAsync(CLAVE_USUARIO);
        if (token && guardado) setUsuario(JSON.parse(guardado) as Usuario);
      } catch {
        await cerrarSesion();
      } finally {
        setRestaurando(false);
      }
    })();
  }, [cerrarSesion]);

  // Si el backend responde 401, la sesión expiró: se avisa una sola vez y se vuelve al Login.
  useEffect(() => {
    registrarAlExpirarSesion(() => {
      if (avisoMostrado.current) return;
      avisoMostrado.current = true;
      cerrarSesion().finally(() => {
        Alert.alert('Tu sesión expiró', 'Vuelve a iniciar sesión.', [
          { text: 'Entendido', onPress: () => (avisoMostrado.current = false) },
        ]);
      });
    });
    return () => registrarAlExpirarSesion(null);
  }, [cerrarSesion]);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, password });
    await SecureStore.setItemAsync(CLAVE_TOKEN, data.token);
    await SecureStore.setItemAsync(CLAVE_USUARIO, JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }, []);

  // Registra la cuenta y, si sale bien, inicia sesión con los mismos datos.
  const registrarse = useCallback(
    async (datos: { nombre: string; email: string; password: string; rol: Rol }) => {
      await api.post('/auth/register', datos);
      await iniciarSesion(datos.email, datos.password);
    },
    [iniciarSesion]
  );

  return (
    <AuthContext.Provider value={{ usuario, restaurando, iniciarSesion, registrarse, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext);
  if (!valor) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return valor;
}
