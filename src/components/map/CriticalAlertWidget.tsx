import React from 'react';
import { AlertTriangle, MapPin, UsersRound } from 'lucide-react';
import { IncidenteEmergencia } from '../../types';

interface CriticalAlertWidgetProps {
  incidentes: IncidenteEmergencia[];
  onFocusIncident: (incidente: IncidenteEmergencia) => void;
}

export function CriticalAlertWidget({
  incidentes,
  onFocusIncident,
}: CriticalAlertWidgetProps) {
  const incidentesCriticos = incidentes
    .filter(
      incidente =>
        incidente.gravedad === 'CRITICA' &&
        incidente.estado !== 'ATENDIDO' &&
        incidente.estado !== 'DESCARTADO'
    )
    .sort(
      (a, b) =>
        (b.score_ia ?? 0) - (a.score_ia ?? 0) ||
        new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
    );

  if (incidentesCriticos.length === 0) return null;

  return (
    <section
      aria-label="Incidentes críticos activos"
      className="absolute left-2 right-2 top-[5.5rem] z-[450] max-h-[35%] overflow-hidden rounded-xl border border-red-300 bg-white/95 shadow-xl backdrop-blur-md sm:left-3 sm:right-auto sm:top-14 sm:max-h-[45%] sm:w-80"
    >
      <header className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white motion-safe:animate-ping motion-reduce:animate-none" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-red-900">
              Alerta crítica · Atención inmediata
            </h2>
            <p className="text-[10px] text-red-800">
              Selecciona un reporte para ubicarlo en el mapa
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-red-600 px-2 py-1 font-mono-num text-[10px] font-bold text-white">
          {incidentesCriticos.length} activa{incidentesCriticos.length === 1 ? '' : 's'}
        </span>
      </header>

      <ul className="max-h-52 divide-y divide-slate-100 overflow-y-auto">
        {incidentesCriticos.map(incidente => (
          <li key={incidente.id}>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation();
                onFocusIncident(incidente);
              }}
              aria-label={`Centrar mapa en ${incidente.zona_riesgo_nombre || 'incidente crítico'}: ${incidente.tipo_evento.replace(/_/g, ' ')}`}
              className="group w-full px-3 py-2.5 text-left transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-900 group-hover:text-red-800">
                    {incidente.es_sos_publico && incidente.categoria_sos
                      ? `S.O.S. · ${incidente.categoria_sos.replace(/_/g, ' ')}`
                      : incidente.tipo_evento.replace(/_/g, ' ')}
                </span>
                <span className="shrink-0 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-800">
                  CRÍTICA
                </span>
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                <MapPin className="h-3 w-3 shrink-0 text-red-600" aria-hidden="true" />
                <span className="truncate">
                  {incidente.zona_riesgo_nombre || 'Ubicación reportada'}
                </span>
              </span>
              {incidente.estado_sync === 'PENDIENTE' && (
                <span className="mt-1 block text-[10px] font-bold text-amber-800">
                  Pendiente local · aún no visible para otras personas
                </span>
              )}
              {incidente.es_simulacion && (
                <span className="mt-1 block text-[10px] font-bold text-amber-800">
                  Simulación de laboratorio
                </span>
              )}
              <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-700">
                <UsersRound className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />
                {incidente.personas_afectadas} persona{incidente.personas_afectadas === 1 ? '' : 's'} afectada{incidente.personas_afectadas === 1 ? '' : 's'}
                <span aria-hidden="true">·</span>
                {incidente.estado.replace(/_/g, ' ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
