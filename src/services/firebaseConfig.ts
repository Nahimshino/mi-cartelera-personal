import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
// getReactNativePersistence solo existe en la build de React Native de @firebase/auth.
// Metro la resuelve en ejecución; para TypeScript, tsconfig.json apunta "paths" a sus tipos de RN.
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const yaIniciada = getApps().length > 0;
const app = yaIniciada ? getApp() : initializeApp(firebaseConfig);

// La persistencia en AsyncStorage hace que la sesión sobreviva al cerrar la app (RF1).
// Con recarga rápida el módulo se reevalúa, por eso se reutiliza la instancia si ya existe.
export const auth: Auth = yaIniciada
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
