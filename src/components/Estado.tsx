import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Boton } from './Boton';
import { colores, espacio } from '../utils/tema';

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

export function MensajeError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <View style={styles.centro}>
      <Ionicons name="alert-circle-outline" size={48} color={colores.peligro} />
      <Text style={styles.texto}>{mensaje}</Text>
      {onReintentar && <Boton titulo="Reintentar" variante="secundario" onPress={onReintentar} />}
    </View>
  );
}

export function Vacio({
  icono,
  titulo,
  texto,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  texto?: string;
}) {
  return (
    <View style={styles.centro}>
      <Ionicons name={icono} size={48} color={colores.textoSuave} />
      <Text style={styles.titulo}>{titulo}</Text>
      {texto && <Text style={styles.texto}>{texto}</Text>}
    </View>
  );
}

export function AvisoSinConexion({ fecha }: { fecha: number }) {
  const cuando = new Date(fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  return (
    <View style={styles.aviso} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={20} color={colores.fondo} />
      <Text style={styles.textoAviso}>Sin conexión. Mostrando la última copia guardada ({cuando}).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espacio.xl, gap: espacio.m },
  titulo: { color: colores.texto, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  texto: { color: colores.textoSuave, fontSize: 15, textAlign: 'center' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    backgroundColor: colores.aviso,
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.s,
  },
  textoAviso: { color: colores.fondo, fontWeight: '600', flex: 1 },
});
