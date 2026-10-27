import type { NavigatorScreenParams } from '@react-navigation/native';
import type { TipoObra } from './lista';

export type PestanasParamList = {
  Buscar: undefined;
  MiLista: undefined;
  AcercaDe: undefined;
};

export type AppStackParamList = {
  Pestanas: NavigatorScreenParams<PestanasParamList>;
  Detalle: { tipo: TipoObra; id: number; titulo: string };
  Editar: { itemId: string };
};

export type AuthStackParamList = {
  Login: undefined;
};
