import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colores, espacio, radio } from '../theme';

type Props = TextInputProps & {
  etiqueta: string;
  error?: string | null;
  ayuda?: string;
};

// Campo de texto con etiqueta arriba y, abajo, un mensaje de ayuda o de error.
// Por defecto limita el texto a 100 caracteres para evitar textos larguísimos.
export default function Campo({ etiqueta, error, ayuda, maxLength = 100, style, ...resto }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...resto}
        maxLength={maxLength}
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSuave}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: espacio.m },
  etiqueta: { color: colores.texto, fontWeight: '600', marginBottom: espacio.xs },
  input: {
    backgroundColor: colores.superficie,
    borderRadius: radio.campo,
    paddingHorizontal: espacio.m,
    paddingVertical: 12,
    fontSize: 16,
    color: colores.texto,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: { borderColor: colores.peligro },
  error: { color: colores.peligro, marginTop: espacio.xs, fontSize: 13 },
  ayuda: { color: colores.textoSuave, marginTop: espacio.xs, fontSize: 13 },
});
