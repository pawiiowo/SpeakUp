import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Dónde se guarda la sesión. En el teléfono usa SecureStore (cifrado por el sistema).
// En el navegador, que solo se usa para probar el rol de docente en la laptop, SecureStore
// no existe, así que usa el almacenamiento del navegador (localStorage).
type AlmacenWeb = {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
};

const web = (globalThis as unknown as { localStorage?: AlmacenWeb }).localStorage;
const esWeb = Platform.OS === 'web';

export async function guardar(clave: string, valor: string): Promise<void> {
  if (esWeb) return web?.setItem(clave, valor);
  await SecureStore.setItemAsync(clave, valor);
}

export async function leer(clave: string): Promise<string | null> {
  if (esWeb) return web?.getItem(clave) ?? null;
  return SecureStore.getItemAsync(clave);
}

export async function borrar(clave: string): Promise<void> {
  if (esWeb) return web?.removeItem(clave);
  await SecureStore.deleteItemAsync(clave);
}
