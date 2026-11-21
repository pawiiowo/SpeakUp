import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import api, { mensajeDeError } from '../../services/api';
import { AppStackParams } from '../../navigation/tipos';
import { colores, espacio, radio } from '../../theme';

type Props = NativeStackScreenProps<AppStackParams, 'QrScanner'>;

// Función nativa: cámara. El alumno apunta al QR que muestra o proyecta el docente y se une a la clase.
// Si niega el permiso, puede regresar y escribir el código a mano (01-navigation).
export default function QrScannerScreen({ navigation }: Props) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [uniendo, setUniendo] = useState(false);
  // La cámara detecta el mismo QR muchas veces por segundo: solo se procesa el primero.
  const procesando = useRef(false);

  const alEscanear = async ({ data }: BarcodeScanningResult) => {
    if (procesando.current) return;
    procesando.current = true;

    const codigo = data.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(codigo)) {
      setError('Ese QR no es de una clase de SpeakUp.');
      return;
    }

    setUniendo(true);
    try {
      const { data: respuesta } = await api.post<{ clase: { id: number; materia: string } }>('/clases/unirse', { codigo });
      navigation.replace('StudentQueue', { claseId: respuesta.clase.id, materia: respuesta.clase.materia });
    } catch (e) {
      setError(mensajeDeError(e));
      setUniendo(false);
    }
  };

  const volverAEscanear = () => {
    setError(null);
    procesando.current = false;
  };

  // El permiso todavía se está consultando.
  if (!permiso) {
    return (
      <Pantalla style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </Pantalla>
    );
  }

  if (!permiso.granted) {
    return (
      <Pantalla style={styles.centro}>
        <Text style={styles.titulo}>Permiso de cámara</Text>
        <Text style={styles.mensaje}>
          SpeakUp usa la cámara solo para leer el QR de tu clase. También puedes escribir el código a mano.
        </Text>
        {permiso.canAskAgain ? (
          <Boton titulo="Permitir cámara" onPress={pedirPermiso} style={styles.boton} />
        ) : (
          <Boton titulo="Abrir configuración" onPress={() => Linking.openSettings()} style={styles.boton} />
        )}
        <Boton titulo="Escribir el código" variante="secundario" onPress={() => navigation.goBack()} style={styles.boton} />
      </Pantalla>
    );
  }

  return (
    <View style={styles.contenedor}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={error || uniendo ? undefined : alEscanear}
      />
      <View style={styles.capa}>
        <Text style={styles.instruccion}>Apunta al QR de tu clase</Text>
        <View style={styles.marco} />
        {uniendo ? <ActivityIndicator size="large" color={colores.blanco} /> : null}
        {error ? (
          <View style={styles.tarjetaError}>
            <Text style={styles.textoError}>{error}</Text>
            <Boton titulo="Volver a escanear" onPress={volverAEscanear} style={styles.boton} />
          </View>
        ) : null}
        <Boton titulo="Escribir el código" variante="secundario" onPress={() => navigation.goBack()} style={styles.cerrar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000' },
  centro: { justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 28, fontWeight: '800', color: colores.texto, textAlign: 'center' },
  mensaje: { color: colores.textoSuave, fontSize: 16, textAlign: 'center', marginVertical: espacio.l },
  boton: { alignSelf: 'stretch', marginTop: espacio.m },
  capa: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: espacio.l, gap: espacio.l },
  instruccion: { color: colores.blanco, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  marco: { width: 240, height: 240, borderRadius: radio.tarjeta, borderWidth: 4, borderColor: colores.primario },
  tarjetaError: { backgroundColor: colores.fondo, borderRadius: radio.tarjeta, padding: espacio.l, alignSelf: 'stretch' },
  textoError: { color: colores.peligro, fontSize: 16, textAlign: 'center' },
  cerrar: { position: 'absolute', bottom: espacio.xl, left: espacio.l, right: espacio.l },
});
