import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Pantalla from '../../components/Pantalla';
import Campo from '../../components/Campo';
import Boton from '../../components/Boton';
import api, { mensajeDeError } from '../../services/api';
import { validarMateria } from '../../utils/validaciones';
import { AppStackParams } from '../../navigation/tipos';
import { colores, espacio } from '../../theme';

type Props = NativeStackScreenProps<AppStackParams, 'ClassForm'>;

// Modal para crear una clase o, si recibe una clase, editar su materia.
export default function ClassFormScreen({ navigation, route }: Props) {
  const clase = route.params?.clase;
  const [materia, setMateria] = useState(clase?.materia ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    const mensaje = validarMateria(materia);
    setError(mensaje);
    if (mensaje) return;

    setGuardando(true);
    try {
      if (clase) {
        await api.put(`/clases/${clase.id}`, { materia: materia.trim() });
      } else {
        await api.post('/clases', { materia: materia.trim() });
      }
      navigation.goBack();
    } catch (e) {
      setError(mensajeDeError(e));
      setGuardando(false);
    }
  };

  return (
    <Pantalla>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.titulo}>{clase ? 'Editar clase' : 'Nueva clase'}</Text>
        <Campo
          etiqueta="Materia"
          placeholder="Ej. Aplicaciones Móviles"
          value={materia}
          onChangeText={setMateria}
          error={error}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={guardar}
        />
        {!clase ? <Text style={styles.nota}>El código de 6 caracteres se genera al guardar.</Text> : null}
        <Boton titulo="Guardar" onPress={guardar} cargando={guardando} deshabilitado={materia.trim().length === 0} />
        <Boton titulo="Cancelar" variante="secundario" onPress={() => navigation.goBack()} style={styles.cancelar} />
      </KeyboardAvoidingView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titulo: { fontSize: 32, fontWeight: '800', color: colores.texto, marginBottom: espacio.l },
  nota: { color: colores.textoSuave, marginBottom: espacio.l },
  cancelar: { marginTop: espacio.m },
});
