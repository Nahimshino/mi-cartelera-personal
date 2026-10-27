import { MAX_COMENTARIO, type CambiosElemento } from '../types/lista';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DatosFormulario {
  correo: string;
  contrasena: string;
  confirmacion: string;
}

export type ErroresFormulario = Partial<Record<keyof DatosFormulario, string>>;

export function validarFormulario(datos: DatosFormulario, esRegistro: boolean): ErroresFormulario {
  const errores: ErroresFormulario = {};
  if (!datos.correo.trim()) errores.correo = 'Escribe tu correo.';
  else if (!REGEX_CORREO.test(datos.correo.trim())) errores.correo = 'El correo no tiene un formato válido.';

  if (!datos.contrasena) errores.contrasena = 'Escribe tu contraseña.';
  else if (esRegistro && datos.contrasena.length < 6) errores.contrasena = 'Mínimo 6 caracteres.';

  if (esRegistro && datos.confirmacion !== datos.contrasena) {
    errores.confirmacion = 'Las contraseñas no coinciden.';
  }
  return errores;
}

/** Aplica las reglas de negocio de una entrada (las mismas que valida Firestore en el servidor). */
export function normalizarCambios(cambios: CambiosElemento): CambiosElemento {
  const calificacion =
    cambios.estado === 'vista' && cambios.calificacionPersonal !== null
      ? Math.min(5, Math.max(1, Math.round(cambios.calificacionPersonal)))
      : null;
  return {
    estado: cambios.estado,
    calificacionPersonal: calificacion,
    comentario: cambios.comentario.slice(0, MAX_COMENTARIO),
  };
}

/** Año (AAAA) a partir de una fecha de TMDB "AAAA-MM-DD"; vacío si no hay fecha. */
export function extraerAnio(fecha: string | undefined | null): string {
  return fecha && fecha.length >= 4 ? fecha.slice(0, 4) : '';
}

export function crearItemId(tipo: string, tmdbId: number): string {
  return `${tipo}_${tmdbId}`;
}
