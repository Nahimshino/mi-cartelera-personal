import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { CambiosElemento, ElementoLista, NuevoElemento } from '../types/lista';
import { crearItemId } from '../utils/validaciones';
import { conTiempoLimite } from '../utils/tiempoLimite';

export class DuplicadoError extends Error {
  constructor() {
    super('Esta obra ya está en tu lista.');
    this.name = 'DuplicadoError';
  }
}

function coleccionLista(uid: string) {
  return collection(db, 'usuarios', uid, 'mi_lista');
}

function docLista(uid: string, itemId: string) {
  return doc(db, 'usuarios', uid, 'mi_lista', itemId);
}

function aElemento(snap: QueryDocumentSnapshot<DocumentData>): ElementoLista {
  const d = snap.data();
  return {
    id: snap.id,
    tmdbId: d.tmdbId,
    tipo: d.tipo,
    titulo: d.titulo,
    anio: d.anio,
    posterPath: d.posterPath ?? null,
    estado: d.estado,
    calificacionPersonal: d.calificacionPersonal ?? null,
    comentario: d.comentario ?? '',
    agregadoEn: d.agregadoEn ?? null,
    actualizadoEn: d.actualizadoEn ?? null,
  };
}

/** Lee la lista desde el servidor (falla rápido sin conexión para poder usar la caché). */
export async function obtenerLista(uid: string): Promise<ElementoLista[]> {
  const q = query(coleccionLista(uid), orderBy('agregadoEn', 'desc'));
  const snap = await conTiempoLimite(getDocsFromServer(q));
  return snap.docs.map(aElemento);
}

/** Crea la entrada con estado inicial "por_ver". El id tipo_tmdbId impide duplicados. */
export async function agregarElemento(uid: string, obra: NuevoElemento): Promise<ElementoLista> {
  const id = crearItemId(obra.tipo, obra.tmdbId);
  const ref = docLista(uid, id);

  const existente = await conTiempoLimite(getDocFromServer(ref));
  if (existente.exists()) throw new DuplicadoError();

  const elemento: Omit<ElementoLista, 'id'> = {
    ...obra,
    estado: 'por_ver',
    calificacionPersonal: null,
    comentario: '',
  };
  await conTiempoLimite(
    setDoc(ref, { ...elemento, agregadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() }),
  );
  return { id, ...elemento, agregadoEn: Date.now(), actualizadoEn: Date.now() };
}

export async function actualizarElemento(
  uid: string,
  itemId: string,
  cambios: CambiosElemento,
): Promise<void> {
  await conTiempoLimite(
    updateDoc(docLista(uid, itemId), { ...cambios, actualizadoEn: serverTimestamp() }),
  );
}

export async function eliminarElemento(uid: string, itemId: string): Promise<void> {
  await conTiempoLimite(deleteDoc(docLista(uid, itemId)));
}
