import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useCartelera } from '../context/CarteleraContext';
import { LogoTmdb } from '../components/LogoTmdb';
import { Boton } from '../components/Boton';
import { ALTURA_TOCABLE, colores, espacio } from '../utils/tema';

export function AcercaDeScreen() {
  const { usuario, lista, salir } = useCartelera();
  const [saliendo, setSaliendo] = useState(false);

  const confirmarSalir = () => {
    Alert.alert('Cerrar sesión', '¿Quieres cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          setSaliendo(true);
          try {
            await salir();
          } catch (e) {
            setSaliendo(false);
            Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo cerrar la sesión.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        {/* La marca de la app es lo más prominente de la pantalla. */}
        <View style={styles.marca}>
          <Ionicons name="film" size={64} color={colores.primario} />
          <Text style={styles.nombreApp}>Mi Cartelera Personal</Text>
          <Text style={styles.version}>Versión {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>Sobre la app</Text>
          <Text style={styles.texto}>
            Busca películas y series, agrégalas a tu lista personal y organízalas por estado: por ver, viendo o vista.
            Califica y comenta lo que ya viste. Tu lista es privada y se guarda en la nube y en tu teléfono.
          </Text>
          <Text style={styles.texto}>Proyecto académico · Entregable 2 · React Native + Expo, Firebase y TMDB.</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>Tu cuenta</Text>
          <Text style={styles.texto}>{usuario?.email}</Text>
          <Text style={styles.texto}>{lista.length} obra{lista.length === 1 ? '' : 's'} en tu lista</Text>
          <Boton titulo="Cerrar sesión" variante="peligro" onPress={confirmarSalir} cargando={saliendo} />
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>Créditos de datos</Text>
          <View style={styles.atribucion}>
            <LogoTmdb ancho={64} />
            <Text style={[styles.texto, { flex: 1 }]}>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
          </View>
          <Text style={styles.texto}>
            Los datos de películas, series, imágenes y elenco provienen de The Movie Database (TMDB). Uso no comercial.
          </Text>
          <Pressable
            onPress={() => void Linking.openURL('https://www.themoviedb.org/')}
            style={styles.enlace}
            accessibilityRole="link"
          >
            <Text style={styles.textoEnlace}>www.themoviedb.org</Text>
            <Ionicons name="open-outline" size={16} color={colores.primario} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.l, gap: espacio.l, paddingBottom: espacio.xl * 2 },
  marca: { alignItems: 'center', gap: espacio.xs, paddingVertical: espacio.l },
  nombreApp: { color: colores.texto, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  version: { color: colores.textoSuave },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: 12, padding: espacio.l, gap: espacio.m },
  seccion: { color: colores.texto, fontSize: 17, fontWeight: '700' },
  texto: { color: colores.textoSuave, fontSize: 14, lineHeight: 20 },
  atribucion: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  enlace: { flexDirection: 'row', alignItems: 'center', gap: espacio.xs, minHeight: ALTURA_TOCABLE },
  textoEnlace: { color: colores.primario, fontWeight: '600' },
});
