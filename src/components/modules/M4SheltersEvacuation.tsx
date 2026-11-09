/**
 * ESMERALDAS RESILIENTE 2026 - Módulo M4: Rutas de Evacuación y Albergues
 * Capacidad en vivo, cálculo de albergue seguro más cercano con detección de vía bloqueada
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { buscarAlberguesCercanos, AlbergueCercanoResultado } from '../../lib/geo';
import { MapView } from '../map/MapView';
import {
  BedDouble,
  Navigation,
  Route,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react';
import { EstadoTransito } from '../../types';

export function M4SheltersEvacuation() {
  const {
    albergues,
    vias,
    cambiarOcupacionAlbergue,
    cambiarEstadoVia,
    usuario,
  } = useApp();

  // Coordenada de origen de evacuación (default: Portal del Río del escenario)
  const [origenLat, setOrigenLat] = useState<number>(0.9380);
  const [origenLng, setOrigenLng] = useState<number>(-79.6760);
  const [sectorNombre, setSectorNombre] = useState<string>('Portal del Río (Acceso Sur)');

  // Calcular albergues cercanos con lógica PostGIS y detección de corte vial
  const resultadosCercanos: AlbergueCercanoResultado[] = buscarAlberguesCercanos(
    origenLat,
    origenLng,
    albergues,
    vias
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo con fondo blanco limpio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              MÓDULO M4 (SHOULD)
            </span>
            <span className="text-xs text-slate-500">PostGIS ST_Distance & Buffer 150m</span>
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-900 mt-1">
            Gestión de Albergues Temporales y Rutas de Evacuación
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitoreo de ocupación en vivo y redirección inteligente de familias afectadas evitando cortes viales.
          </p>
        </div>

        {/* Alerta del Coliseo Municipal al 96.5% */}
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs">
            <strong className="text-red-900 block">Coliseo Municipal Crítico</strong>
            <span className="text-red-800">386 / 400 ocupados (96.5%). Redirigir a UE 5 de Agosto.</span>
          </div>
        </div>
      </div>

      {/* Grid: Buscador de Albergue Seguro + Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Izquierdo: Calculador de Evacuación Segura */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-700" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Sugerencia de Albergue Seguro
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono-num">
                ST_Distance
              </span>
            </div>

            {/* Selector de Punto de Evacuación */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Punto de Origen de la Familia / Evacuados
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <button
                  onClick={() => {
                    setOrigenLat(0.9380);
                    setOrigenLng(-79.6760);
                    setSectorNombre('Portal del Río (Acceso Sur)');
                  }}
                  className={`p-2 rounded-xl border text-left font-medium transition-all ${
                    sectorNombre.includes('Portal')
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Portal del Río (Crecida)
                </button>
                <button
                  onClick={() => {
                    setOrigenLat(0.9430);
                    setOrigenLng(-79.6680);
                    setSectorNombre('Barrio 50 Casas');
                  }}
                  className={`p-2 rounded-xl border text-left font-medium transition-all ${
                    sectorNombre.includes('50 Casas')
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Barrio 50 Casas (Inundado)
                </button>
                <button
                  onClick={() => {
                    setOrigenLat(0.9120);
                    setOrigenLng(-79.7000);
                    setSectorNombre('Vuelta Larga Rural');
                  }}
                  className={`p-2 rounded-xl border text-left font-medium transition-all ${
                    sectorNombre.includes('Vuelta Larga')
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Vuelta Larga (Vía Cortada)
                </button>
                <button
                  onClick={() => {
                    setOrigenLat(0.9470);
                    setOrigenLng(-79.6700);
                    setSectorNombre('Barrio Los Mangos');
                  }}
                  className={`p-2 rounded-xl border text-left font-medium transition-all ${
                    sectorNombre.includes('Los Mangos')
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Barrio Los Mangos
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono-num p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-3">
                <span className="font-medium text-slate-800">{sectorNombre}</span>
                <span>Lat: {origenLat.toFixed(4)} | Lon: {origenLng.toFixed(4)}</span>
              </div>
            </div>

            {/* Ranking de Albergues Disponibles */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Albergues con Cupo Ordenados por Distancia Geodésica:
              </span>

              {resultadosCercanos.map((res, idx) => (
                <div
                  key={res.albergue.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    res.ruta_bloqueada
                      ? 'bg-red-50/70 border-red-300'
                      : idx === 0
                      ? 'bg-emerald-50/60 border-emerald-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-slate-900">{res.albergue.nombre_albergue}</strong>
                        {idx === 0 && !res.ruta_bloqueada && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            RECOMENDADO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Distancia: <strong className="text-slate-900 font-mono-num">{res.distancia_m.toLocaleString('es-EC')} metros</strong> ({ (res.distancia_m / 1000).toFixed(1) } km)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-800 font-mono-num">
                        {res.cupos_libres} cupos
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {res.albergue.ocupacion_actual}/{res.albergue.capacidad_maxima} ({res.porcentaje_ocupacion}%)
                      </div>
                    </div>
                  </div>

                  {/* Advertencia de Vía Bloqueada (ST_Buffer 150m) */}
                  {res.ruta_bloqueada ? (
                    <div className="mt-2.5 p-2 rounded-lg bg-red-100/80 border border-red-300 text-[11px] text-red-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                      <span>{res.advertencia_via}</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-emerald-800 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ruta directa despejada (vías de acceso operativas).</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Mapa y Gestión de Ocupación */}
        <div className="lg:col-span-7 space-y-4">
          <MapView
            altura="h-[360px]"
            marcadorSeleccion={[origenLat, origenLng]}
          />

          {/* Tabla de Albergues con Control Transaccional (+ / -) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-emerald-700" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Inventario de Albergues y Capacidad en Vivo
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono-num">
                Actualización transaccional
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {albergues.map(a => {
                const pct = (a.ocupacion_actual / a.capacidad_maxima) * 100;
                let colorBarra = 'bg-emerald-600';
                if (pct >= 90) colorBarra = 'bg-red-600';
                else if (pct >= 70) colorBarra = 'bg-amber-500';

                return (
                  <div key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-slate-900 truncate">{a.nombre_albergue}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pct >= 90 ? 'bg-red-100 text-red-800 border border-red-200' :
                          pct >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {Math.round(pct)}% {a.estado.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {a.direccion} · Responsable: {a.responsable}
                      </div>
                      
                      {/* Barra de Capacidad */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${colorBarra} transition-all duration-300`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Acciones de Operador (+ / -) con validación transaccional */}
                    {usuario.rol !== 'CIUDADANO' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right text-[11px] font-mono-num text-slate-800 pr-2">
                          <strong>{a.ocupacion_actual}</strong> / {a.capacidad_maxima}
                        </div>
                        <button
                          onClick={() => cambiarOcupacionAlbergue(a.id, -5)}
                          title="Restar 5 personas (desalojo o reubicación)"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => cambiarOcupacionAlbergue(a.id, 5)}
                          title="Sumar 5 evacuados (ingreso al albergue)"
                          className="p-1.5 rounded-lg bg-[#064e3b] hover:bg-[#065f46] text-white transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gestión del Estado Vial (Vía E20, E15, Libertad) */}
          {usuario.rol !== 'CIUDADANO' && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-heading font-bold text-xs text-slate-900">
                    Control Operativo del Estado Vial
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500">Transmisión en tiempo real</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {vias.map(v => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 text-xs truncate max-w-[180px]">{v.nombre_via}</strong>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        v.estado_transito === 'INTERRUMPIDA' ? 'bg-red-100 text-red-800 border border-red-200' :
                        v.estado_transito === 'PRECAUCION' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {v.estado_transito}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {(['OPERATIVA', 'PRECAUCION', 'INTERRUMPIDA'] as EstadoTransito[]).map(st => (
                        <button
                          key={st}
                          onClick={() => cambiarEstadoVia(v.id, st)}
                          className={`flex-1 py-1 rounded text-[10px] font-semibold border transition-all ${
                            v.estado_transito === st
                              ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {st.slice(0, 4)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
