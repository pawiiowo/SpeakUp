import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { mensajeDeError } from '../../services/api';
import { validarEmail, validarPasswordLogin } from '../../utils/validaciones';
import { AuthStackParams } from '../../navigation/tipos';
import { colores, espacio } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<{ email?: string | null; password?: string | null }>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    const nuevos = { email: validarEmail(email), password: validarPasswordLogin(password) };
    setErrores(nuevos);
    setErrorGeneral(null);
    if (nuevos.email || nuevos.password) return;

    setEnviando(true);
    try {
      await iniciarSesion(email.trim().toLowerCase(), password);
      // Al haber usuario, la navegación cambia sola a las pantallas de la app.
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  };

  return (
    <Pantalla style={styles.sinPadding}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.encabezado}>
            <Logo />
            <Text style={styles.titulo}>Speak Up</Text>
          </View>

          <Campo
            etiqueta="Correo"
            placeholder="ejemplo@uabc.edu.mx"
            ayuda="Usa tu correo institucional"
            value={email}
            onChangeText={setEmail}
            error={errores.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Campo
            etiqueta="Contraseña"
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            error={errores.password}
            secureTextEntry
          />

          {errorGeneral ? <Text style={styles.errorGeneral}>{errorGeneral}</Text> : null}

          <Boton titulo="Ingresar" onPress={entrar} cargando={enviando} style={styles.boton} />

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.enlace} accessibilityRole="link">
            <Text style={styles.textoEnlace}>¿No tienes una cuenta?</Text>
            <Text style={[styles.textoEnlace, styles.subrayado]}>Regístrate aquí</Text>
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
  encabezado: { alignItems: 'center', marginBottom: espacio.xl },
  titulo: { fontSize: 40, fontWeight: '800', color: colores.texto, marginTop: espacio.m },
  errorGeneral: { color: colores.peligro, textAlign: 'center', marginBottom: espacio.m },
  boton: { marginTop: espacio.s },
  enlace: { alignItems: 'center', marginTop: espacio.xl },
  textoEnlace: { color: colores.textoSuave, fontSize: 15 },
  subrayado: { textDecorationLine: 'underline' },
});
