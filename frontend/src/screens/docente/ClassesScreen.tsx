import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import api, { mensajeDeError } from '../../services/api';
import { AppStackParams } from '../../navigation/tipos';
import { Clase } from '../../types';
import { colores, espacio, radio } from '../../theme';

type Navegacion = NativeStackNavigationProp<AppStackParams>;

// Lista de clases del docente (diseño de "Materias" del prototipo).
export default function ClassesScreen() {
  const navigation = useNavigation<Navegacion>();
  const [clases, setClases] = useState<Clase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get<Clase[]>('/clases');
      setClases(data);
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Se recarga cada vez que la pantalla vuelve a verse (por ejemplo, al regresar de crear una clase).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const reabrir = async (clase: Clase) => {
    try {
      await api.patch(`/clases/${clase.id}/abrir`);
      navigation.navigate('TeacherSession', { claseId: clase.id, materia: clase.materia });
    } catch (e) {
      Alert.alert('No se pudo reabrir', mensajeDeError(e));
    }
  };

  const eliminar = (clase: Clase) => {
    Alert.alert('Eliminar clase', `Se borrará "${clase.materia}" y su historial de turnos.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/clases/${clase.id}`);
            cargar();
          } catch (e) {
            Alert.alert('No se pudo eliminar', mensajeDeError(e));
          }
        },
      },
    ]);
  };

  // Al tocar una clase se muestran las acciones posibles según si está abierta o cerrada.
  const opciones = (clase: Clase) => {
    const editar = { text: 'Editar materia', onPress: () => navigation.navigate('ClassForm', { clase }) };
    const cancelar = { text: 'Cancelar', style: 'cancel' as const };
    if (clase.activa) {
      Alert.alert(clase.materia, `Código ${clase.codigo}`, [
        { text: 'Abrir sesión', onPress: () => navigation.navigate('TeacherSession', { claseId: clase.id, materia: clase.materia }) },
        editar,
        cancelar,
      ]);
    } else {
      Alert.alert(clase.materia, 'Esta clase está cerrada.', [
        { text: 'Reabrir con código nuevo', onPress: () => reabrir(clase) },
        editar,
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(clase) },
        cancelar,
      ]);
    }
  };

  const renderClase = ({ item }: { item: Clase }) => (
    <Pressable
      onPress={() => opciones(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.materia}, ${item.activa ? 'sesión activa' : 'cerrada'}`}
      style={({ pressed }) => [styles.tarjeta, item.activa && styles.tarjetaActiva, pressed && styles.presionada]}
    >
      <Text style={styles.materia} numberOfLines={2}>{item.materia}</Text>
      <Text style={styles.dato}>Código: {item.activa ? item.codigo : '—'}</Text>
      <Text style={styles.dato}>{new Date(item.fecha_creacion).toLocaleDateString('es-MX')}</Text>
      <View style={styles.estado}>
        <View style={[styles.punto, { backgroundColor: item.activa ? colores.activo : colores.textoSuave }]} />
        <Text style={[styles.textoEstado, item.activa && styles.textoActivo]}>{item.activa ? 'Sesión activa' : 'Cerrada'}</Text>
      </View>
    </Pressable>
  );

  if (cargando) {
    return (
      <Pantalla style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Text style={styles.titulo}>Mis clases</Text>

      {error && clases.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.mensaje}>{error}</Text>
          <Boton titulo="Reintentar" onPress={() => { setCargando(true); cargar(); }} />
        </View>
      ) : (
        <FlatList
          data={clases}
          keyExtractor={(clase) => String(clase.id)}
          renderItem={renderClase}
          contentContainerStyle={clases.length === 0 ? styles.centro : styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.mensaje}>Aún no tienes clases</Text>
              <Boton titulo="Crear mi primera clase" onPress={() => navigation.navigate('ClassForm')} />
            </View>
          }
        />
      )}

      {clases.length > 0 ? <Boton titulo="Nueva clase" onPress={() => navigation.navigate('ClassForm')} style={styles.nueva} /> : null}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 40, fontWeight: '800', color: colores.texto, marginBottom: espacio.m },
  lista: { paddingBottom: espacio.xl },
  centro: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  vacio: { alignItems: 'center', gap: espacio.m },
  mensaje: { color: colores.textoSuave, fontSize: 16, textAlign: 'center', marginBottom: espacio.m },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.tarjeta,
    padding: espacio.l,
    marginBottom: espacio.m,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tarjetaActiva: { backgroundColor: colores.blanco, borderColor: colores.primario },
  presionada: { opacity: 0.8 },
  materia: { fontSize: 18, fontWeight: '700', color: colores.texto, marginBottom: espacio.s },
  dato: { color: colores.textoSuave, fontSize: 15, marginBottom: 2 },
  estado: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: espacio.s },
  punto: { width: 10, height: 10, borderRadius: 5, marginRight: espacio.xs },
  textoEstado: { color: colores.textoSuave, fontWeight: '600' },
  textoActivo: { color: colores.primario },
  nueva: { marginBottom: espacio.m },
});
