import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ElementoLista, MarcaTiempo } from '../types/lista';

interface CacheLista {
  guardadoEn: number;
  elementos: ElementoLista[];
}

const clave = (uid: string) => `@cartelera/lista/${uid}`;

/** Los Timestamp de Firestore no son JSON: se guardan como milisegundos. */
function aMilisegundos(marca: MarcaTiempo | undefined): number | null {
  if (typeof marca === 'number') return marca;
  if (marca && typeof marca === 'object' && 'toMillis' in marca && typeof marca.toMillis === 'function') {
    return marca.toMillis();
  }
  return null;
}

export async function guardarCache(uid: string, elementos: ElementoLista[]): Promise<void> {
  const datos: CacheLista = {
    guardadoEn: Date.now(),
    elementos: elementos.map((e) => ({
      ...e,
      agregadoEn: aMilisegundos(e.agregadoEn),
      actualizadoEn: aMilisegundos(e.actualizadoEn),
    })),
  };
  try {
    await AsyncStorage.setItem(clave(uid), JSON.stringify(datos));
  } catch {
    // Si no se puede escribir la caché, la app sigue funcionando con Firestore.
  }
}

export async function leerCache(uid: string): Promise<CacheLista | null> {
  try {
    const texto = await AsyncStorage.getItem(clave(uid));
    return texto ? (JSON.parse(texto) as CacheLista) : null;
  } catch {
    return null;
  }
}
