import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme';

// Logo de la app: la mano levantada dentro de un cuadro redondeado, como en el prototipo.
export default function Logo({ tamano = 120 }: { tamano?: number }) {
  return (
    <View style={[styles.cuadro, { width: tamano, height: tamano, borderRadius: tamano * 0.28 }]}>
      <Text style={{ fontSize: tamano * 0.5 }} accessibilityLabel="Logo de SpeakUp">
        ✋
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cuadro: {
    borderWidth: 6,
    borderColor: colores.texto,
    backgroundColor: colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
