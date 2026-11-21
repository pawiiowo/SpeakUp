import { Image, StyleSheet } from 'react-native';

// Logo de SpeakUp (mano levantada), tomado del prototipo de Figma.
export default function Logo({ tamano = 140 }: { tamano?: number }) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[styles.logo, { width: tamano, height: tamano }]}
      resizeMode="contain"
      accessibilityLabel="Logo de SpeakUp"
    />
  );
}

const styles = StyleSheet.create({
  logo: { alignSelf: 'center' },
});
