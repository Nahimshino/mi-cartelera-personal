import { FirebaseError } from 'firebase/app';

const MENSAJES: Record<string, string> = {
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/missing-email': 'Escribe tu correo.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/password-does-not-meet-requirements': 'La contraseña no cumple los requisitos de seguridad.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión a internet. Revisa tu red.',
  'auth/operation-not-allowed': 'El inicio de sesión con correo no está habilitado en Firebase.',
  'auth/configuration-not-found': 'Firebase Auth no está configurado en este proyecto.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'La clave de Firebase no es válida. Revisa el archivo .env.',
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  unavailable: 'El servidor no está disponible. Revisa tu conexión.',
  'deadline-exceeded': 'La operación tardó demasiado. Revisa tu conexión.',
  'resource-exhausted': 'Se alcanzó el límite de uso. Inténtalo más tarde.',
};

/** Convierte cualquier error (de Firebase o no) en un mensaje en español para el usuario. */
export function traducirError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MENSAJES[error.code] ?? `Ocurrió un error inesperado (${error.code}).`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}
