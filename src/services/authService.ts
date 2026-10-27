import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export function registrar(correo: string, contrasena: string): Promise<User> {
  return createUserWithEmailAndPassword(auth, correo.trim(), contrasena).then((c) => c.user);
}

export function iniciarSesion(correo: string, contrasena: string): Promise<User> {
  return signInWithEmailAndPassword(auth, correo.trim(), contrasena).then((c) => c.user);
}

export function cerrarSesion(): Promise<void> {
  return signOut(auth);
}

/** Notifica cada cambio de sesión; devuelve la función para dejar de escuchar. */
export function escucharSesion(callback: (usuario: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
