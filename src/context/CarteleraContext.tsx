import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import * as authService from '../services/authService';
import * as listaService from '../services/listaService';
import { guardarCache, leerCache } from '../services/cacheService';
import { cargarConfiguracion } from '../services/tmdbService';
import type { CambiosElemento, ElementoLista, NuevoElemento } from '../types/lista';
import type { EstadoPeticion } from '../types/peticion';
import { traducirError } from '../utils/erroresFirebase';
import { TiempoAgotadoError } from '../utils/tiempoLimite';
import { normalizarCambios } from '../utils/validaciones';

/** Resultado de una mutación: si quedó pendiente es porque no hubo conexión y se guardó localmente. */
export type ResultadoMutacion = { pendiente: boolean };

interface CarteleraContextValor {
  usuario: User | null;
  cargandoSesion: boolean;
  lista: ElementoLista[];
  estadoLista: EstadoPeticion<ElementoLista[]>;
  /** Fecha (ms) de la copia local que se está mostrando por falta de conexión; null si los datos son del servidor. */
  copiaSinConexion: number | null;
  entrar: (correo: string, contrasena: string) => Promise<void>;
  registrarse: (correo: string, contrasena: string) => Promise<void>;
  salir: () => Promise<void>;
  recargar: () => Promise<void>;
  buscarEnLista: (itemId: string) => ElementoLista | undefined;
  agregar: (obra: NuevoElemento) => Promise<void>;
  actualizar: (itemId: string, cambios: CambiosElemento) => Promise<ResultadoMutacion>;
  eliminar: (itemId: string) => Promise<ResultadoMutacion>;
}

const CarteleraContext = createContext<CarteleraContextValor | null>(null);

export function CarteleraProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [lista, setLista] = useState<ElementoLista[]>([]);
  const [estadoLista, setEstadoLista] = useState<EstadoPeticion<ElementoLista[]>>({ estado: 'cargando' });
  const [copiaSinConexion, setCopiaSinConexion] = useState<number | null>(null);
  const listaRef = useRef<ElementoLista[]>([]);

  /** Único punto que cambia la lista: estado local + caché en AsyncStorage. */
  const fijarLista = useCallback((uid: string, nueva: ElementoLista[]) => {
    listaRef.current = nueva;
    setLista(nueva);
    setEstadoLista({ estado: 'exito', datos: nueva });
    void guardarCache(uid, nueva);
  }, []);

  useEffect(() => {
    void cargarConfiguracion();
    return authService.escucharSesion((u) => {
      setUsuario(u);
      setCargandoSesion(false);
    });
  }, []);

  const recargar = useCallback(async () => {
    if (!usuario) return;
    const uid = usuario.uid;
    if (listaRef.current.length === 0) setEstadoLista({ estado: 'cargando' });
    try {
      const datos = await listaService.obtenerLista(uid);
      setCopiaSinConexion(null);
      fijarLista(uid, datos);
    } catch (error) {
      const cache = await leerCache(uid);
      if (cache) {
        listaRef.current = cache.elementos;
        setLista(cache.elementos);
        setEstadoLista({ estado: 'exito', datos: cache.elementos });
        setCopiaSinConexion(cache.guardadoEn);
      } else {
        setEstadoLista({ estado: 'error', mensaje: traducirError(error) });
      }
    }
  }, [usuario, fijarLista]);

  // Al iniciar sesión: se muestra al instante la copia local y luego se pide la lista al servidor.
  useEffect(() => {
    if (!usuario) {
      listaRef.current = [];
      setLista([]);
      setEstadoLista({ estado: 'cargando' });
      setCopiaSinConexion(null);
      return;
    }
    let cancelado = false;
    void (async () => {
      const cache = await leerCache(usuario.uid);
      if (!cancelado && cache && listaRef.current.length === 0) {
        listaRef.current = cache.elementos;
        setLista(cache.elementos);
        setEstadoLista({ estado: 'exito', datos: cache.elementos });
      }
      if (!cancelado) await recargar();
    })();
    return () => {
      cancelado = true;
    };
  }, [usuario, recargar]);

  // Al recuperar la conexión se vuelve a sincronizar con Firestore.
  useEffect(() => {
    let estabaConectado = true;
    return NetInfo.addEventListener((estado) => {
      const conectado = estado.isConnected !== false && estado.isInternetReachable !== false;
      if (conectado && !estabaConectado) void recargar();
      estabaConectado = conectado;
    });
  }, [recargar]);

  const exigirUsuario = useCallback((): string => {
    if (!usuario) throw new Error('Debes iniciar sesión.');
    return usuario.uid;
  }, [usuario]);

  const agregar = useCallback(
    async (obra: NuevoElemento) => {
      const uid = exigirUsuario();
      try {
        const nuevo = await listaService.agregarElemento(uid, obra);
        fijarLista(uid, [nuevo, ...listaRef.current.filter((e) => e.id !== nuevo.id)]);
      } catch (error) {
        throw new Error(traducirError(error));
      }
    },
    [exigirUsuario, fijarLista],
  );

  /**
   * Actualización optimista: la lista cambia al instante. Si no hay conexión, Firestore deja la escritura
   * en cola y la enviará al reconectar; si el servidor la rechaza, se revierte el cambio.
   */
  const actualizar = useCallback(
    async (itemId: string, cambios: CambiosElemento): Promise<ResultadoMutacion> => {
      const uid = exigirUsuario();
      const anterior = listaRef.current;
      const limpios = normalizarCambios(cambios);
      fijarLista(
        uid,
        anterior.map((e) => (e.id === itemId ? { ...e, ...limpios, actualizadoEn: Date.now() } : e)),
      );
      try {
        await listaService.actualizarElemento(uid, itemId, limpios);
        return { pendiente: false };
      } catch (error) {
        if (error instanceof TiempoAgotadoError) return { pendiente: true };
        fijarLista(uid, anterior);
        throw new Error(traducirError(error));
      }
    },
    [exigirUsuario, fijarLista],
  );

  const eliminar = useCallback(
    async (itemId: string): Promise<ResultadoMutacion> => {
      const uid = exigirUsuario();
      const anterior = listaRef.current;
      fijarLista(uid, anterior.filter((e) => e.id !== itemId));
      try {
        await listaService.eliminarElemento(uid, itemId);
        return { pendiente: false };
      } catch (error) {
        if (error instanceof TiempoAgotadoError) return { pendiente: true };
        fijarLista(uid, anterior);
        throw new Error(traducirError(error));
      }
    },
    [exigirUsuario, fijarLista],
  );

  const conTraduccion = (accion: () => Promise<unknown>) => async () => {
    try {
      await accion();
    } catch (error) {
      throw new Error(traducirError(error));
    }
  };

  const valor = useMemo<CarteleraContextValor>(
    () => ({
      usuario,
      cargandoSesion,
      lista,
      estadoLista,
      copiaSinConexion,
      entrar: (c, p) => conTraduccion(() => authService.iniciarSesion(c, p))(),
      registrarse: (c, p) => conTraduccion(() => authService.registrar(c, p))(),
      salir: () => conTraduccion(() => authService.cerrarSesion())(),
      recargar,
      buscarEnLista: (itemId) => lista.find((e) => e.id === itemId),
      agregar,
      actualizar,
      eliminar,
    }),
    [usuario, cargandoSesion, lista, estadoLista, copiaSinConexion, recargar, agregar, actualizar, eliminar],
  );

  return <CarteleraContext.Provider value={valor}>{children}</CarteleraContext.Provider>;
}

export function useCartelera(): CarteleraContextValor {
  const ctx = useContext(CarteleraContext);
  if (!ctx) throw new Error('useCartelera debe usarse dentro de CarteleraProvider');
  return ctx;
}
