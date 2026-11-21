import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores, espacio } from '../theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  // true en pantallas con encabezado de navegación: el encabezado ya deja el espacio del notch,
  // así que no se agrega otra vez (si no, el contenido se ve más abajo).
  conEncabezado?: boolean;
};

// Contenedor de cada pantalla: fondo crema y márgenes que respetan el notch y la barra de inicio.
export default function Pantalla({ children, style, conEncabezado }: Props) {
  return (
    <SafeAreaView style={styles.fondo} edges={conEncabezado ? ['left', 'right'] : ['top', 'left', 'right']}>
      <View style={[styles.contenido, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flex: 1, padding: espacio.l },
});
