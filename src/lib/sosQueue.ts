import { SOSPendiente } from '../types';

const SOS_QUEUE_KEY = 'er2026_sos_pendientes';

function isSOSPendiente(value: unknown): value is SOSPendiente {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.uuid_cliente === 'string' &&
    typeof record.tipo_evento === 'string' &&
    ['ASISTENCIA', 'INUNDACION', 'DESLIZAMIENTO', 'INCENDIO', 'OTRA'].includes(record.tipo_evento) &&
    typeof record.descripcion === 'string' &&
    typeof record.lat === 'number' &&
    typeof record.lng === 'number' &&
    (record.gps_accuracy_m === null || typeof record.gps_accuracy_m === 'number') &&
    typeof record.capturado_en_dispositivo === 'string' &&
    typeof record.demo_mode === 'boolean'
  );
}

export function obtenerSOSPendientes(): SOSPendiente[] {
  const raw = localStorage.getItem(SOS_QUEUE_KEY);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isSOSPendiente)) {
    throw new Error('La cola local de SOS tiene un formato inválido.');
  }
  return value;
}

export function guardarSOSPendientes(queue: SOSPendiente[]) {
  localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify(queue));
}
