import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import ModalOpciones, { ContenidoModal } from '../../components/ModalOpciones';
import api, { mensajeDeError } from '../../services/api';
import { guardarEnCache, leerDeCache } from '../../services/cache';
import { useAuth } from '../../context/AuthContext';
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

  const { usuario } = useAuth();
  const claveCache = `clases-docente-${usuario?.id}`;
  // true cuando lo que se ve es la última copia guardada porque no hubo conexión (D34).
  const [desdeCache, setDesdeCache] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get<Clase[]>('/clases');
      setClases(data);
      setError(null);
      setDesdeCache(false);
      guardarEnCache(claveCache, data);
    } catch (e) {
      setError(mensajeDeError(e));
      // Sin conexión: si no hay nada en pantalla, se muestra la última copia guardada.
      const copia = await leerDeCache<Clase[]>(claveCache);
      if (copia) {
        setClases((actuales) => (actuales.length > 0 ? actuales : copia.datos));
        setDesdeCache(true);
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [claveCache]);

  // Se recarga cada vez que la pantalla vuelve a verse (por ejemplo, al regresar de crear una clase).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Contenido del modal propio (null = cerrado). Se cambia de opciones a confirmación sin cerrarlo.
  const [dialogo, setDialogo] = useState<ContenidoModal | null>(null);
  const cerrarDialogo = () => setDialogo(null);

  const avisar = (titulo: string, error: unknown) =>
    setDialogo({ titulo, mensaje: mensajeDeError(error), opciones: [{ texto: 'Entendido', onPress: cerrarDialogo }] });

  // Inicia la clase del día: el backend genera un código nuevo (D14, D27).
  const iniciarClase = async (clase: Clase) => {
    cerrarDialogo();
    try {
      await api.patch(`/clases/${clase.id}/abrir`);
      navigation.navigate('TeacherSession', { claseId: clase.id, materia: clase.materia });
    } catch (e) {
      avisar('No se pudo iniciar la clase', e);
    }
  };

  const confirmarTermino = (clase: Clase) =>
    setDialogo({
      titulo: '¿Terminar la clase?',
      mensaje: 'Los alumnos en espera saldrán de la fila y el código dejará de funcionar.',
      opciones: [
        {
          texto: 'Terminar clase',
          variante: 'peligro',
          onPress: async () => {
            cerrarDialogo();
            try {
              await api.patch(`/clases/${clase.id}/cerrar`);
              cargar();
            } catch (e) {
              avisar('No se pudo terminar la clase', e);
            }
          },
        },
      ],
    });

  const confirmarEliminacion = (clase: Clase) =>
    setDialogo({
      titulo: 'Eliminar clase',
      mensaje: `Se borrará "${clase.materia}" y su historial de turnos.`,
      opciones: [
        {
          texto: 'Eliminar',
          variante: 'peligro',
          onPress: async () => {
            cerrarDialogo();
            try {
              await api.delete(`/clases/${clase.id}`);
              cargar();
            } catch (e) {
              avisar('No se pudo eliminar', e);
            }
          },
        },
      ],
    });

  // Al tocar una clase se muestran las acciones posibles según si está en curso o no.
  const opciones = (clase: Clase) => {
    const editar = {
      texto: 'Editar materia',
      variante: 'secundario' as const,
      onPress: () => {
        cerrarDialogo();
        navigation.navigate('ClassForm', { clase });
      },
    };
    if (clase.activa) {
      setDialogo({
        titulo: clase.materia,
        mensaje: `En curso · Código ${clase.codigo}`,
        opciones: [
          {
            texto: 'Ver fila',
            onPress: () => {
              cerrarDialogo();
              navigation.navigate('TeacherSession', { claseId: clase.id, materia: clase.materia });
            },
          },
          editar,
          { texto: 'Terminar clase', variante: 'peligro', onPress: () => confirmarTermino(clase) },
        ],
      });
    } else {
      setDialogo({
        titulo: clase.materia,
        mensaje: 'Inicia la clase cuando estés en el salón para obtener el código.',
        opciones: [
          { texto: 'Iniciar clase', onPress: () => iniciarClase(clase) },
          editar,
          { texto: 'Eliminar clase', variante: 'peligro', onPress: () => confirmarEliminacion(clase) },
        ],
      });
    }
  };

  const renderClase = ({ item }: { item: Clase }) => (
    <Pressable
      onPress={() => opciones(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.materia}, ${item.activa ? 'en curso' : 'sin iniciar'}`}
      style={({ pressed }) => [styles.tarjeta, item.activa && styles.tarjetaActiva, pressed && styles.presionada]}
    >
      <Text style={styles.materia} numberOfLines={2}>{item.materia}</Text>
      <Text style={styles.dato}>Código: {item.activa ? item.codigo : '—'}</Text>
      <Text style={styles.dato}>{new Date(item.fecha_creacion).toLocaleDateString('es-MX')}</Text>
      <View style={styles.estado}>
        <View style={[styles.punto, { backgroundColor: item.activa ? colores.activo : colores.textoSuave }]} />
        <Text style={[styles.textoEstado, item.activa && styles.textoActivo]}>{item.activa ? 'En curso' : 'Sin iniciar'}</Text>
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

      {/* Si ya hay clases en pantalla y falla la recarga, se avisa sin borrar la lista. */}
      {error && clases.length > 0 ? (
        <Text style={styles.aviso}>{desdeCache ? `${error} Se muestra lo último guardado.` : error}</Text>
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
              <Text style={styles.mensaje}>Aún no tienes clases</Text>
              <Boton titulo="Crear mi primera clase" onPress={() => navigation.navigate('ClassForm')} />
            </View>
          }
        />
      )}

      {clases.length > 0 ? <Boton titulo="Nueva clase" onPress={() => navigation.navigate('ClassForm')} style={styles.nueva} /> : null}

      <ModalOpciones contenido={dialogo} onCerrar={cerrarDialogo} />
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
  aviso: {
    backgroundColor: colores.superficie,
    color: colores.peligro,
    borderRadius: radio.campo,
    padding: espacio.m,
    marginBottom: espacio.m,
    textAlign: 'center',
  },
});
