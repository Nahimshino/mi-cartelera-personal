import type {
  ConfiguracionImagenes,
  DetalleObra,
  DetallePeliculaCrudo,
  DetalleSerieCrudo,
  MiembroElencoCrudo,
  PaginaBusqueda,
  RespuestaPaginada,
  ResultadoBusqueda,
  ResultadoMultiCrudo,
  TamanoImagen,
} from '../types/tmdb';
import type { TipoObra } from '../types/lista';
import { extraerAnio } from '../utils/validaciones';

const URL_BASE = 'https://api.themoviedb.org/3/';
const IDIOMA = 'es-MX';
const TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;
const MAX_ELENCO = 15;

/** Valores por defecto mientras llega /configuration (o si falla). */
let configuracion: ConfiguracionImagenes = {
  secure_base_url: 'https://image.tmdb.org/t/p/',
  poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  profile_sizes: ['w45', 'w185', 'h632', 'original'],
};

export class TmdbError extends Error {
  constructor(mensaje: string, public readonly status?: number) {
    super(mensaje);
    this.name = 'TmdbError';
  }
}

function mensajePorStatus(status: number): string {
  switch (status) {
    case 401:
      return 'El token de TMDB no es válido. Revisa EXPO_PUBLIC_TMDB_TOKEN en .env.';
    case 404:
      return 'No se encontró la obra en TMDB.';
    case 429:
      return 'Se alcanzó el límite de peticiones de TMDB. Espera unos segundos.';
    default:
      return status >= 500 ? 'TMDB no está disponible en este momento.' : `Error de TMDB (${status}).`;
  }
}

/** Petición genérica tipada a la API v3 de TMDB. */
async function pedir<T>(ruta: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!TOKEN) throw new TmdbError('Falta EXPO_PUBLIC_TMDB_TOKEN en el archivo .env.');

  const query = new URLSearchParams(
    Object.entries(params).map(([clave, valor]) => [clave, String(valor)]),
  ).toString();
  const url = `${URL_BASE}${ruta}${query ? `?${query}` : ''}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}`, accept: 'application/json' },
    });
  } catch {
    throw new TmdbError('Sin conexión a internet. Revisa tu red e inténtalo de nuevo.');
  }
  if (!respuesta.ok) throw new TmdbError(mensajePorStatus(respuesta.status), respuesta.status);
  return (await respuesta.json()) as T;
}

/** Carga base_url y tamaños de /configuration. Si falla se usan los valores por defecto. */
export async function cargarConfiguracion(): Promise<void> {
  try {
    const datos = await pedir<{ images: ConfiguracionImagenes }>('configuration');
    configuracion = datos.images;
  } catch {
    // Los valores por defecto son los oficiales; la app sigue funcionando.
  }
}

function elegirTamano(tamanos: string[], preferido: string): string {
  return tamanos.includes(preferido) ? preferido : (tamanos[tamanos.length - 1] ?? 'original');
}

/** Arma la URL completa: base_url + file_size + file_path. Devuelve null si no hay imagen. */
export function urlImagen(
  filePath: string | null | undefined,
  tamano: TamanoImagen = 'chico',
  clase: 'poster' | 'perfil' = 'poster',
): string | null {
  if (!filePath) return null;
  const tamanos = clase === 'poster' ? configuracion.poster_sizes : configuracion.profile_sizes;
  const preferido = clase === 'poster' ? (tamano === 'chico' ? 'w185' : 'w500') : 'w185';
  return `${configuracion.secure_base_url}${elegirTamano(tamanos, preferido)}${filePath}`;
}

function esObra(r: ResultadoMultiCrudo): r is ResultadoMultiCrudo & { media_type: TipoObra } {
  return r.media_type === 'movie' || r.media_type === 'tv';
}

function normalizarResultado(r: ResultadoMultiCrudo & { media_type: TipoObra }): ResultadoBusqueda {
  return {
    id: r.id,
    tipo: r.media_type,
    titulo: r.title ?? r.name ?? 'Sin título',
    anio: extraerAnio(r.media_type === 'movie' ? r.release_date : r.first_air_date),
    posterPath: r.poster_path ?? null,
  };
}

/** Búsqueda combinada de películas y series (se descartan las personas). */
export async function buscar(titulo: string, pagina = 1): Promise<PaginaBusqueda> {
  const datos = await pedir<RespuestaPaginada<ResultadoMultiCrudo>>('search/multi', {
    query: titulo.trim(),
    page: pagina,
    language: IDIOMA,
    include_adult: 'false',
  });
  return {
    resultados: datos.results.filter(esObra).map(normalizarResultado),
    pagina: datos.page,
    totalPaginas: datos.total_pages,
  };
}

function normalizarElenco(cast: MiembroElencoCrudo[] | undefined) {
  return (cast ?? []).slice(0, MAX_ELENCO).map((m) => ({
    id: m.id,
    nombre: m.name,
    personaje: m.character ?? '',
    fotoPath: m.profile_path,
  }));
}

/** Detalle de una película o serie con el elenco en una sola petición (append_to_response=credits). */
export async function obtenerDetalle(tipo: TipoObra, id: number): Promise<DetalleObra> {
  const params = { language: IDIOMA, append_to_response: 'credits' };
  let detalle: DetalleObra;

  if (tipo === 'movie') {
    const d = await pedir<DetallePeliculaCrudo>(`movie/${id}`, params);
    detalle = {
      id: d.id,
      tipo,
      titulo: d.title,
      anio: extraerAnio(d.release_date),
      sinopsis: d.overview?.trim() ?? '',
      posterPath: d.poster_path,
      calificacion: d.vote_average ?? 0,
      votos: d.vote_count ?? 0,
      generos: d.genres.map((g) => g.name),
      extra: d.runtime ? `${d.runtime} min` : '',
      elenco: normalizarElenco(d.credits?.cast),
    };
  } else {
    const d = await pedir<DetalleSerieCrudo>(`tv/${id}`, params);
    detalle = {
      id: d.id,
      tipo,
      titulo: d.name,
      anio: extraerAnio(d.first_air_date),
      sinopsis: d.overview?.trim() ?? '',
      posterPath: d.poster_path,
      calificacion: d.vote_average ?? 0,
      votos: d.vote_count ?? 0,
      generos: d.genres.map((g) => g.name),
      extra: d.number_of_seasons
        ? `${d.number_of_seasons} temporada${d.number_of_seasons === 1 ? '' : 's'}`
        : '',
      elenco: normalizarElenco(d.credits?.cast),
    };
  }

  // Muchas obras no tienen sinopsis en español: se intenta la versión en inglés.
  if (!detalle.sinopsis) {
    try {
      const en = await pedir<{ overview: string }>(`${tipo}/${id}`, { language: 'en-US' });
      detalle.sinopsis = en.overview?.trim() ?? '';
    } catch {
      // Si falla, la pantalla muestra un texto alternativo.
    }
  }
  return detalle;
}
