import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import api, { mensajeDeError } from '../../services/api';
import { validarCodigoClase } from '../../utils/validaciones';
import { AppStackParams } from '../../navigation/tipos';
import { colores, espacio } from '../../theme';

type Navegacion = NativeStackNavigationProp<AppStackParams>;

// El alumno escribe el código que el docente muestra en el salón.
export default function JoinClassScreen() {
  const navigation = useNavigation<Navegacion>();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Si presiona "Ir" con el campo vacío, solo se cierra el teclado (no es un error todavía).
  const alEnviarDesdeTeclado = () => {
    if (codigo.trim().length === 0) Keyboard.dismiss();
    else unirse();
  };

  const unirse = async () => {
    Keyboard.dismiss();
    const mensaje = validarCodigoClase(codigo);
    setError(mensaje);
    if (mensaje) return;

    setEnviando(true);
    try {
      const { data } = await api.post<{ clase: { id: number; materia: string } }>('/clases/unirse', {
        codigo: codigo.trim(),
      });
      setCodigo('');
      navigation.navigate('StudentQueue', { claseId: data.clase.id, materia: data.clase.materia });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla>
      {/* Tocar cualquier parte fuera del campo cierra el teclado. */}
      <Pressable style={styles.flex} onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={styles.contenido} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.titulo}>Unirme a una clase</Text>
        <Text style={styles.instruccion}>Escribe el código que muestra tu docente.</Text>
        <Campo
          etiqueta="Código de la clase"
          placeholder="ABC123"
          value={codigo}
          onChangeText={(texto) => {
            setCodigo(texto.toUpperCase());
            setError(null);
          }}
          error={error}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.codigo}
          returnKeyType="go"
          onSubmitEditing={alEnviarDesdeTeclado}
        />
        <Boton titulo="Unirme" onPress={unirse} cargando={enviando} deshabilitado={codigo.trim().length === 0} />
      </KeyboardAvoidingView>
      </Pressable>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { flex: 1, justifyContent: 'center' },
  titulo: { fontSize: 32, fontWeight: '800', color: colores.texto, textAlign: 'center' },
  instruccion: { color: colores.textoSuave, textAlign: 'center', marginTop: espacio.s, marginBottom: espacio.xl },
  codigo: { fontSize: 28, letterSpacing: 6, textAlign: 'center', fontWeight: '700' },
});
