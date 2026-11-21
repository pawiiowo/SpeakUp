import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import ModalOpciones, { ContenidoModal } from '../../components/ModalOpciones';
import api, { mensajeDeError } from '../../services/api';
import { etiquetaDeFecha } from '../../utils/fechas';
import { AppStackParams } from '../../navigation/tipos';
import { PaginaSesiones, SesionHistorial } from '../../types';
import { colores, espacio, radio } from '../../theme';

type Props = NativeStackScreenProps<AppStackParams, 'ClassHistory'>;

const POR_PAGINA = 10;

// Historial de sesiones de una clase (pantalla "Lista de sesiones" del prototipo).
// Es una FlatList paginada: carga 10 sesiones y pide las siguientes al llegar al final (F08).
export default function ClassHistoryScreen({ route, navigation }: Props) {
  const { claseId, materia } = route.params;
  const [sesiones, setSesiones] = useState<SesionHistorial[]>([]);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<ContenidoModal | null>(null);

  const pedirPagina = useCallback(
    async (numero: number) => {
      const { data } = await api.get<PaginaSesiones>(`/alumno/clases/${claseId}/sesiones`, {
        params: { pagina: numero, limite: POR_PAGINA },
      });
      return data;
    },
    [claseId]
  );

  // Carga (o recarga) desde la primera página.
  const cargarInicio = useCallback(async () => {
    try {
      const data = await pedirPagina(1);
      setSesiones(data.sesiones);
      setHayMas(data.hay_mas);
      setPagina(1);
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [pedirPagina]);

  useFocusEffect(
    useCallback(() => {
      cargarInicio();
    }, [cargarInicio])
  );

  // Se llama al llegar al final de la lista. No pide otra página si ya está cargando o no hay más.
  const cargarMas = async () => {
    if (!hayMas || cargandoMas) return;
    setCargandoMas(true);
    try {
      const data = await pedirPagina(pagina + 1);
      setSesiones((actuales) => [...actuales, ...data.sesiones]);
      setHayMas(data.hay_mas);
      setPagina(pagina + 1);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargandoMas(false);
    }
  };

  const abrir = (sesion: SesionHistorial) => {
    if (sesion.en_curso) {
      navigation.navigate('StudentQueue', { claseId, materia });
      return;
    }
    setDialogo({
      titulo: `Sesión ${sesion.numero}`,
      mensaje: 'En esta sesión realizaste:',
      destacado: String(sesion.participaciones),
      pie: sesion.participaciones === 1 ? 'participación' : 'participaciones',
      opciones: [{ texto: 'Regresar a las sesiones', onPress: () => setDialogo(null) }],
      sinCancelar: true,
    });
  };

  const renderSesion = ({ item, index }: { item: SesionHistorial; index: number }) => {
    const etiqueta = etiquetaDeFecha(item.fecha_inicio);
    const anterior = index > 0 ? etiquetaDeFecha(sesiones[index - 1].fecha_inicio) : null;
    return (
      <View>
        {etiqueta !== anterior ? <Text style={styles.grupo}>{etiqueta}</Text> : null}
        <Pressable
          onPress={() => abrir(item)}
          accessibilityRole="button"
          accessibilityLabel={`Sesión ${item.numero}${item.en_curso ? ', en curso' : ''}`}
          style={({ pressed }) => [styles.sesion, item.en_curso && styles.sesionEnCurso, pressed && styles.presionada]}
        >
          {item.en_curso ? <View style={styles.punto} /> : null}
          <Text style={[styles.textoSesion, item.en_curso && styles.textoEnCurso]}>Sesión {item.numero}</Text>
        </Pressable>
      </View>
    );
  };

  if (cargando) {
    return (
      <Pantalla conEncabezado style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </Pantalla>
    );
  }

  return (
    <Pantalla conEncabezado>
      {error && sesiones.length > 0 ? <Text style={styles.aviso}>{error}</Text> : null}
      <View style={styles.panel}>
        {error && sesiones.length === 0 ? (
          <View style={styles.centro}>
            <Text style={styles.mensaje}>{error}</Text>
            <Boton titulo="Reintentar" onPress={() => { setCargando(true); cargarInicio(); }} />
          </View>
        ) : (
          <FlatList
            data={sesiones}
            keyExtractor={(sesion) => String(sesion.id)}
            renderItem={renderSesion}
            onEndReached={cargarMas}
            onEndReachedThreshold={0.3}
            contentContainerStyle={sesiones.length === 0 ? styles.centro : styles.lista}
            refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargarInicio(); }} />}
            ListEmptyComponent={<Text style={styles.mensaje}>Todavía no hay sesiones de esta clase.</Text>}
            ListFooterComponent={cargandoMas ? <ActivityIndicator color={colores.primario} style={styles.pie} /> : null}
          />
        )}
      </View>
      <ModalOpciones contenido={dialogo} onCerrar={() => setDialogo(null)} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  centro: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: espacio.m },
  mensaje: { color: colores.textoSuave, fontSize: 16, textAlign: 'center' },
  aviso: {
    backgroundColor: colores.superficie,
    color: colores.peligro,
    borderRadius: radio.campo,
    padding: espacio.m,
    marginBottom: espacio.m,
    textAlign: 'center',
  },
  panel: { flex: 1, backgroundColor: colores.superficie, borderRadius: radio.tarjeta, padding: espacio.m },
  lista: { paddingBottom: espacio.l },
  grupo: { color: colores.textoSuave, fontWeight: '600', marginTop: espacio.m, marginBottom: espacio.s, marginLeft: espacio.s },
  sesion: {
    backgroundColor: '#D9D3C9',
    borderRadius: radio.boton,
    paddingVertical: 14,
    marginHorizontal: espacio.l,
    marginBottom: espacio.s,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sesionEnCurso: { backgroundColor: colores.fondo },
  presionada: { opacity: 0.8 },
  punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: colores.activo, marginRight: espacio.s },
  textoSesion: { fontSize: 17, fontWeight: '700', color: colores.textoSuave },
  textoEnCurso: { color: colores.texto },
  pie: { marginVertical: espacio.m },
});
