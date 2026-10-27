import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCartelera } from '../context/CarteleraContext';
import { Cargando } from '../components/Estado';
import { LoginScreen } from '../screens/LoginScreen';
import { BuscarScreen } from '../screens/BuscarScreen';
import { DetalleScreen } from '../screens/DetalleScreen';
import { MiListaScreen } from '../screens/MiListaScreen';
import { EditarScreen } from '../screens/EditarScreen';
import { AcercaDeScreen } from '../screens/AcercaDeScreen';
import type { AppStackParamList, AuthStackParamList, PestanasParamList } from '../types/navegacion';
import { colores } from '../utils/tema';

const Tab = createBottomTabNavigator<PestanasParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const tema: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colores.primario,
    background: colores.fondo,
    card: colores.superficie,
    text: colores.texto,
    border: colores.borde,
  },
};

const ICONOS: Record<keyof PestanasParamList, keyof typeof Ionicons.glyphMap> = {
  Buscar: 'search',
  MiLista: 'albums',
  AcercaDe: 'information-circle',
};

function Pestanas() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONOS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Buscar" component={BuscarScreen} />
      <Tab.Screen name="MiLista" component={MiListaScreen} options={{ title: 'Mi lista' }} />
      <Tab.Screen name="AcercaDe" component={AcercaDeScreen} options={{ title: 'Acerca de' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { usuario, cargandoSesion } = useCartelera();

  if (cargandoSesion) return <Cargando texto="Abriendo tu cartelera…" />;

  return (
    <NavigationContainer theme={tema}>
      {usuario ? (
        <AppStack.Navigator screenOptions={{ headerTintColor: colores.primario, headerBackTitle: 'Atrás' }}>
          <AppStack.Screen name="Pestanas" component={Pestanas} options={{ headerShown: false }} />
          <AppStack.Screen name="Detalle" component={DetalleScreen} options={({ route }) => ({ title: route.params.titulo })} />
          <AppStack.Screen
            name="Editar"
            component={EditarScreen}
            options={{ title: 'Editar mi entrada', presentation: 'modal' }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
