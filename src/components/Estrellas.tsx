import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALTURA_TOCABLE, colores } from '../utils/tema';

interface Props {
  valor: number | null;
  /** Sin onCambiar las estrellas solo se muestran. */
  onCambiar?: (valor: number) => void;
  tamano?: number;
  deshabilitado?: boolean;
}

const VALORES = [1, 2, 3, 4, 5] as const;

export function Estrellas({ valor, onCambiar, tamano = 18, deshabilitado }: Props) {
  return (
    <View style={styles.fila} accessibilityLabel={`Calificación: ${valor ?? 0} de 5`}>
      {VALORES.map((n) => {
        const icono = (
          <Ionicons
            name={valor !== null && n <= valor ? 'star' : 'star-outline'}
            size={tamano}
            color={deshabilitado ? colores.borde : colores.primario}
          />
        );
        if (!onCambiar) return <View key={n}>{icono}</View>;
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n} estrella${n === 1 ? '' : 's'}`}
            disabled={deshabilitado}
            onPress={() => onCambiar(n)}
            style={styles.tocable}
          >
            {icono}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  tocable: { minWidth: ALTURA_TOCABLE, minHeight: ALTURA_TOCABLE, alignItems: 'center', justifyContent: 'center' },
});
