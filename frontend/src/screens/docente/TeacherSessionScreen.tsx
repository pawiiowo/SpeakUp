import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import ModalOpciones, { ContenidoModal } from '../../components/ModalOpciones';
import api, { mensajeDeError } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { AppStackParams } from '../../navigation/tipos';
import { FilaDocente } from '../../types';
import { colores, espacio, radio } from '../../theme';

type Props = NativeStackScreenProps<AppStackParams, 'TeacherSession'>;

// Pantalla del docente durante la clase: código y QR para unirse, quién habla, la fila con
// nombres (solo el docente los ve, D08) y los botones para dar la palabra y terminar la clase.
export default function TeacherSessionScreen({ route, navigation }: Props) {
  const { claseId } = route.params;
  const [fila, setFila] = useState<FilaDocente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [dialogo, setDialogo] = useState<ContenidoModal | null>(null);

  const consultar = useCallback(async () => {
    try {
      const { data } = await api.get<FilaDocente>(`/clases/${claseId}/fila`);
      setFila(data);
      setError(null);
    } catch (e) {
      // Se conserva la última fila en pantalla y solo se muestra el aviso.
      setError(mensajeDeError(e));
    }
  }, [claseId]);

  usePolling(consultar);

  const darLaPalabra = async () => {
    setProcesando(true);
    try {
      const { data } = await api.post<FilaDocente>(`/clases/${claseId}/fila/siguiente`);
      setFila(data);
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setProcesando(false);
    }
  };

  // Función nativa: abre el menú del sistema para mandar el código (WhatsApp, mensajes, correo...).
  const compartir = () => {
    if (!fila) return;
    Share.share({
      message: `Únete a la clase "${fila.clase.materia}" en SpeakUp con el código ${fila.clase.codigo}`,
    }).catch(() => {
      // Si el dispositivo no puede compartir (por ejemplo, algunos navegadores), no pasa nada.
    });
  };

  const confirmarTermino = () =>
    setDialogo({
      titulo: '¿Terminar la clase?',
      mensaje: 'Los alumnos en espera saldrán de la fila y el código dejará de funcionar.',
      opciones: [
        {
          texto: 'Terminar clase',
          variante: 'peligro',
          onPress: async () => {
            setDialogo(null);
            try {
              await api.patch(`/clases/${claseId}/cerrar`);
              navigation.goBack();
            } catch (e) {
              setError(mensajeDeError(e));
            }
          },
        },
      ],
    });

  if (!fila) {
    return (
      <Pantalla conEncabezado style={styles.centro}>
        {error ? (
          <>
            <Text style={styles.mensaje}>{error}</Text>
            <Boton titulo="Reintentar" onPress={consultar} />
          </>
        ) : (
          <ActivityIndicator size="large" color={colores.primario} />
        )}
      </Pantalla>
    );
  }

  if (!fila.clase.activa) {
    return (
      <Pantalla conEncabezado style={styles.centro}>
        <Text style={styles.mensaje}>Esta clase ya terminó.</Text>
        <Boton titulo="Volver a mis clases" onPress={() => navigation.goBack()} />
      </Pantalla>
    );
  }

  const hayEspera = fila.en_espera.length > 0;
  // El texto del botón principal cambia según lo que va a pasar al presionarlo.
  const textoAccion = fila.hablando ? (hayEspera ? 'Siguiente' : 'Terminar participación') : 'Dar la palabra';

  return (
    <Pantalla conEncabezado style={styles.sinPadding}>
      <ScrollView contentContainerStyle={styles.contenido}>
        {error ? <Text style={styles.aviso}>{error}</Text> : null}

        <View style={styles.tarjetaCodigo}>
          <Text style={styles.etiqueta}>Código de la clase</Text>
          <Text style={styles.codigo} accessibilityLabel={`Código ${fila.clase.codigo.split('').join(' ')}`}>
            {fila.clase.codigo}
          </Text>
          <View style={styles.qr}>
            <QRCode value={fila.clase.codigo} size={170} color={colores.texto} backgroundColor={colores.blanco} />
          </View>
          <Boton titulo="Compartir código" variante="secundario" onPress={compartir} style={styles.compartir} />
        </View>

        <Text style={styles.seccion}>Tiene la palabra</Text>
        <View style={[styles.hablando, fila.hablando && styles.hablandoActivo]}>
          <Text style={[styles.nombreHablando, !fila.hablando && styles.textoSuave]}>
            {fila.hablando ? fila.hablando.nombre : 'Nadie tiene la palabra'}
          </Text>
        </View>

        <Text style={styles.seccion}>
          {hayEspera ? `En espera (${fila.en_espera.length})` : 'En espera'}
        </Text>
        <View style={styles.fila}>
          {hayEspera ? (
            fila.en_espera.map((turno) => (
              <View key={turno.turno_id} style={styles.turno}>
                <Text style={styles.posicion}>#{turno.posicion}</Text>
                <Text style={styles.nombre} numberOfLines={1}>{turno.nombre}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.vacio}>Nadie ha pedido la palabra</Text>
          )}
        </View>

        <Boton
          titulo={textoAccion}
          onPress={darLaPalabra}
          cargando={procesando}
          deshabilitado={!fila.hablando && !hayEspera}
          style={styles.accion}
        />
        <Boton titulo="Terminar clase" variante="peligro" onPress={confirmarTermino} />
      </ScrollView>

      <ModalOpciones contenido={dialogo} onCerrar={() => setDialogo(null)} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  sinPadding: { padding: 0 },
  contenido: { padding: espacio.l, paddingBottom: espacio.xl },
  centro: { justifyContent: 'center', alignItems: 'center', gap: espacio.m },
  mensaje: { color: colores.textoSuave, fontSize: 16, textAlign: 'center' },
  aviso: {
    backgroundColor: colores.superficie,
    color: colores.peligro,
    borderRadius: radio.campo,
    padding: espacio.m,
    marginBottom: espacio.m,
    textAlign: 'center',
  },
  tarjetaCodigo: {
    backgroundColor: colores.superficie,
    borderRadius: radio.tarjeta,
    padding: espacio.l,
    alignItems: 'center',
  },
  etiqueta: { color: colores.textoSuave, fontWeight: '600' },
  codigo: { fontSize: 44, fontWeight: '800', letterSpacing: 6, color: colores.texto, marginVertical: espacio.s },
  qr: { backgroundColor: colores.blanco, padding: espacio.m, borderRadius: radio.campo },
  compartir: { marginTop: espacio.m, alignSelf: 'stretch' },
  seccion: { fontSize: 18, fontWeight: '700', color: colores.texto, marginTop: espacio.l, marginBottom: espacio.s },
  hablando: {
    backgroundColor: colores.superficie,
    borderRadius: radio.tarjeta,
    padding: espacio.l,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hablandoActivo: { backgroundColor: colores.blanco, borderColor: colores.primario },
  nombreHablando: { fontSize: 20, fontWeight: '700', color: colores.texto, textAlign: 'center' },
  textoSuave: { color: colores.textoSuave, fontWeight: '400' },
  fila: { backgroundColor: colores.fila, borderRadius: radio.tarjeta, padding: espacio.m, gap: espacio.s },
  turno: {
    backgroundColor: colores.superficie,
    borderRadius: radio.campo,
    paddingVertical: espacio.m,
    paddingHorizontal: espacio.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  posicion: { fontWeight: '800', color: colores.texto, width: 44 },
  nombre: { flex: 1, color: colores.texto, fontSize: 16 },
  vacio: { color: colores.superficie, textAlign: 'center', paddingVertical: espacio.m },
  accion: { marginTop: espacio.l, marginBottom: espacio.m },
});
