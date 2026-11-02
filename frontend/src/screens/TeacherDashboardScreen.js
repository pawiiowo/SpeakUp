import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Image,
  Clipboard,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import api from '../services/api';

export default function TeacherDashboardScreen({ navigation }) {
  const [materia, setMateria] = useState('');
  const [codigoClase, setCodigoClase] = useState('');
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const handleCreateClass = async () => {
    if (!materia.trim()) {
      return Alert.alert('Atención', 'Por favor ingresa el nombre de la materia');
    }

    try {
      setCargando(true);
      const response = await api.post('/classes/create', { materia });
      
      const nuevoCodigo = response.data.clase.codigo;
      setCodigoClase(nuevoCodigo);
      setCopiado(false);
      Alert.alert('¡Éxito!', `Sesión creada correctamente con el código: ${nuevoCodigo}`);
    } catch (error) {
      console.error('Error al crear clase:', error);
      const msg = error.response?.data?.error || 'No se pudo conectar con el servidor backend';
      Alert.alert('Error', msg);
    } finally {
      setCargando(false);
    }
  };

  const copyToClipboard = () => {
    if (codigoClase) {
      Clipboard.setString(codigoClase);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            
            <View style={styles.header}>
              <Image 
                source={require('../../assets/SpeakUpLogo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.title}>Panel del Docente</Text>
              <Text style={styles.subtitle}>Crea una sesión de clase para tus alumnos</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Nombre de la Materia</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej. Aplicaciones Móviles" 
                placeholderTextColor="#A09891"
                value={materia} 
                onChangeText={setMateria} 
              />

              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleCreateClass}
                disabled={cargando}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {cargando ? 'Creando clase...' : 'Crear Clase'}
                </Text>
              </TouchableOpacity>
            </View>

            {codigoClase !== '' && (
              <View style={styles.codeCard}>
                <Text style={styles.codeTitle}>Código de Sesión Activa</Text>
                
                <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.7}>
                  <Text style={styles.codeText}>{codigoClase}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.copyButton} 
                  onPress={copyToClipboard}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyButtonText}>
                    {copiado ? '✓ ¡Copiado!' : 'Copiar Código'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.codeHelper}>Comparte este código con tus alumnos para unirse</Text>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
  },
  centerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D3531',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A827A',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D3531',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#EFECE6',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#3D3531',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#D98A6C',
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codeCard: {
    width: '100%',
    backgroundColor: '#EFECE6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D98A6C',
  },
  codeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A827A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3D3531',
    letterSpacing: 6,
    marginVertical: 4,
  },
  copyButton: {
    backgroundColor: '#3D3531',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginVertical: 6,
  },
  copyButtonText: {
    color: '#FDFBF7',
    fontSize: 13,
    fontWeight: '600',
  },
  codeHelper: {
    fontSize: 12,
    color: '#8A827A',
    textAlign: 'center',
    marginTop: 4,
  },
});