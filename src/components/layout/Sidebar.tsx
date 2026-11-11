/**
 * ESMERALDAS RESILIENTE 2026 - Barra Lateral de Navegación (Sidebar)
 * Paleta institucional inspirada en el verde bosque esmeraldeño del Escudo de Esmeraldas
 */

import React from 'react';
import { ModuloId } from '../../types';
import { useApp } from '../../context/AppContext';
import { MODULOS_POR_ROL } from '../../lib/permissions';
import {
  Globe,
  Map,
  Megaphone,
  MonitorDot,
  BedDouble,
  HeartHandshake,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
  User,
} from 'lucide-react';

export type { ModuloId } from '../../types';

interface SidebarProps {
  moduloActivo: ModuloId | 'portal' | null;
  onCambiarModulo: (modulo: ModuloId) => void;
  onOpenCitizenPortal: () => void;
}

export function Sidebar({
  moduloActivo,
  onCambiarModulo,
  onOpenCitizenPortal,
}: SidebarProps) {
  const { usuario, incidentes, albergues, colaOffline } = useApp();
  const esCiudadano = usuario.rol === 'CIUDADANO';

  const incidentesPendientes = incidentes.filter(i => i.estado === 'PENDIENTE').length;
  const albergueCritico = albergues.some(
    a => (a.ocupacion_actual / a.capacidad_maxima) >= 0.9
  );

  const menuItems = [
    {
      id: 'mapa' as ModuloId,
      nombre: 'Visor SIG de Riesgos',
      subtitulo: 'M1 · Capas territoriales',
      icono: <Map className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'reportar' as ModuloId,
      nombre: 'Reportar Emergencia',
      subtitulo: 'M2 · Offline-first en campo',
      icono: <Megaphone className="w-5 h-5" />,
      badge: colaOffline.length > 0 ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
          {colaOffline.length} en cola
        </span>
      ) : null,
    },
    {
      id: 'coe' as ModuloId,
      nombre: 'Operaciones COE',
      subtitulo: 'M3 · Tablero en tiempo real',
      icono: <MonitorDot className="w-5 h-5" />,
      badge: incidentesPendientes > 0 ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
          {incidentesPendientes}
        </span>
      ) : null,
    },
    {
      id: 'albergues' as ModuloId,
      nombre: 'Albergues y Rutas',
      subtitulo: 'M4 · Evacuación segura',
      icono: <BedDouble className="w-5 h-5" />,
      badge: albergueCritico ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600/90 text-white">
          96% saturado
        </span>
      ) : null,
    },
    {
      id: 'asistencia' as ModuloId,
      nombre: 'Familias y Asistencia',
      subtitulo: 'M5 · LOPDP y suministros',
      icono: <HeartHandshake className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'analitica' as ModuloId,
      nombre: 'Analítica Predictiva IA',
      subtitulo: 'M6 · Priorización Scikit-learn',
      icono: <BrainCircuit className="w-5 h-5" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-900 text-emerald-200 border border-emerald-400/30">
          94.8% Acc
        </span>
      ),
    },
  ];
  const visibleMenuItems = menuItems.filter(item => MODULOS_POR_ROL[usuario.rol].includes(item.id));

  return (
    <aside className="w-64 bg-[#064e3b] border-r border-[#065f46] text-white flex flex-col shrink-0 min-h-screen shadow-lg">
      {/* Cabecera Institucional: Inspirada en el Escudo de Esmeraldas */}
      <div className="p-5 border-b border-[#047857]/60">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-2 rounded-xl bg-[#022c22] border border-[#059669]/50 text-emerald-300 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base tracking-tight titulo-gradiente-blanco">
              ESMERALDAS
            </h1>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <span className="text-xs font-bold text-emerald-100 tracking-wider">RESILIENTE</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono-num font-bold bg-amber-400 text-slate-950">
                2026
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-emerald-300/80 flex items-center justify-between border-t border-[#047857]/60 pt-2">
          <span>{esCiudadano ? 'Municipio de Esmeraldas' : 'Hackathon UTLVTE 2026'}</span>
          <span className="text-amber-300 font-semibold">{esCiudadano ? 'Gestión de Riesgos' : 'TIC Esmeraldas'}</span>
        </div>
      </div>

      {/* Navegación por Módulos */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider">
          {esCiudadano ? 'Módulo ciudadano' : 'Espacios principales'}
        </div>
        <button
          type="button"
          onClick={onOpenCitizenPortal}
          aria-current={moduloActivo === 'portal' ? 'page' : undefined}
          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all ${
            moduloActivo === 'portal'
              ? 'bg-[#047857] text-white border border-emerald-300/40 shadow-sm font-semibold'
              : 'text-emerald-100/90 hover:bg-[#065f46]/70 hover:text-white border border-transparent'
          }`}
        >
          <span className="flex items-center gap-3 min-w-0">
            <Globe aria-hidden="true" className={`h-5 w-5 shrink-0 ${moduloActivo === 'portal' ? 'text-white' : 'text-emerald-300'}`} />
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold leading-tight">Portal Ciudadano</span>
              <span className="block truncate text-[10px] leading-tight text-emerald-300/80">Información y prevención</span>
            </span>
          </span>
          <span className="rounded bg-sky-800 px-2 py-0.5 text-[9px] font-bold text-sky-100">Público</span>
        </button>

        {!esCiudadano && (
          <>
            <div className="px-3 py-1 text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider">
              Módulos de la Plataforma
            </div>
            {visibleMenuItems.map(item => {
          const activo = moduloActivo === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onCambiarModulo(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all ${
                activo
                  ? 'bg-[#047857] text-white border border-emerald-300/40 shadow-sm font-semibold'
                  : 'text-emerald-100/90 hover:bg-[#065f46]/70 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={activo ? 'text-white' : 'text-emerald-300'}>{item.icono}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-xs leading-tight truncate">{item.nombre}</div>
                  <div className={`text-[10px] leading-tight truncate ${activo ? 'text-emerald-100' : 'text-emerald-300/80'}`}>
                    {item.subtitulo}
                  </div>
                </div>
              </div>
              {item.badge}
            </button>
          );
            })}
          </>
        )}
      </nav>

      {/* Tarjeta de usuario en sesión activa */}
      <div className="p-3 border-t border-[#047857]/60 bg-[#022c22]/50">
        <div className="p-2.5 rounded-xl bg-[#022c22] border border-[#065f46] flex items-center gap-2.5 shadow-xs">
          <div className="p-2 rounded-lg bg-[#064e3b] text-emerald-300 shrink-0 border border-[#047857]">
            {usuario.rol === 'ADMIN' && <ShieldAlert className="w-4 h-4 text-purple-300" />}
            {usuario.rol === 'OPERADOR_COE' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {usuario.rol === 'CIUDADANO' && <User className="w-4 h-4 text-sky-300" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-white truncate">
              {esCiudadano ? 'Ciudadano (Acceso Público)' : usuario.nombre}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-emerald-200 truncate">
                {esCiudadano ? 'Acceso Público' : usuario.rol}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
