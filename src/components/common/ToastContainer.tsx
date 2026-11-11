/**
 * ESMERALDAS RESILIENTE 2026 - Contenedor de Notificaciones Toast
 * Estilo sobrio, institucional, sin emojis, iconografía vectorial exclusiva con Lucide
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertOctagon, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, quitarToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-3 right-3 top-3 z-[1000] flex w-auto max-w-none flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm">
      {toasts.map(t => {
        let borderColor = 'border-slate-300';
        let bgGradient = 'bg-white';
        let icon = <Info className="w-5 h-5 text-sky-600 shrink-0" />;

        if (t.tipo === 'exito') {
          borderColor = 'border-emerald-300';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        } else if (t.tipo === 'error') {
          borderColor = 'border-red-300';
          icon = <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />;
        } else if (t.tipo === 'alerta') {
          borderColor = 'border-amber-300';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border ${borderColor} ${bgGradient} text-slate-900 shadow-xl flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs tracking-wide uppercase text-slate-800">{t.titulo}</h5>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">{t.mensaje}</p>
            </div>
            <button
              onClick={() => quitarToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
