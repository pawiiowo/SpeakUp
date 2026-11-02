import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(usuario));

      Alert.alert('Éxito', `Bienvenido ${usuario.nombre}`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Falló el inicio de sesión');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image 
          source={require('../../assets/SpeakUpLogo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Speak Up</Text>

      <View style={styles.form}>
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

        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          placeholderTextColor="#A09891"
          value={password} 
          onChangeText={setPassword}
          secureTextEntry 
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>No tienes una cuenta?</Text>
        <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
          <Text style={styles.linkText}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3D3531',
    textAlign: 'center',
    marginBottom: 35,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#EFECE6',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#3D3531',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 11,
    color: '#8A827A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#D98A6C',
    borderRadius: 25,
    paddingVertical: 14,
    marginTop: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
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