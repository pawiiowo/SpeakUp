import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistencia local (D34): guarda la última copia de una lista para mostrarla sin internet.
// Todas las claves empiezan con "cache:" para poder borrarlas juntas al cerrar sesión.
const PREFIJO = 'cache:';

export type Copia<T> = { datos: T; guardado: number };

export async function guardarEnCache<T>(clave: string, datos: T): Promise<void> {
  try {
    const copia: Copia<T> = { datos, guardado: Date.now() };
    await AsyncStorage.setItem(PREFIJO + clave, JSON.stringify(copia));
  } catch {
    // Si no se puede guardar, la app sigue funcionando; solo no habrá copia sin internet.
  }
}

export async function leerDeCache<T>(clave: string): Promise<Copia<T> | null> {
  try {
    const texto = await AsyncStorage.getItem(PREFIJO + clave);
    return texto ? (JSON.parse(texto) as Copia<T>) : null;
  } catch {
    return null;
  }
}

// Se llama al cerrar sesión, para que otra cuenta en el mismo teléfono no vea estos datos.
export async function borrarCache(): Promise<void> {
  try {
    const claves = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(claves.filter((clave) => clave.startsWith(PREFIJO)));
  } catch {
    // Nada que hacer: en el peor caso queda una copia vieja que se reemplaza en la siguiente carga.
  }
}
