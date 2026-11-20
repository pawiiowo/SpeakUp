import { Alert, StyleSheet, Text, View } from 'react-native';
import Pantalla from '../components/Pantalla';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { colores, espacio, radio } from '../theme';

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const confirmarSalida = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => cerrarSesion() },
    ]);
  };

  return (
    <Pantalla>
      <Text style={styles.titulo}>Perfil</Text>
      <View style={styles.tarjeta}>
        <Text style={styles.nombre}>{usuario?.nombre}</Text>
        <Text style={styles.dato}>{usuario?.email}</Text>
        <Text style={styles.rol}>{usuario?.rol === 'profesor' ? 'Docente' : 'Alumno'}</Text>
      </View>
      <View style={styles.espaciador} />
      <Boton titulo="Cerrar sesión" variante="secundario" onPress={confirmarSalida} />
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
