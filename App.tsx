import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CarteleraProvider } from './src/context/CarteleraContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colores } from './src/utils/tema';

export default function App() {
  return (
    <SafeAreaProvider>
      <CarteleraProvider>
        <View style={{ flex: 1, backgroundColor: colores.fondo }}>
          <RootNavigator />
        </View>
        <StatusBar style="light" />
      </CarteleraProvider>
    </SafeAreaProvider>
  );
}
