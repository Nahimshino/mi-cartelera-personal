import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { urlImagen } from '../services/tmdbService';
import type { TamanoImagen } from '../types/tmdb';
import { colores } from '../utils/tema';

interface Props {
  path: string | null;
  ancho: number;
  tamano?: TamanoImagen;
  clase?: 'poster' | 'perfil';
}

/** Póster de TMDB con imagen de relleno si no hay ruta o si la descarga falla. */
export function Poster({ path, ancho, tamano = 'chico', clase = 'poster' }: Props) {
  const [fallo, setFallo] = useState(false);
  const uri = urlImagen(path, tamano, clase);
  const dimensiones = { width: ancho, height: ancho * 1.5, borderRadius: ancho > 100 ? 12 : 6 };

  if (!uri || fallo) {
    return (
      <View style={[styles.relleno, dimensiones]} accessibilityLabel="Sin imagen disponible">
        <Ionicons name={clase === 'perfil' ? 'person' : 'film-outline'} size={ancho / 3} color={colores.textoSuave} />
        {ancho > 60 && <Text style={styles.textoRelleno}>Sin imagen</Text>}
      </View>
    );
  }
  return <Image source={{ uri }} style={[styles.imagen, dimensiones]} onError={() => setFallo(true)} />;
}

const styles = StyleSheet.create({
  imagen: { backgroundColor: colores.superficieAlta },
  relleno: {
    backgroundColor: colores.superficieAlta,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  textoRelleno: { color: colores.textoSuave, fontSize: 11 },
});
