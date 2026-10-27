import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { ALTURA_TOCABLE, colores, espacio } from '../utils/tema';

type Variante = 'primario' | 'secundario' | 'peligro';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

const FONDO: Record<Variante, string> = {
  primario: colores.primario,
  secundario: colores.superficieAlta,
  peligro: 'transparent',
};

const TEXTO: Record<Variante, string> = {
  primario: colores.textoSobrePrimario,
  secundario: colores.texto,
  peligro: colores.peligro,
};

export function Boton({ titulo, onPress, variante = 'primario', cargando, deshabilitado, estilo }: Props) {
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: FONDO[variante], opacity: inactivo ? 0.5 : pressed ? 0.8 : 1 },
        variante === 'peligro' && styles.peligro,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={TEXTO[variante]} />
      ) : (
        <Text style={[styles.texto, { color: TEXTO[variante] }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: ALTURA_TOCABLE + 4,
    borderRadius: 10,
    paddingHorizontal: espacio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peligro: { borderWidth: 1, borderColor: colores.peligro },
  texto: { fontSize: 16, fontWeight: '700' },
});
