export class TiempoAgotadoError extends Error {
  constructor() {
    super('Sin respuesta del servidor. Revisa tu conexión.');
    this.name = 'TiempoAgotadoError';
  }
}

/**
 * Espera una promesa como máximo `ms` milisegundos.
 * Sin conexión, Firestore deja las escrituras en cola y nunca resuelve: así no nos quedamos esperando.
 */
export function conTiempoLimite<T>(promesa: Promise<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const temporizador = setTimeout(() => reject(new TiempoAgotadoError()), ms);
    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (error: unknown) => {
        clearTimeout(temporizador);
        reject(error);
      },
    );
  });
}
