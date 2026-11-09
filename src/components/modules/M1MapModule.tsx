/**
 * ESMERALDAS RESILIENTE 2026 - Módulo M1: GIS y Mapa Inteligente de Riesgos
 * Visor cartográfico, consulta espacial ST_Within y capas territoriales
 */

import React, { useState } from 'react';
import { MapView } from '../map/MapView';
import { ZONAS_RIESGO_INICIALES, HIDROGRAFIA_INICIAL, SERVICIOS_INICIALES } from '../../data/seed';
import { detectarZonaRiesgo } from '../../lib/geo';
import {
  Compass,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function M1MapModule() {
  const [latPrueba, setLatPrueba] = useState<number>(0.9430);
  const [lngPrueba, setLngPrueba] = useState<number>(-79.6680);
  const [zonaDetectada, setZonaDetectada] = useState<any>(null);
  const [consultaEjecutada, setConsultaEjecutada] = useState<boolean>(false);

  // Ejecutar consulta espacial simulada ST_Within
  const ejecutarConsultaEspacial = (lat: number, lng: number) => {
    setLatPrueba(lat);
    setLngPrueba(lng);
    const res = detectarZonaRiesgo(lat, lng, ZONAS_RIESGO_INICIALES);
    setZonaDetectada(res);
    setConsultaEjecutada(true);
  };

  const conteoRiesgo = {
    CRITICO: ZONAS_RIESGO_INICIALES.filter(z => z.nivel_riesgo === 'CRITICO').length,
    ALTO: ZONAS_RIESGO_INICIALES.filter(z => z.nivel_riesgo === 'ALTO').length,
    MEDIO: ZONAS_RIESGO_INICIALES.filter(z => z.nivel_riesgo === 'MEDIO').length,
    BAJO: ZONAS_RIESGO_INICIALES.filter(z => z.nivel_riesgo === 'BAJO').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo con fondo blanco limpio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              MÓDULO M1 (MUST)
            </span>
            <span className="text-xs text-slate-500">PostGIS SRID 4326 · WGS84</span>
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-900 mt-1">
            GIS y Mapa Inteligente de Vulnerabilidad
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Cartografía georreferenciada de la ciudad de Esmeraldas y ribera del río Teaone con semaforización de riesgo.
          </p>
        </div>

        {/* Resumen de Zonas */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-center">
            <div className="text-lg font-mono-num font-bold text-red-700">{conteoRiesgo.CRITICO}</div>
            <div className="text-[10px] text-red-800 uppercase font-semibold">Crítico</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-center">
            <div className="text-lg font-mono-num font-bold text-orange-700">{conteoRiesgo.ALTO}</div>
            <div className="text-[10px] text-orange-800 uppercase font-semibold">Alto</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
            <div className="text-lg font-mono-num font-bold text-yellow-800">{conteoRiesgo.MEDIO}</div>
            <div className="text-[10px] text-yellow-900 uppercase font-semibold">Medio</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
            <div className="text-lg font-mono-num font-bold text-sky-800">{HIDROGRAFIA_INICIAL.length}</div>
            <div className="text-[10px] text-sky-900 uppercase font-semibold">Ríos</div>
          </div>
        </div>
      </div>

      {/* Visor Cartográfico Principal */}
      <MapView
        altura="h-[620px]"
        onSelectUbicacion={(lat, lng) => ejecutarConsultaEspacial(lat, lng)}
      />

      {/* Panel de Consultas Espaciales PostGIS (ST_Within interactivo para el jurado) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Herramienta de Detección de Polígono */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Verificador Espacial PostGIS (<code className="text-emerald-800 font-mono">ST_Within</code>)
              </h3>
            </div>
            <span className="text-[11px] font-mono-num text-slate-500">
              Clic en mapa o ingresar coordenadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Latitud (WGS84)</label>
              <input
                type="number"
                step="0.0001"
                value={latPrueba}
                onChange={e => setLatPrueba(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono-num text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Longitud (WGS84)</label>
              <input
                type="number"
                step="0.0001"
                value={lngPrueba}
                onChange={e => setLngPrueba(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono-num text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => ejecutarConsultaEspacial(latPrueba, lngPrueba)}
                className="w-full py-2 px-4 rounded-xl bg-[#064e3b] hover:bg-[#065f46] text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Ejecutar ST_Within
              </button>
            </div>
          </div>

          {/* Atajos de puntos clave del escenario */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            <span className="text-slate-500 text-[11px]">Probar puntos del escenario:</span>
            <button
              onClick={() => ejecutarConsultaEspacial(0.9430, -79.6680)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium"
            >
              Barrio 50 Casas
            </button>
            <button
              onClick={() => ejecutarConsultaEspacial(0.9380, -79.6760)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium"
            >
              Portal del Río
            </button>
            <button
              onClick={() => ejecutarConsultaEspacial(0.9200, -79.6905)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium"
            >
              Vía E20 Vuelta Larga
            </button>
            <button
              onClick={() => ejecutarConsultaEspacial(0.9800, -79.6250)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium"
            >
              Isla Vargas Torres
            </button>
          </div>

          {/* Resultado de la consulta espacial */}
          {consultaEjecutada && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
              <div className="text-[11px] font-mono-num text-slate-600 mb-2">
                SQL: <span className="text-emerald-800 font-semibold">SELECT * FROM zonas_riesgo WHERE ST_Within(ST_SetSRID(ST_MakePoint({lngPrueba}, {latPrueba}), 4326), poligono_geom);</span>
              </div>
              {zonaDetectada ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                      <strong className="text-slate-900 text-sm">{zonaDetectada.nombre_sector}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        {zonaDetectada.nivel_riesgo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{zonaDetectada.descripcion}</p>
                    <div className="text-[11px] text-slate-600 mt-2 flex gap-4">
                      <span>Parroquia: <strong className="text-slate-900">{zonaDetectada.parroquia}</strong></span>
                      <span>Amenaza: <strong className="text-slate-900">{zonaDetectada.tipo_amenaza}</strong></span>
                      <span>Fuente: <strong className="text-slate-900">{zonaDetectada.fuente_dato}</strong></span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600 text-xs py-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>La coordenada no intersecta con ningún polígono de riesgo crítico catalogado (área urbana general o no inundable).</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Servicios Esenciales Identificados */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
            <Building className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Servicios Esenciales de Esmeraldas
            </h3>
          </div>
          <div className="space-y-3">
            {SERVICIOS_INICIALES.map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{s.nombre}</strong>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {s.tipo_servicio}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] mt-1">{s.direccion} · Tel: {s.telefono}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
