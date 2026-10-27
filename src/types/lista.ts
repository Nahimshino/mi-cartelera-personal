import type { Timestamp, FieldValue } from 'firebase/firestore';

export type TipoObra = 'movie' | 'tv';
export type EstadoVisto = 'por_ver' | 'viendo' | 'vista';

/** Marca de tiempo tal como puede llegar: del servidor, pendiente de escritura o desde la caché (ms). */
export type MarcaTiempo = Timestamp | FieldValue | number | null;

export interface ElementoLista {
  id: string; // ej. "movie_550"
  tmdbId: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
  estado: EstadoVisto;
  calificacionPersonal: number | null;
  comentario: string;
  agregadoEn?: MarcaTiempo;
  actualizadoEn?: MarcaTiempo;
}

/** Datos necesarios para agregar una obra a la lista. */
export type NuevoElemento = Pick<ElementoLista, 'tmdbId' | 'tipo' | 'titulo' | 'anio' | 'posterPath'>;

/** Campos que el usuario puede editar de su entrada. */
export type CambiosElemento = Pick<ElementoLista, 'estado' | 'calificacionPersonal' | 'comentario'>;

export type FiltroEstado = EstadoVisto | 'todos';
export type FiltroTipo = TipoObra | 'todos';

export const ESTADOS: readonly EstadoVisto[] = ['por_ver', 'viendo', 'vista'];

/** Record exhaustivo: si se agrega un estado nuevo, TypeScript obliga a darle etiqueta. */
export const ETIQUETA_ESTADO: Record<EstadoVisto, string> = {
  por_ver: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
};

export const ETIQUETA_TIPO: Record<TipoObra, string> = {
  movie: 'Película',
  tv: 'Serie',
};

export const MAX_COMENTARIO = 500;
