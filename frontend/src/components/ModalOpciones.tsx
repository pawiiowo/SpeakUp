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
  mensaje?: string;
  opciones: Opcion[];
};

type Props = {
  contenido: ContenidoModal | null;
  onCerrar: () => void;
};

// Modal con el estilo de la app (en lugar del menú del sistema). Aparece desde abajo, con un título,
// un mensaje opcional, botones de opciones y "Cancelar". Si contenido es null, no se muestra.
// Cada pantalla decide qué hace cada opción: cerrar el modal o cambiar su contenido (por ejemplo,
// pasar de las opciones a una confirmación sin cerrar y volver a abrir).
export default function ModalOpciones({ contenido, onCerrar }: Props) {
  return (
    <Modal visible={contenido !== null} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar} accessibilityLabel="Cerrar">
        {/* Este Pressable vacío evita que tocar la hoja la cierre. */}
        <Pressable style={styles.hoja} onPress={() => {}}>
          {contenido ? (
            <View>
              <Text style={styles.titulo}>{contenido.titulo}</Text>
              {contenido.mensaje ? <Text style={styles.mensaje}>{contenido.mensaje}</Text> : null}
              {contenido.opciones.map((opcion) => (
                <Boton
                  key={opcion.texto}
                  titulo={opcion.texto}
                  variante={opcion.variante ?? 'primario'}
                  onPress={opcion.onPress}
                  style={styles.opcion}
                />
              ))}
              <Pressable onPress={onCerrar} style={styles.cancelar} accessibilityRole="button">
                <Text style={styles.textoCancelar}>Cancelar</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(58, 50, 45, 0.55)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: colores.fondo,
    borderTopLeftRadius: radio.tarjeta,
    borderTopRightRadius: radio.tarjeta,
    padding: espacio.l,
    paddingBottom: espacio.xl,
  },
  titulo: { fontSize: 22, fontWeight: '800', color: colores.texto, textAlign: 'center' },
  mensaje: { color: colores.textoSuave, textAlign: 'center', marginTop: espacio.s, fontSize: 15 },
  opcion: { marginTop: espacio.m },
  cancelar: { marginTop: espacio.m, paddingVertical: espacio.s, alignItems: 'center' },
  textoCancelar: { color: colores.textoSuave, fontSize: 16, fontWeight: '600' },
});
