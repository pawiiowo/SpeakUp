import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isAxiosError } from 'axios';
import Pantalla from '../../components/Pantalla';
import Boton from '../../components/Boton';
import ModalOpciones, { ContenidoModal } from '../../components/ModalOpciones';
import api, { mensajeDeError } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { avisarTurno, pedirPermisoNotificaciones } from '../../services/notificaciones';
import { AppStackParams } from '../../navigation/tipos';
import { FilaAlumno } from '../../types';
import { colores, espacio, radio } from '../../theme';

type Props = NativeStackScreenProps<AppStackParams, 'StudentQueue'>;

// Pantalla del alumno en la fila (diseño "Fila actual" del prototipo). Los turnos se muestran
// sin nombres: el alumno solo sabe cuántos hay y cuál es el suyo (D08).
export default function StudentQueueScreen({ route, navigation }: Props) {
  const { claseId, materia } = route.params;
  const [fila, setFila] = useState<FilaAlumno | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [dialogo, setDialogo] = useState<ContenidoModal | null>(null);
  // true si la clase está en curso pero el alumno aún no entra con el QR o el código de hoy (D32).
  const [sinEntrada, setSinEntrada] = useState(false);
  const estadoAnterior = useRef<string | null>(null);

  // Guarda el estado nuevo y avisa (vibración + notificación local) si al alumno le acaba de tocar hablar.
  const actualizar = useCallback(
    (datos: FilaAlumno) => {
      const estado = datos.mi_turno?.estado ?? null;
      if (estado === 'hablando' && estadoAnterior.current !== 'hablando') {
        Vibration.vibrate(500);
        void avisarTurno(materia);
      }
      estadoAnterior.current = estado;
      setFila(datos);
      setError(null);
    },
    [materia]
  );

  const consultar = useCallback(async () => {
    try {
      const { data } = await api.get<FilaAlumno>(`/clases/${claseId}/fila/mia`);
      setSinEntrada(false);
      actualizar(data);
    } catch (e) {
      const datos = isAxiosError(e) ? (e.response?.data as { codigo?: string } | undefined) : undefined;
      if (datos?.codigo === 'SIN_ENTRADA') setSinEntrada(true);
      else setError(mensajeDeError(e));
    }
  }, [claseId, actualizar]);

  usePolling(consultar);

  const pedirLaPalabra = async () => {
    setProcesando(true);
    // El permiso se pide en el momento en que sirve: al pedir la palabra. Si lo niega, sigue funcionando.
    await pedirPermisoNotificaciones();
    try {
      const { data } = await api.post<FilaAlumno>(`/clases/${claseId}/turnos`);
      actualizar(data);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setProcesando(false);
    }
  };

  const confirmarSalida = () =>
    setDialogo({
      titulo: '¿Salir de la fila?',
      mensaje: 'Perderás tu lugar. Si vuelves a pedir la palabra, quedarás al final.',
      opciones: [
        {
          texto: 'Salir de la fila',
          variante: 'peligro',
          onPress: async () => {
            setDialogo(null);
            try {
              const { data } = await api.delete<FilaAlumno>(`/clases/${claseId}/turnos/mio`);
              actualizar(data);
            } catch (e) {
              setError(mensajeDeError(e));
            }
          },
        },
      ],
    });

  if (sinEntrada) {
    return (
      <Pantalla conEncabezado style={styles.centro}>
        <Text style={styles.titulo}>Entra a la clase de hoy</Text>
        <Text style={styles.mensaje}>Escanea el QR o escribe el código que muestra tu docente.</Text>
        <Boton titulo="Ir a unirme" onPress={() => navigation.navigate('Tabs', { screen: 'Unirse', params: { materia } })} />
      </Pantalla>
    );
  }

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
        <Text style={styles.titulo}>La clase terminó</Text>
        {/* Texto neutral: no todos los alumnos participaron en la sesión. */}
        <Text style={styles.mensaje}>El docente terminó la clase. Tus participaciones quedan en Mis clases.</Text>
        <Boton titulo="Ir a mis clases" onPress={() => navigation.navigate('Tabs', { screen: 'MisClasesAlumno' })} />
      </Pantalla>
    );
  }

  const miEstado = fila.mi_turno?.estado ?? null;
  const miPosicion = fila.mi_turno?.posicion ?? null;
  const filas = Array.from({ length: fila.en_espera }, (_, i) => i + 1);

  return (
    <Pantalla conEncabezado style={styles.sinPadding}>
      <ScrollView contentContainerStyle={styles.contenido}>
        {error ? <Text style={styles.aviso}>{error}</Text> : null}

        <View style={styles.panel}>
          <Text style={styles.titulo}>Fila actual</Text>
          <Text style={styles.subtitulo}>
            {fila.en_espera === 0
              ? 'Nadie está esperando'
              : `${fila.en_espera} ${fila.en_espera === 1 ? 'persona esperando' : 'personas esperando'}`}
          </Text>
          {fila.alguien_hablando && miEstado !== 'hablando' ? (
            <Text style={styles.hablandoOtro}>Alguien tiene la palabra</Text>
          ) : null}

          {filas.length > 0 ? (
            <View style={styles.fila}>
              {filas.map((posicion) => {
                const esMio = posicion === miPosicion;
                return (
                  <View
                    key={posicion}
                    style={[styles.turno, esMio && styles.turnoMio]}
                    accessibilityLabel={esMio ? `Tu turno, número ${posicion}` : `Turno ${posicion}`}
                  >
                    <Text style={[styles.posicion, esMio && styles.posicionMia]}>
                      {esMio ? `#${posicion} · Tú` : `#${posicion}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {miEstado === 'hablando' ? (
            <View style={[styles.circulo, styles.circuloTurno]} accessibilityLiveRegion="assertive">
              <Text style={styles.textoCirculo}>¡Es tu turno!</Text>
              <Text style={styles.subCirculo}>Tienes la palabra</Text>
            </View>
          ) : miEstado === 'en_espera' ? (
            <View style={[styles.circulo, styles.circuloEspera]}>
              <Text style={styles.textoCirculo}>Ya estás en la fila</Text>
              <Text style={styles.subCirculo}>Eres el #{miPosicion}</Text>
            </View>
          ) : (
            <Pressable
              onPress={pedirLaPalabra}
              disabled={procesando}
              accessibilityRole="button"
              style={({ pressed }) => [styles.circulo, styles.circuloPedir, (pressed || procesando) && styles.presionado]}
            >
              {procesando ? (
                <ActivityIndicator color={colores.blanco} />
              ) : (
                <Text style={styles.textoCirculo}>Pedir la palabra</Text>
              )}
            </Pressable>
          )}

          {miEstado === 'en_espera' ? (
            <Pressable onPress={confirmarSalida} accessibilityRole="button" style={styles.salir}>
              <Text style={styles.textoSalir}>Salir de la fila</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <ModalOpciones contenido={dialogo} onCerrar={() => setDialogo(null)} />
    </Pantalla>
  );
}

const TAMANO_CIRCULO = 170;

const styles = StyleSheet.create({
  sinPadding: { padding: 0 },
  // flexGrow + justifyContent: el contenido queda centrado verticalmente, y si crece (fila larga) se puede desplazar.
  contenido: { flexGrow: 1, justifyContent: 'center', padding: espacio.l, paddingBottom: espacio.xl },
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
  // Una sola capa (D31): sin panel de fondo; el único acento es tu turno o el círculo de acción.
  panel: { alignItems: 'center' },
  titulo: { fontSize: 32, fontWeight: '800', color: colores.texto, textAlign: 'center' },
  subtitulo: { fontSize: 16, fontWeight: '700', color: colores.texto, marginTop: espacio.s },
  hablandoOtro: { color: colores.primario, fontWeight: '700', marginTop: espacio.s },
  fila: {
    alignSelf: 'stretch',
    backgroundColor: colores.fila,
    borderRadius: radio.tarjeta,
    padding: espacio.m,
    gap: espacio.s,
    marginTop: espacio.l,
  },
  turno: { backgroundColor: colores.superficie, borderRadius: radio.campo, padding: espacio.m },
  turnoMio: { backgroundColor: colores.primario, paddingVertical: espacio.l },
  posicion: { fontWeight: '800', color: colores.texto, fontSize: 16 },
  posicionMia: { color: colores.blanco, fontSize: 20 },
  circulo: {
    width: TAMANO_CIRCULO,
    height: TAMANO_CIRCULO,
    borderRadius: TAMANO_CIRCULO / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.m,
    marginTop: espacio.l,
  },
  circuloPedir: { backgroundColor: colores.primario },
  circuloEspera: { backgroundColor: colores.textoSuave },
  circuloTurno: { backgroundColor: colores.activo },
  presionado: { opacity: 0.8 },
  textoCirculo: { color: colores.blanco, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  subCirculo: { color: colores.blanco, marginTop: espacio.xs, textAlign: 'center' },
  salir: { marginTop: espacio.l, padding: espacio.s },
  textoSalir: { color: colores.peligro, fontSize: 16, fontWeight: '700', textDecorationLine: 'underline' },
});
