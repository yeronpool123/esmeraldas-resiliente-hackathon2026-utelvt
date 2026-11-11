/**
 * ESMERALDAS RESILIENTE 2026 - Capa de Persistencia Local y Auditoría
 * Gestiona el almacenamiento local, transacciones ACID simuladas y cola offline (M2)
 */

import {
  IncidenteEmergencia,
  Albergue,
  Alerta,
  FamiliaAfectada,
  InventarioItem,
  EntregaAsistencia,
  RegistroAuditoria,
  ReporteOfflinePendiente,
  InfraestructuraVial,
  TipoItemInventario,
} from '../types';
import {
  INCIDENTES_INICIALES,
  ALBERGUES_INICIALES,
  ALERTAS_INICIALES,
  FAMILIAS_INICIALES,
  INVENTARIO_INICIAL,
  ENTREGAS_INICIALES,
  VIAS_INICIALES,
} from '../data/seed';

const STORAGE_KEYS = {
  INCIDENTES: 'er2026_incidentes',
  ALBERGUES: 'er2026_albergues',
  ALERTAS: 'er2026_alertas',
  FAMILIAS: 'er2026_familias',
  INVENTARIO: 'er2026_inventario',
  ENTREGAS: 'er2026_entregas',
  VIAS: 'er2026_vias',
  AUDITORIA: 'er2026_auditoria',
  COLA_OFFLINE: 'er2026_cola_offline',
};

// Cargar o inicializar con semilla
export function inicializarStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INCIDENTES)) {
    resetearEscenarioCompleto();
  }
}

export function resetearEscenarioCompleto() {
  localStorage.setItem(STORAGE_KEYS.INCIDENTES, JSON.stringify(INCIDENTES_INICIALES));
  localStorage.setItem(STORAGE_KEYS.ALBERGUES, JSON.stringify(ALBERGUES_INICIALES));
  localStorage.setItem(STORAGE_KEYS.ALERTAS, JSON.stringify(ALERTAS_INICIALES));
  localStorage.setItem(STORAGE_KEYS.FAMILIAS, JSON.stringify(FAMILIAS_INICIALES));
  localStorage.setItem(STORAGE_KEYS.INVENTARIO, JSON.stringify(INVENTARIO_INICIAL));
  localStorage.setItem(STORAGE_KEYS.ENTREGAS, JSON.stringify(ENTREGAS_INICIALES));
  localStorage.setItem(STORAGE_KEYS.VIAS, JSON.stringify(VIAS_INICIALES));
  
  const auditoriaInicial: RegistroAuditoria[] = [
    {
      id: 1,
      usuario: 'Sistema COE',
      accion: 'INICIALIZACION_ESCENARIO',
      entidad: 'SISTEMA',
      entidad_id: 0,
      detalle: 'Carga de datos semilla oficiales Escenario Jueves 06:00 AM',
      fecha: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify(auditoriaInicial));
  localStorage.setItem(STORAGE_KEYS.COLA_OFFLINE, JSON.stringify([]));
}

// Getters
export function obtenerIncidentes(): IncidenteEmergencia[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INCIDENTES) || '[]') || INCIDENTES_INICIALES;
  } catch {
    return INCIDENTES_INICIALES;
  }
}

export function obtenerAlbergues(): Albergue[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBERGUES) || '[]') || ALBERGUES_INICIALES;
  } catch {
    return ALBERGUES_INICIALES;
  }
}

export function obtenerAlertas(): Alerta[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTAS) || '[]') || ALERTAS_INICIALES;
  } catch {
    return ALERTAS_INICIALES;
  }
}

export function obtenerFamilias(): FamiliaAfectada[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAMILIAS) || '[]') || FAMILIAS_INICIALES;
  } catch {
    return FAMILIAS_INICIALES;
  }
}

export function obtenerInventario(): InventarioItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTARIO) || '[]') || INVENTARIO_INICIAL;
  } catch {
    return INVENTARIO_INICIAL;
  }
}

export function obtenerEntregas(): EntregaAsistencia[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ENTREGAS) || '[]') || ENTREGAS_INICIALES;
  } catch {
    return ENTREGAS_INICIALES;
  }
}

export function obtenerVias(): InfraestructuraVial[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIAS) || '[]') || VIAS_INICIALES;
  } catch {
    return VIAS_INICIALES;
  }
}

export function obtenerAuditoria(): RegistroAuditoria[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITORIA) || '[]');
  } catch {
    return [];
  }
}

export function registrarAuditoria(usuario: string, accion: string, entidad: string, entidad_id: number, detalle: string) {
  const logs = obtenerAuditoria();
  const nuevoLog: RegistroAuditoria = {
    id: Date.now(),
    usuario,
    accion,
    entidad,
    entidad_id,
    detalle,
    fecha: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify([nuevoLog, ...logs.slice(0, 99)]));
}

// Operaciones de negocio transaccionales (ACID)
export function actualizarOcupacionAlbergue(
  albergueId: number,
  delta: number,
  usuarioNombre: string
): { success: boolean; mensaje: string; nuevoAlbergue?: Albergue } {
  const albergues = obtenerAlbergues();
  const index = albergues.findIndex(a => a.id === albergueId);
  if (index === -1) return { success: false, mensaje: 'Albergue no encontrado' };

  const albergue = albergues[index];
  const nuevaOcupacion = albergue.ocupacion_actual + delta;

  if (nuevaOcupacion < 0) {
    return { success: false, mensaje: 'La ocupación no puede ser negativa' };
  }
  if (nuevaOcupacion > albergue.capacidad_maxima) {
    return {
      success: false,
      mensaje: `409 Conflicto: La ocupación solicitada (${nuevaOcupacion}) excede la capacidad máxima (${albergue.capacidad_maxima})`,
    };
  }

  // Actualizar estado semáforo
  let nuevoEstado = albergue.estado;
  const pct = (nuevaOcupacion / albergue.capacidad_maxima) * 100;
  if (pct >= 95) nuevoEstado = 'CASI_LLENO';
  else if (pct >= 100) nuevoEstado = 'LLENO';
  else nuevoEstado = 'DISPONIBLE';

  const actualizado: Albergue = {
    ...albergue,
    ocupacion_actual: nuevaOcupacion,
    estado: nuevoEstado,
  };

  albergues[index] = actualizado;
  localStorage.setItem(STORAGE_KEYS.ALBERGUES, JSON.stringify(albergues));

  registrarAuditoria(
    usuarioNombre,
    'ALBERGUE_OCUPACION_ACTUALIZADA',
    'ALBERGUES',
    albergueId,
    `Ocupación modificada por delta ${delta > 0 ? '+' + delta : delta}. Nueva ocupación: ${nuevaOcupacion}/${albergue.capacidad_maxima}`
  );

  return { success: true, mensaje: 'Ocupación actualizada con éxito', nuevoAlbergue: actualizado };
}

/**
 * Transacción de entrega humanitaria ACID con SELECT FOR UPDATE simulado
 */
export function registrarEntregaHumanitaria(
  familiaId: number,
  tipoItem: TipoItemInventario,
  cantidad: number,
  usuarioNombre: string
): { success: boolean; mensaje: string } {
  const inventario = obtenerInventario();
  const familias = obtenerFamilias();
  const entregas = obtenerEntregas();

  const itemIndex = inventario.findIndex(i => i.tipo_item === tipoItem);
  if (itemIndex === -1) return { success: false, mensaje: 'Ítem de inventario no válido' };

  const item = inventario[itemIndex];
  if (item.stock < cantidad) {
    return {
      success: false,
      mensaje: `409 Conflicto (ACID): Stock insuficiente. Stock actual de ${tipoItem}: ${item.stock}, cantidad solicitada: ${cantidad}. Operación revertida.`,
    };
  }

  const familia = familias.find(f => f.id === familiaId);
  const familiaNombre = familia ? familia.jefe_hogar : `Familia #${familiaId}`;

  // Descontar inventario atómicamente
  item.stock -= cantidad;
  inventario[itemIndex] = item;
  localStorage.setItem(STORAGE_KEYS.INVENTARIO, JSON.stringify(inventario));

  // Crear registro de entrega
  const nuevaEntrega: EntregaAsistencia = {
    id: Date.now(),
    familia_id: familiaId,
    familia_nombre: familiaNombre,
    tipo_item: tipoItem,
    cantidad,
    creado_en: new Date().toISOString(),
    entregado_por: usuarioNombre,
  };
  localStorage.setItem(STORAGE_KEYS.ENTREGAS, JSON.stringify([nuevaEntrega, ...entregas]));

  registrarAuditoria(
    usuarioNombre,
    'ENTREGA_ASISTENCIA_REGISTRADA',
    'ENTREGAS',
    nuevaEntrega.id,
    `Entrega de ${cantidad} unidades de ${tipoItem} a ${familiaNombre}. Stock restante: ${item.stock}`
  );

  return { success: true, mensaje: `Entrega registrada exitosamente. Stock actualizado: ${item.stock}` };
}

// Cola Offline (M2)
export function obtenerColaOffline(): ReporteOfflinePendiente[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLA_OFFLINE) || '[]');
  } catch {
    return [];
  }
}

export function encolarReporteOffline(reporte: ReporteOfflinePendiente) {
  const cola = obtenerColaOffline();
  cola.push(reporte);
  localStorage.setItem(STORAGE_KEYS.COLA_OFFLINE, JSON.stringify(cola));
}

export function limpiarColaOffline() {
  localStorage.setItem(STORAGE_KEYS.COLA_OFFLINE, JSON.stringify([]));
}
