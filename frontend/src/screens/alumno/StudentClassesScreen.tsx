import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import api, { mensajeDeError } from '../../services/api';
import { guardarEnCache, leerDeCache } from '../../services/cache';
import { useAuth } from '../../context/AuthContext';
import { AppStackParams, TabsAlumnoParams } from '../../navigation/tipos';
import { ClaseAlumno } from '../../types';
import { colores, espacio, radio } from '../../theme';

type Navegacion = CompositeNavigationProp<
  BottomTabNavigationProp<TabsAlumnoParams>,
  NativeStackNavigationProp<AppStackParams>
>;

// "Mis clases" del alumno (pantalla "Materias" del prototipo): las clases a las que se unió,
// con la que está en curso hasta arriba (F08).
export default function StudentClassesScreen() {
  const navigation = useNavigation<Navegacion>();
  const [clases, setClases] = useState<ClaseAlumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { usuario } = useAuth();
  const claveCache = `clases-alumno-${usuario?.id}`;
  // true cuando lo que se ve es la última copia guardada porque no hubo conexión (D34).
  const [desdeCache, setDesdeCache] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get<ClaseAlumno[]>('/alumno/clases');
      setClases(data);
      setError(null);
      setDesdeCache(false);
      guardarEnCache(claveCache, data);
    } catch (e) {
      setError(mensajeDeError(e));
      // Sin conexión: si no hay nada en pantalla, se muestra la última copia guardada.
      const copia = await leerDeCache<ClaseAlumno[]>(claveCache);
      if (copia) {
        setClases((actuales) => (actuales.length > 0 ? actuales : copia.datos));
        setDesdeCache(true);
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [claveCache]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Clase en curso: si ya entró hoy va a la fila; si no, a Unirse para escanear el QR o escribir
  // el código de hoy (D32). Las demás clases abren su historial de sesiones.
  const abrir = (clase: ClaseAlumno) => {
    const params = { claseId: clase.id, materia: clase.materia };
    if (clase.activa && clase.entrada_hoy) navigation.navigate('StudentQueue', params);
    else if (clase.activa) navigation.navigate('Unirse', { materia: clase.materia });
    else navigation.navigate('ClassHistory', params);
  };

  const renderClase = ({ item }: { item: ClaseAlumno }) => (
    <Pressable
      onPress={() => abrir(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.materia}${item.activa ? ', en curso' : ''}`}
      style={({ pressed }) => [styles.tarjeta, item.activa && styles.tarjetaActiva, pressed && styles.presionada]}
    >
      <Text style={styles.materia} numberOfLines={2}>{item.materia}</Text>
      <Text style={styles.dato}>
        {item.ultima_sesion
          ? `Última clase: ${new Date(item.ultima_sesion).toLocaleDateString('es-MX')}`
          : 'Aún no hay clases'}
      </Text>
      {item.activa ? (
        <View style={styles.estado}>
          <View style={styles.punto} />
          <Text style={styles.textoEstado}>En curso</Text>
        </View>
      ) : null}
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
      {error && clases.length > 0 ? (
        <Text style={desdeCache ? [styles.aviso, styles.avisoCopia] : styles.aviso}>
          {desdeCache ? 'No se pudo actualizar. Se muestra lo último guardado.' : error}
        </Text>
      ) : null}

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
              <Text style={styles.mensaje}>Aún no te has unido a ninguna clase</Text>
              <Boton titulo="Unirme a una clase" onPress={() => navigation.navigate('Unirse')} />
            </View>
          }
        />
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 40, fontWeight: '800', color: colores.texto, marginBottom: espacio.m },
  lista: { paddingBottom: espacio.xl },
  centro: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  vacio: { alignItems: 'center', gap: espacio.m },
  mensaje: { color: colores.textoSuave, fontSize: 16, textAlign: 'center', marginBottom: espacio.m },
  aviso: {
    backgroundColor: colores.superficie,
    color: colores.peligro,
    borderRadius: radio.campo,
    padding: espacio.m,
    marginBottom: espacio.m,
    textAlign: 'center',
  },
  avisoCopia: {
    color: colores.textoSuave,
  },
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
  dato: { color: colores.textoSuave, fontSize: 15 },
  estado: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: espacio.s },
  punto: { width: 10, height: 10, borderRadius: 5, marginRight: espacio.xs, backgroundColor: colores.activo },
  textoEstado: { color: colores.primario, fontWeight: '600' },
});
