/**
 * ESMERALDAS RESILIENTE 2026 - Badge de Origen de Datos (Requisito Oficial del Reto)
 * Diferencia visiblemente REPORTE_CIUDADANO, DATO_SIMULADO y ALERTA_OFICIAL con contraste institucional
 */

import React from 'react';
import { Megaphone, FlaskConical, ShieldCheck } from 'lucide-react';
import { FuenteOrigen } from '../../types';

interface SourceBadgeProps {
  fuente: FuenteOrigen | string;
  size?: 'sm' | 'md';
}

export function SourceBadge({ fuente, size = 'sm' }: SourceBadgeProps) {
  const isSm = size === 'sm';

  if (fuente === 'ALERTA_OFICIAL') {
    return (
      <span
        title="Fuente: Alerta emitida por organismos oficiales (INAMHI / SNGR / COE)"
        className={`inline-flex items-center gap-1 font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 ${
          isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        }`}
      >
        <ShieldCheck className={isSm ? 'w-3 h-3 text-emerald-700' : 'w-4 h-4 text-emerald-700'} />
        <span>ALERTA OFICIAL</span>
      </span>
    );
  }

  if (fuente === 'DATO_SIMULADO') {
    return (
      <span
        title="Fuente: Registro sintético generado para ejercicio de simulación de emergencia"
        className={`inline-flex items-center gap-1 font-semibold rounded-md bg-slate-100 text-slate-700 border border-dashed border-slate-300 ${
          isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        }`}
      >
        <FlaskConical className={isSm ? 'w-3 h-3 text-slate-600' : 'w-4 h-4 text-slate-600'} />
        <span>DATO SIMULADO</span>
      </span>
    );
  }

  // REPORTE_CIUDADANO por defecto
  return (
    <span
      title="Fuente: Reporte directo remitido por ciudadano geolocalizado en territorio"
      className={`inline-flex items-center gap-1 font-semibold rounded-md bg-sky-50 text-sky-800 border border-sky-300 ${
        isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <Megaphone className={isSm ? 'w-3 h-3 text-sky-700' : 'w-4 h-4 text-sky-700'} />
      <span>REPORTE CIUDADANO</span>
    </span>
  );
}
