import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import { useAuth } from '../../context/AuthContext';
import { mensajeDeError } from '../../services/api';
import {
  validarConfirmacion,
  validarEmail,
  validarNombre,
  validarPasswordNueva,
} from '../../utils/validaciones';
import { AuthStackParams } from '../../navigation/tipos';
import { Rol } from '../../types';
import { colores, espacio, radio } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParams, 'Register'>;

type Errores = { nombre?: string | null; email?: string | null; password?: string | null; confirmacion?: string | null };

const ROLES: { valor: Rol; texto: string }[] = [
  { valor: 'alumno', texto: 'Alumno' },
  { valor: 'profesor', texto: 'Docente' },
];

export default function RegisterScreen({ navigation }: Props) {
  const { registrarse } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [rol, setRol] = useState<Rol>('alumno');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const crearCuenta = async () => {
    const nuevos: Errores = {
      nombre: validarNombre(nombre),
      email: validarEmail(email),
      password: validarPasswordNueva(password),
      confirmacion: validarConfirmacion(password, confirmacion),
    };
    setErrores(nuevos);
    setErrorGeneral(null);
    if (Object.values(nuevos).some(Boolean)) return;

    setEnviando(true);
    try {
      await registrarse({ nombre: nombre.trim(), email: email.trim().toLowerCase(), password, rol });
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  };

  return (
    <Pantalla style={styles.sinPadding}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Crear cuenta</Text>

          <Text style={styles.etiqueta}>Soy</Text>
          <View style={styles.selector} accessibilityRole="radiogroup">
            {ROLES.map((opcion) => (
              <Pressable
                key={opcion.valor}
                onPress={() => setRol(opcion.valor)}
                accessibilityRole="radio"
                accessibilityState={{ checked: rol === opcion.valor }}
                style={[styles.opcion, rol === opcion.valor && styles.opcionActiva]}
              >
                <Text style={[styles.textoOpcion, rol === opcion.valor && styles.textoOpcionActiva]}>{opcion.texto}</Text>
              </Pressable>
            ))}
          </View>

          <Campo etiqueta="Nombre completo" value={nombre} onChangeText={setNombre} error={errores.nombre} autoComplete="name" />
          <Campo
            etiqueta="Correo"
            placeholder="ejemplo@uabc.edu.mx"
            ayuda="Usa tu correo institucional"
            value={email}
            onChangeText={setEmail}
            error={errores.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Campo etiqueta="Contraseña" ayuda="Mínimo 6 caracteres" value={password} onChangeText={setPassword} error={errores.password} secureTextEntry />
          <Campo etiqueta="Confirmar contraseña" value={confirmacion} onChangeText={setConfirmacion} error={errores.confirmacion} secureTextEntry />

          {errorGeneral ? <Text style={styles.errorGeneral}>{errorGeneral}</Text> : null}

          <Boton titulo="Crear cuenta" onPress={crearCuenta} cargando={enviando} />

          <Pressable onPress={() => navigation.goBack()} style={styles.enlace} accessibilityRole="link">
            <Text style={styles.textoEnlace}>¿Ya tienes cuenta? </Text>
            <Text style={[styles.textoEnlace, styles.subrayado]}>Inicia sesión</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sinPadding: { padding: 0 },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: espacio.l },
  titulo: { fontSize: 34, fontWeight: '800', color: colores.texto, marginBottom: espacio.l, textAlign: 'center' },
  etiqueta: { color: colores.texto, fontWeight: '600', marginBottom: espacio.xs },
  selector: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderRadius: radio.boton,
    padding: espacio.xs,
    marginBottom: espacio.m,
  },
  opcion: { flex: 1, paddingVertical: 10, borderRadius: radio.boton, alignItems: 'center' },
  opcionActiva: { backgroundColor: colores.primario },
  textoOpcion: { color: colores.texto, fontWeight: '600' },
  textoOpcionActiva: { color: colores.blanco },
  errorGeneral: { color: colores.peligro, textAlign: 'center', marginBottom: espacio.m },
  enlace: { flexDirection: 'row', justifyContent: 'center', marginTop: espacio.l },
  textoEnlace: { color: colores.textoSuave, fontSize: 15 },
  subrayado: { textDecorationLine: 'underline' },
});
