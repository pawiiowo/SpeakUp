import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Boton from './Boton';
import { colores, espacio, radio } from '../theme';

export type Opcion = {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
};

export type ContenidoModal = {
  titulo: string;
  // Línea pegada al título (por ejemplo, el día y horario de una sesión). Separa el encabezado del contenido.
  subtitulo?: string;
  mensaje?: string;
  // Número grande dentro de un círculo verde (por ejemplo, participaciones en una sesión).
  destacado?: string;
  // Texto debajo del número destacado.
  pie?: string;
  opciones: Opcion[];
  // Oculta "Cancelar" cuando una de las opciones ya sirve para cerrar.
  sinCancelar?: boolean;
};

type Props = {
  contenido: ContenidoModal | null;
  onCerrar: () => void;
};

// Modal con el estilo de la app (en lugar del menú del sistema). Flota en medio de la pantalla, con un título,
// un mensaje opcional, botones de opciones y "Cancelar". Si contenido es null, no se muestra.
// Cada pantalla decide qué hace cada opción: cerrar el modal o cambiar su contenido (por ejemplo,
// pasar de las opciones a una confirmación sin cerrar y volver a abrir).
export default function ModalOpciones({ contenido, onCerrar }: Props) {
  return (
    <Modal visible={contenido !== null} transparent animationType="fade" onRequestClose={onCerrar}>
      {/* Tocar fuera del modal no lo cierra: solo se cierra con sus botones, para no perder una acción por accidente. */}
      <View style={styles.fondo}>
        <View style={styles.hoja}>
          {contenido ? (
            <View>
              <Text style={styles.titulo} numberOfLines={2}>{contenido.titulo}</Text>
              {contenido.subtitulo ? <Text style={styles.subtitulo}>{contenido.subtitulo}</Text> : null}
              {contenido.mensaje ? (
                <Text style={[styles.mensaje, contenido.subtitulo ? styles.mensajeSeparado : null]}>{contenido.mensaje}</Text>
              ) : null}
              {contenido.destacado ? (
                <View style={styles.destacado}>
                  <Text style={styles.textoDestacado}>{contenido.destacado}</Text>
                </View>
              ) : null}
              {contenido.pie ? <Text style={styles.pie}>{contenido.pie}</Text> : null}
              <View style={contenido.destacado ? styles.opcionesConDestacado : styles.opciones}>
                {contenido.opciones.map((opcion) => (
                  <Boton
                    key={opcion.texto}
                    titulo={opcion.texto}
                    variante={opcion.variante ?? 'primario'}
                    onPress={opcion.onPress}
                    style={styles.opcion}
                  />
                ))}
              </View>
              {contenido.sinCancelar ? null : (
                <Pressable onPress={onCerrar} style={styles.cancelar} accessibilityRole="button">
                  <Text style={styles.textoCancelar}>Cancelar</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(58, 50, 45, 0.55)',
    justifyContent: 'center',
    padding: espacio.l,
  },
  hoja: {
    backgroundColor: colores.fondo,
    borderRadius: radio.tarjeta,
    paddingVertical: espacio.xl,
    paddingHorizontal: espacio.l,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  titulo: { fontSize: 22, fontWeight: '800', color: colores.texto, textAlign: 'center' },
  subtitulo: { color: colores.textoSuave, textAlign: 'center', marginTop: espacio.xs, fontSize: 15, lineHeight: 22 },
  mensaje: { color: colores.textoSuave, textAlign: 'center', marginTop: espacio.s, fontSize: 15 },
  // Con subtítulo, el mensaje se separa más para que el encabezado y el contenido se lean como dos bloques.
  mensajeSeparado: { marginTop: espacio.xl },
  opciones: { marginTop: espacio.s },
  // Con un número destacado, el mismo espacio arriba y abajo de su grupo para que quede en medio de la ventana.
  opcionesConDestacado: { marginTop: espacio.m },
  opcion: { marginTop: espacio.m },
  destacado: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.activo,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: espacio.m,
  },
  // Sin el espacio extra que Android agrega arriba del texto y con números del mismo ancho,
  // para que el número quede en el centro exacto del círculo.
  textoDestacado: {
    color: colores.blanco,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  pie: { fontSize: 18, fontWeight: '700', color: colores.texto, textAlign: 'center', marginTop: espacio.m },
  cancelar: { marginTop: espacio.m, paddingVertical: espacio.s, alignItems: 'center' },
  textoCancelar: { color: colores.textoSuave, fontSize: 16, fontWeight: '600' },
});
