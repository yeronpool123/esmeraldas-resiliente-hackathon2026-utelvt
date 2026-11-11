/**
 * ESMERALDAS RESILIENTE 2026 - Barra Superior (Header)
 * Diseño profesional institucional, fondos blancos, contraste nítido y reloj en vivo
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { USUARIOS_INICIALES } from '../../data/seed';
import { RolUsuario } from '../../types';
import {
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  User,
  ShieldAlert,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  tituloVista: string;
  onReturnPortal: () => void;
  onRoleSelected: (role: RolUsuario) => void;
  onLogout: () => void;
}

export function Header({ tituloVista, onReturnPortal, onRoleSelected, onLogout }: HeaderProps) {
  const {
    usuario,
    accessToken,
    online,
    setOnlineManual,
    sincronizando,
    colaOffline,
    sosPendientes,
    restaurarEscenario06AM,
  } = useApp();

  const [horaActual, setHoraActual] = useState<string>('');
  const [menuRolesAbierto, setMenuRolesAbierto] = useState(false);
  const rolSeleccionado = usuario.rol === 'CIUDADANO'
    ? 'Portal Ciudadano'
    : usuario.rol === 'OPERADOR_COE'
      ? 'Operaciones COE'
      : 'Administrador';
  const esCiudadano = usuario.rol === 'CIUDADANO';

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
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h2 className="line-clamp-2 min-w-0 break-words text-base font-bold font-heading leading-tight tracking-tight text-slate-900 sm:text-xl">
          {tituloVista}
        </h2>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {esCiudadano ? 'El Niño 2026 · Alerta Roja' : 'Esmeraldas Resiliente 2026'}
        </span>
      </div>

      {/* Controles de barra superior */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {!esCiudadano && (
          <button
            type="button"
            onClick={onReturnPortal}
            title="Volver al Portal Ciudadano y cerrar la sesión institucional"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Globe aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Portal Ciudadano</span>
          </button>
        )}

        {/* Reloj en vivo con cifras tabulares */}
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
              <span className="hidden sm:inline">Sin conexión ({colaOffline.length + sosPendientes} pendientes)</span>
            </button>
          )}
        </div>

        {/* Botón Restaurar Escenario 06:00 AM */}
        <button
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 md:flex"
          onClick={() => {
            if (window.confirm('¿Desea restaurar el escenario oficial de las 06:00 AM? Todos los datos se reinicializarán a los valores semilla.')) {
              restaurarEscenario06AM();
            }
          }}
          title="Restaurar datos semilla al escenario Jueves 06:00 AM"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden xl:inline">Reiniciar 06:00 AM</span>
        </button>

        {/* Selector de acceso por perfil */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuRolesAbierto(!menuRolesAbierto)}
            aria-expanded={menuRolesAbierto}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all"
            title="Cambiar perfil"
          >
            {usuario.rol === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />}
            {usuario.rol === 'OPERADOR_COE' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
            {usuario.rol === 'CIUDADANO' && <User className="w-3.5 h-3.5 text-sky-700" />}
            <span>{rolSeleccionado}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Menú de roles */}
          {menuRolesAbierto && (
            <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] animate-in fade-in rounded-xl border border-slate-200 bg-white p-2 text-xs shadow-xl duration-100">
              <div className="border-b border-slate-100 px-2 py-2">
                <p className="font-semibold uppercase tracking-wider text-slate-700">Cambiar rol</p>
                <p className="mt-1 leading-4 text-slate-500">El acceso COE y administración requiere credenciales institucionales.</p>
              </div>
              {USUARIOS_INICIALES.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    onRoleSelected(u.rol);
                    setMenuRolesAbierto(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    usuario.rol === u.rol ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <strong className="block text-slate-900">
                      {u.rol === 'CIUDADANO' ? 'Portal Ciudadano' : u.rol === 'OPERADOR_COE' ? 'Operadora COE' : 'Administrador'}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      {u.rol === 'CIUDADANO' ? 'Acceso público' : 'Inicio de sesión requerido'}
                    </span>
                  </div>
                  <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                    u.rol === 'CIUDADANO'
                      ? 'border-sky-200 bg-sky-50 text-sky-800'
                      : u.rol === 'OPERADOR_COE'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-violet-200 bg-violet-50 text-violet-800'
                  }`}>
                    {u.rol === 'CIUDADANO' ? 'PÚBLICO' : u.rol === 'OPERADOR_COE' ? 'COE' : 'ADMIN'}
                  </span>
                </button>
              ))}
              {accessToken && usuario.rol !== 'CIUDADANO' && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMenuRolesAbierto(false);
                  }}
                  className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-lg border-t border-slate-100 px-2.5 pt-2 text-left font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  Cerrar sesión
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
