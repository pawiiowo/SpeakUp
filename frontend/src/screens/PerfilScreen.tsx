import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pantalla from '../components/Pantalla';
import Boton from '../components/Boton';
import ModalOpciones from '../components/ModalOpciones';
import { useAuth } from '../context/AuthContext';
import { colores, espacio, radio } from '../theme';

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const [confirmando, setConfirmando] = useState(false);

  return (
    <Pantalla>
      <Text style={styles.titulo}>Perfil</Text>
      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>{usuario?.nombre}</Text>
        <Text style={styles.dato}>{usuario?.email}</Text>
        <Text style={styles.rol}>{usuario?.rol === 'profesor' ? 'Docente' : 'Alumno'}</Text>
      </View>
      <View style={styles.espaciador} />
      <Boton titulo="Cerrar sesión" variante="secundario" onPress={() => setConfirmando(true)} />
      <ModalOpciones
        contenido={
          confirmando
            ? {
                titulo: 'Cerrar sesión',
                mensaje: '¿Seguro que quieres salir?',
                opciones: [{ texto: 'Salir', variante: 'peligro', onPress: () => { setConfirmando(false); cerrarSesion(); } }],
              }
            : null
        }
        onCerrar={() => setConfirmando(false)}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 40, fontWeight: '800', color: colores.texto, marginBottom: espacio.l },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: radio.tarjeta, padding: espacio.l },
  nombre: { fontSize: 22, fontWeight: '700', color: colores.texto },
  dato: { fontSize: 16, color: colores.textoSuave, marginTop: espacio.xs },
  rol: { marginTop: espacio.m, color: colores.primario, fontWeight: '700' },
  espaciador: { flex: 1 },
});
