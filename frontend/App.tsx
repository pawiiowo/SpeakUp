import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colores } from './src/theme';

// Colores del prototipo aplicados a la navegación (fondos, encabezados y textos).
const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colores.fondo,
    card: colores.fondo,
    primary: colores.primario,
    text: colores.texto,
  },
};

// Raíz de la app: el proveedor de sesión (estado global) envuelve toda la navegación.
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={tema}>
          <AppNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
