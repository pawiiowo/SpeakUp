import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colores, espacio, radio } from '../theme';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  cargando?: boolean;
  style?: ViewStyle;
};

const fondos: Record<Variante, string> = {
  primario: colores.primario,
  secundario: colores.texto,
  peligro: colores.peligro,
};

// Botón con forma de píldora. Mientras "cargando" es true muestra un indicador y no se puede
// presionar otra vez: así se evita enviar el mismo formulario dos veces (doble toque).
export default function Boton({ titulo, onPress, variante = 'primario', deshabilitado, cargando, style }: Props) {
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: fondos[variante] },
        inactivo && styles.inactivo,
        pressed && styles.presionado,
        style,
      ]}
    >
      {cargando ? <ActivityIndicator color={colores.blanco} /> : <Text style={styles.texto}>{titulo}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 48,
    borderRadius: radio.boton,
    paddingHorizontal: espacio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { color: colores.blanco, fontSize: 16, fontWeight: '700' },
  inactivo: { opacity: 0.5 },
  presionado: { opacity: 0.8 },
});
