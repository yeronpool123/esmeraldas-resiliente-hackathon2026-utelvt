import { ModuloId, RolUsuario } from '../types';

export const MODULOS_POR_ROL: Record<RolUsuario, readonly ModuloId[]> = {
  CIUDADANO: ['mapa', 'reportar', 'albergues'],
  OPERADOR_COE: ['mapa', 'reportar', 'coe', 'albergues', 'analitica'],
  ADMIN: ['mapa', 'reportar', 'coe', 'albergues', 'asistencia', 'analitica'],
};

export function puedeAcceder(rol: RolUsuario, modulo: ModuloId): boolean {
  return MODULOS_POR_ROL[rol].includes(modulo);
}
