import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Icono, { NombreIcono } from '../components/Icono';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { AppStackParams, AuthStackParams, TabsAlumnoParams } from './tipos';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ClassesScreen from '../screens/docente/ClassesScreen';
import ClassFormScreen from '../screens/docente/ClassFormScreen';
import JoinClassScreen from '../screens/alumno/JoinClassScreen';
import TeacherSessionScreen from '../screens/docente/TeacherSessionScreen';
import StudentQueueScreen from '../screens/alumno/StudentQueueScreen';
import StudentClassesScreen from '../screens/alumno/StudentClassesScreen';
import { colores } from '../theme';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const AppStack = createNativeStackNavigator<AppStackParams>();
const Tabs = createBottomTabNavigator();
const TabsDelAlumno = createBottomTabNavigator<TabsAlumnoParams>();

// Ícono de cada tab; toma el color que le da la navegación (activo o inactivo).
const icono = (nombre: NombreIcono) => ({ color }: { color: string }) => <Icono nombre={nombre} color={color} />;

const opcionesTabs = {
  headerShown: false,
  tabBarActiveTintColor: colores.primario,
  tabBarInactiveTintColor: colores.textoSuave,
  tabBarStyle: { backgroundColor: colores.fondo, borderTopColor: colores.superficie },
};

// Tabs del docente: sus clases y su perfil.
function TabsDocente() {
  return (
    <Tabs.Navigator screenOptions={opcionesTabs}>
      <Tabs.Screen name="MisClases" component={ClassesScreen} options={{ title: 'Mis clases', tabBarIcon: icono('clases') }} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('perfil') }} />
    </Tabs.Navigator>
  );
}

// Tabs del alumno: sus clases (con historial), unirse a una clase y su perfil.
function TabsAlumno() {
  return (
    <TabsDelAlumno.Navigator screenOptions={opcionesTabs}>
      <TabsDelAlumno.Screen
        name="MisClasesAlumno"
        component={StudentClassesScreen}
        options={{ title: 'Mis clases', tabBarIcon: icono('clases') }}
      />
      <TabsDelAlumno.Screen name="Unirse" component={JoinClassScreen} options={{ tabBarIcon: icono('unirse') }} />
      <TabsDelAlumno.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('perfil') }} />
    </TabsDelAlumno.Navigator>
  );
}

// Decide qué ve el usuario: el login si no hay sesión, o las pantallas de su rol si la hay.
export default function AppNavigator() {
  const { usuario, restaurando } = useAuth();

  if (restaurando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  if (!usuario) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
        headerBackTitle: 'Atrás',
      }}
    >
      <AppStack.Screen
        name="Tabs"
        component={usuario.rol === 'profesor' ? TabsDocente : TabsAlumno}
        options={{ headerShown: false }}
      />
      <AppStack.Screen name="ClassForm" component={ClassFormScreen} options={{ presentation: 'modal', headerShown: false }} />
      <AppStack.Screen name="TeacherSession" component={TeacherSessionScreen} options={({ route }) => ({ title: route.params.materia })} />
      <AppStack.Screen name="StudentQueue" component={StudentQueueScreen} options={({ route }) => ({ title: route.params.materia })} />
    </AppStack.Navigator>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colores.fondo },
});
