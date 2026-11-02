import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image 
} from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('alumno');

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password) {
      return Alert.alert('Error', 'Por favor llena todos los campos');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    }

    try {
      const nombreCompleto = `${nombre} ${apellido}`.trim();
      await api.post('/auth/register', { nombre: nombreCompleto, email, password, rol });
      Alert.alert('Éxito', 'Cuenta creada correctamente. Inicia sesión.');
      navigation?.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Falló el registro');
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/SpeakUpLogo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Speak Up</Text>

        <View style={styles.form}>
          <View style={styles.blockGroup}>
            <TextInput 
              style={styles.input} 
              placeholder="Nombre" 
              placeholderTextColor="#A09891"
              value={nombre} 
              onChangeText={setNombre} 
            />
            <TextInput 
              style={[styles.input, styles.inputTight]} 
              placeholder="Apellido" 
              placeholderTextColor="#A09891"
              value={apellido} 
              onChangeText={setApellido} 
            />
          </View>

          <View style={styles.blockGroup}>
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@uabc.edu.mx" 
              placeholderTextColor="#A09891"
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none" 
            />
            <Text style={styles.helperText}>Usa tu correo institucional !</Text>
          </View>

          <View style={styles.blockGroup}>
            <TextInput 
              style={styles.input} 
              placeholder="Contraseña" 
              placeholderTextColor="#A09891"
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
            />
            <TextInput 
              style={[styles.input, styles.inputTight]} 
              placeholder="Confirma tu contraseña" 
              placeholderTextColor="#A09891"
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry 
            />
          </View>

          <View style={styles.roleBlock}>
            <Text style={styles.roleLabel}>Soy:</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleOption, rol === 'alumno' && styles.toggleActive]}
                onPress={() => setRol('alumno')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, rol === 'alumno' && styles.toggleTextActive]}>
                  Alumno
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.toggleOption, rol === 'profesor' && styles.toggleActive]}
                onPress={() => setRol('profesor')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, rol === 'profesor' && styles.toggleTextActive]}>
                  Profesor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Principal */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
            <Text style={styles.linkText}>Ingresa aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FDFBF7',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D3531',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  blockGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#EFECE6',
    borderRadius: 15,
    paddingVertical: 11,
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#3D3531',
    textAlign: 'center',
  },
  inputTight: {
    marginTop: 6, 
  },
  helperText: {
    fontSize: 11,
    color: '#8A827A',
    textAlign: 'center',
    marginTop: 4,
  },

  roleBlock: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  roleLabel: {
    fontSize: 12,
    color: '#8A827A',
    marginBottom: 6,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 20,
    padding: 3,
    width: '85%',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 17,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#3D3531',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A827A',
  },
  toggleTextActive: {
    color: '#FFFFFF',
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
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8A827A',
  },
  linkText: {
    fontSize: 13,
    color: '#3D3531',
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
});