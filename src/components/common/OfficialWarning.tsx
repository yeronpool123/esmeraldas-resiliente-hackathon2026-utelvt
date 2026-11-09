/**
 * ESMERALDAS RESILIENTE 2026 - Aviso Institucional No Sustitución de Canales Oficiales
 * Requisito estricto de la Sección S01 Regla 5
 */

import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

interface OfficialWarningProps {
  compact?: boolean;
}

export function OfficialWarning({ compact = false }: OfficialWarningProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Ejercicio académico de simulación. En emergencias reales comuníquese de inmediato al <strong>ECU 911</strong>.</span>
        </div>
        <span className="font-mono-num font-bold text-amber-900">ECU 911</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-amber-900">Aviso Oficial de Seguridad</h4>
          <p className="text-xs text-amber-800/90 mt-0.5">
            Esta plataforma web es un desarrollo del <strong>Hackathon UTLVTE 2026</strong> con fines de simulación operativa. Ante una situación de riesgo inminente, desbordamiento o evacuación real, contacte inmediatamente al <strong>ECU 911</strong> y acate las disposiciones de la <strong>SNGR</strong> y del <strong>INAMHI</strong>.
          </p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
        <a
          href="tel:911"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Llamar ECU 911</span>
        </a>
      </div>
    </div>
  );
}
