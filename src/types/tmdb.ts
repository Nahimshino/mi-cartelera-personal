import type { TipoObra } from './lista';

/** Respuesta paginada genérica de TMDB. */
export interface RespuestaPaginada<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** Elemento crudo de /search/multi (también puede ser una persona, que descartamos). */
export interface ResultadoMultiCrudo {
  id: number;
  media_type: TipoObra | 'person';
  title?: string; // películas
  name?: string; // series y personas
  release_date?: string; // películas
  first_air_date?: string; // series
  poster_path?: string | null;
  overview?: string;
}

/** Resultado de búsqueda ya normalizado para la app. */
export interface ResultadoBusqueda {
  id: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
}

export interface PaginaBusqueda {
  resultados: ResultadoBusqueda[];
  pagina: number;
  totalPaginas: number;
}

export interface MiembroElencoCrudo {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  order?: number;
}

/** Campos comunes del detalle de película y serie, con el elenco agregado por append_to_response. */
interface DetalleBaseCrudo {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  credits?: { cast: MiembroElencoCrudo[] };
}

export interface DetallePeliculaCrudo extends DetalleBaseCrudo {
  title: string;
  release_date: string;
  runtime: number | null;
}

export interface DetalleSerieCrudo extends DetalleBaseCrudo {
  name: string;
  first_air_date: string;
  number_of_seasons: number;
}

export interface MiembroElenco {
  id: number;
  nombre: string;
  personaje: string;
  fotoPath: string | null;
}

/** Detalle normalizado, igual para película y serie. */
export interface DetalleObra {
  id: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  sinopsis: string; // vacía si TMDB no la tiene
  posterPath: string | null;
  calificacion: number; // 0 a 10
  votos: number;
  generos: string[];
  extra: string; // duración o número de temporadas
  elenco: MiembroElenco[];
}

export interface ConfiguracionImagenes {
  secure_base_url: string;
  poster_sizes: string[];
  profile_sizes: string[];
}

export type TamanoImagen = 'chico' | 'grande';
