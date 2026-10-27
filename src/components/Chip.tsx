import { Pressable, StyleSheet, Text } from 'react-native';
import { ALTURA_TOCABLE, colores, espacio } from '../utils/tema';

interface Props {
  texto: string;
  activo: boolean;
  onPress: () => void;
}

export function Chip({ texto, activo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[styles.chip, activo && styles.activo]}
    >
      <Text style={[styles.texto, activo && styles.textoActivo]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: ALTURA_TOCABLE,
    paddingHorizontal: espacio.l,
    borderRadius: ALTURA_TOCABLE / 2,
    borderWidth: 1,
    borderColor: colores.borde,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activo: { backgroundColor: colores.primario, borderColor: colores.primario },
  texto: { color: colores.texto, fontWeight: '600' },
  textoActivo: { color: colores.textoSobrePrimario },
});
