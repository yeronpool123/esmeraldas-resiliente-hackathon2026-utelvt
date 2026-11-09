/**
 * ESMERALDAS RESILIENTE 2026
 * Plataforma Web Completa para el Hackathon Oficial UTLVTE 2026
 * Paleta Institucional Verde Bosque / Esmeralda con Fondos Blancos y Limpios
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar, ModuloId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { M1MapModule } from './components/modules/M1MapModule';
import { M2CitizenReport } from './components/modules/M2CitizenReport';
import { M3COEDashboard } from './components/modules/M3COEDashboard';
import { M4SheltersEvacuation } from './components/modules/M4SheltersEvacuation';
import { M5HumanitarianAid } from './components/modules/M5HumanitarianAid';
import { M6PredictiveAI } from './components/modules/M6PredictiveAI';
import { HackathonDeliverables } from './components/modules/HackathonDeliverables';
import {
  Map,
  Megaphone,
  MonitorDot,
  BedDouble,
  Award,
} from 'lucide-react';

function MainLayout() {
  const [moduloActivo, setModuloActivo] = useState<ModuloId>('mapa');

  // Mapeo de títulos para el Header
  const titulos: Record<ModuloId, string> = {
    mapa: 'M1 · Visor Cartográfico y Análisis de Riesgo',
    reportar: 'M2 · Reporte Ciudadano en Campo (Offline-First)',
    coe: 'M3 · Centro de Operaciones de Emergencia (COE Provincial)',
    albergues: 'M4 · Rutas de Evacuación Segura y Albergues Temporales',
    asistencia: 'M5 · Censo de Familias y Asistencia Humanitaria (LOPDP)',
    analitica: 'M6 · Analítica Predictiva e Inteligencia Artificial',
    entregables: 'Entregables Oficiales Hackathon UTLVTE 2026 (100 Pts)',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Sidebar de escritorio en verde esmeralda institucional */}
      <div className="hidden md:flex shrink-0">
        <Sidebar moduloActivo={moduloActivo} onCambiarModulo={setModuloActivo} />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f8fafc]">
        {/* Barra Superior en blanco puro con borde limpio */}
        <Header tituloVista={titulos[moduloActivo]} />

        {/* Área scrolleable de módulos con fondo suave */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {moduloActivo === 'mapa' && <M1MapModule />}
            {moduloActivo === 'reportar' && <M2CitizenReport />}
            {moduloActivo === 'coe' && <M3COEDashboard />}
            {moduloActivo === 'albergues' && <M4SheltersEvacuation />}
            {moduloActivo === 'asistencia' && <M5HumanitarianAid />}
            {moduloActivo === 'analitica' && <M6PredictiveAI />}
            {moduloActivo === 'entregables' && (
              <HackathonDeliverables onNavegarModulo={setModuloActivo} />
            )}
          </div>
        </main>

        {/* Barra de navegación inferior para móviles en campo (360px) en blanco limpio */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setModuloActivo('mapa')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              moduloActivo === 'mapa' ? 'text-[#065f46] font-bold' : 'text-slate-500'
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="text-[9px]">Mapa</span>
          </button>

          <button
            onClick={() => setModuloActivo('reportar')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              moduloActivo === 'reportar' ? 'text-[#065f46] font-bold' : 'text-slate-500'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span className="text-[9px]">Reportar</span>
          </button>

          <button
            onClick={() => setModuloActivo('coe')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              moduloActivo === 'coe' ? 'text-[#065f46] font-bold' : 'text-slate-500'
            }`}
          >
            <MonitorDot className="w-4 h-4" />
            <span className="text-[9px]">COE</span>
          </button>

          <button
            onClick={() => setModuloActivo('albergues')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              moduloActivo === 'albergues' ? 'text-[#065f46] font-bold' : 'text-slate-500'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span className="text-[9px]">Albergues</span>
          </button>

          <button
            onClick={() => setModuloActivo('entregables')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
              moduloActivo === 'entregables' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[9px]">Jurado</span>
          </button>
        </nav>
      </div>

      {/* Contenedor de Toasts de Notificación en Vivo */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
