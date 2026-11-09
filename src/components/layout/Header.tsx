/**
 * ESMERALDAS RESILIENTE 2026 - Barra Superior (Header)
 * Diseño profesional institucional, fondos blancos, contraste nítido y reloj en vivo
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { USUARIOS_INICIALES } from '../../data/seed';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  User,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  tituloVista: string;
}

export function Header({ tituloVista }: HeaderProps) {
  const {
    usuario,
    cambiarUsuario,
    online,
    setOnlineManual,
    sincronizando,
    colaOffline,
    restaurarEscenario06AM,
  } = useApp();

  const [horaActual, setHoraActual] = useState<string>('');
  const [menuRolesAbierto, setMenuRolesAbierto] = useState(false);

  // Reloj en tiempo real en zona horaria America/Guayaquil (es-EC)
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      const opciones: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Guayaquil',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const fechaOpciones: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Guayaquil',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      const horaStr = ahora.toLocaleTimeString('es-EC', opciones);
      const fechaStr = ahora.toLocaleDateString('es-EC', fechaOpciones);
      setHoraActual(`${fechaStr} · ${horaStr} ECT`);
    };

    actualizarReloj();
    const interval = setInterval(actualizarReloj, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 py-3 bg-white border-b border-slate-200 text-slate-900 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Título de la vista actual */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
          {tituloVista}
        </h2>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          El Niño 2026 · Alerta Roja
        </span>
      </div>

      {/* Controles de barra superior */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Reloj en vivo (JetBrains Mono) */}
        <div
          title="Hora oficial de Esmeraldas, Ecuador (UTC-5)"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono-num text-slate-700"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{horaActual}</span>
        </div>

        {/* Indicador de conexión de red y cola offline */}
        <div className="flex items-center gap-1">
          {sincronizando ? (
            <div
              title="Sincronizando reportes pendientes..."
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span className="hidden sm:inline">Sincronizando...</span>
            </div>
          ) : online ? (
            <button
              onClick={() => setOnlineManual(false)}
              title="En línea (Clic para simular corte de conexión en campo)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium transition-colors"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">En línea</span>
            </button>
          ) : (
            <button
              onClick={() => setOnlineManual(true)}
              title="Sin conexión (Clic para restablecer conexión y sincronizar)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 text-xs font-medium animate-pulse transition-colors"
            >
              <WifiOff className="w-3.5 h-3.5 text-red-700" />
              <span className="hidden sm:inline">Sin conexión ({colaOffline.length} en cola)</span>
            </button>
          )}
        </div>

        {/* Botón Restaurar Escenario 06:00 AM */}
        <button
          onClick={() => {
            if (window.confirm('¿Desea restaurar el escenario oficial de las 06:00 AM? Todos los datos se reinicializarán a los valores semilla.')) {
              restaurarEscenario06AM();
            }
          }}
          title="Restaurar datos semilla al escenario Jueves 06:00 AM"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden xl:inline">Reiniciar 06:00 AM</span>
        </button>

        {/* Selector de Rol activo (Demostración instantánea para el Jurado) */}
        <div className="relative">
          <button
            onClick={() => setMenuRolesAbierto(!menuRolesAbierto)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all"
            title="Cambiar rol activo para pruebas de demostración"
          >
            {usuario.rol === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />}
            {usuario.rol === 'OPERADOR_COE' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
            {usuario.rol === 'CIUDADANO' && <User className="w-3.5 h-3.5 text-sky-700" />}
            <span className="hidden sm:inline">{usuario.rol}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Menú de roles */}
          {menuRolesAbierto && (
            <div className="absolute right-0 mt-2 w-64 p-2 rounded-xl bg-white border border-slate-200 shadow-xl z-50 text-xs space-y-1 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Cambiar Rol para Demo
              </div>
              {USUARIOS_INICIALES.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    cambiarUsuario(u);
                    setMenuRolesAbierto(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    usuario.id === u.id ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <strong className="block text-slate-900">{u.nombre}</strong>
                    <span className="text-[10px] text-slate-500">{u.email}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                    {u.rol}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
