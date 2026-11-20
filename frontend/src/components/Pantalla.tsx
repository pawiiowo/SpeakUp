import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores, espacio } from '../theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

// Contenedor de cada pantalla: fondo crema y márgenes que respetan el notch y la barra de inicio.
export default function Pantalla({ children, style }: Props) {
  return (
    <SafeAreaView style={styles.fondo} edges={['top', 'left', 'right']}>
      <View style={[styles.contenido, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flex: 1, padding: espacio.l },
});
