import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Función nativa: notificación LOCAL. La lanza la propia app cuando detecta que al alumno le toca
// hablar; no es una push remota enviada por el servidor (esas no funcionan en Expo Go, D29).
const disponible = Platform.OS !== 'web';

// Con la app abierta, el sistema no muestra notificaciones a menos que se le indique.
// Aquí se pide mostrarla como banner y en el centro de notificaciones, con sonido.
if (disponible) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Pide el permiso solo si todavía se puede preguntar. Devuelve si la app puede notificar.
export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (!disponible) return false;
  try {
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;
    if (!actual.canAskAgain) return false;
    const respuesta = await Notifications.requestPermissionsAsync();
    return respuesta.granted;
  } catch {
    return false;
  }
}

export async function avisarTurno(materia: string): Promise<void> {
  if (!disponible) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: '¡Es tu turno!', body: `Tienes la palabra en ${materia}.` },
      trigger: null,
    });
  } catch {
    // Sin permiso no se muestra, pero la pantalla ya cambia a "¡Es tu turno!" y el teléfono vibra.
  }
}
