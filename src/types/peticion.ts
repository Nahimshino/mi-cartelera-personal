export type EstadoPeticion<T> =
  | { estado: 'cargando' }
  | { estado: 'exito'; datos: T }
  | { estado: 'error'; mensaje: string };
