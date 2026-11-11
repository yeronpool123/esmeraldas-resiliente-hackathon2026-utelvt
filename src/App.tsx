/**
 * ESMERALDAS RESILIENTE 2026
 * Plataforma Web Completa para el Hackathon Oficial UTLVTE 2026
 * Paleta Institucional Verde Bosque / Esmeralda con Fondos Blancos y Limpios
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { InstitutionalLoginModal } from './components/auth/InstitutionalLoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import { M1MapModule } from './components/modules/M1MapModule';
import { M2CitizenReport } from './components/modules/M2CitizenReport';
import { M3COEDashboard } from './components/modules/M3COEDashboard';
import { M4SheltersEvacuation } from './components/modules/M4SheltersEvacuation';
import { M5HumanitarianAid } from './components/modules/M5HumanitarianAid';
import { M6PredictiveAI } from './components/modules/M6PredictiveAI';
import { RoleHomeView } from './components/welcome/RoleHomeView';
import { CitizenPortalView } from './components/welcome/CitizenPortalView';
import { useApp } from './context/AppContext';
import { ModuloId, RolUsuario } from './types';
import { MODULOS_POR_ROL, puedeAcceder } from './lib/permissions';
import {
  Map,
  Megaphone,
  MonitorDot,
  BedDouble,
  HeartHandshake,
  BrainCircuit,
  Globe,
} from 'lucide-react';

function MainLayout() {
  const { usuario, sesionInstitucionalActiva, cerrarSesion, mostrarToast } = useApp();
  const [vista, setVista] = useState<'inicio' | 'modulo'>('inicio');
  const [moduloActivo, setModuloActivo] = useState<ModuloId | null>(null);
  const [loginRole, setLoginRole] = useState<Exclude<RolUsuario, 'CIUDADANO'> | null>(null);

  const seleccionarPerfil = (role: RolUsuario, openMap = false) => {
    if (role === 'CIUDADANO') {
      if (sesionInstitucionalActiva) void cerrarSesion();
      setLoginRole(null);
      setModuloActivo(openMap ? 'mapa' : null);
      setVista(openMap ? 'modulo' : 'inicio');
      return;
    }
    if (sesionInstitucionalActiva && usuario.rol === role) {
      setModuloActivo(null);
      setVista('inicio');
      return;
    }
    setLoginRole(role);
  };

  const navegarPortalCiudadano = () => {
    seleccionarPerfil('CIUDADANO');
  };

  const volverAlPortalCiudadano = () => {
    if (sesionInstitucionalActiva) void cerrarSesion();
    setModuloActivo(null);
    setVista('inicio');
  };

  const navegarAModulo = (module: ModuloId) => {
    if (!puedeAcceder(usuario.rol, module)) {
      mostrarToast('error', 'Acceso restringido', 'Tu perfil no tiene permiso para abrir este módulo.');
      return;
    }
    if (usuario.rol !== 'CIUDADANO' && !sesionInstitucionalActiva) {
      setLoginRole(usuario.rol);
      return;
    }
    setModuloActivo(module);
    setVista('modulo');
  };

  // Mapeo de títulos para el Header
  const titulos: Record<ModuloId, string> = {
    mapa: 'M1 · Visor Cartográfico y Análisis de Riesgo',
    reportar: 'M2 · Reporte Ciudadano en Campo (Offline-First)',
    coe: 'M3 · Centro de Operaciones de Emergencia (COE Provincial)',
    albergues: 'M4 · Rutas de Evacuación Segura y Albergues Temporales',
    asistencia: 'M5 · Censo de Familias y Asistencia Humanitaria (LOPDP)',
    analitica: 'M6 · Analítica Predictiva e Inteligencia Artificial',
  };

  const activeNavigation = vista === 'inicio' ? 'portal' : moduloActivo;
  const title = vista === 'inicio'
    ? usuario.rol === 'CIUDADANO'
      ? 'Portal Ciudadano · Información y Prevención Territorial'
      : usuario.rol === 'OPERADOR_COE'
        ? 'Operaciones COE · Esmeraldas Resiliente 2026'
        : 'Administración · Esmeraldas Resiliente 2026'
    : moduloActivo
      ? titulos[moduloActivo]
      : 'Esmeraldas Resiliente 2026';
  const mobileIcons = {
    mapa: Map,
    reportar: Megaphone,
    coe: MonitorDot,
    albergues: BedDouble,
    asistencia: HeartHandshake,
    analitica: BrainCircuit,
  };
  const mobileLabels: Record<ModuloId, string> = {
    mapa: 'Mapa',
    reportar: 'Reportar',
    coe: 'COE',
    albergues: 'Albergues',
    asistencia: 'Asistencia',
    analitica: 'Analítica',
  };

  return (
    <div className="flex h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Sidebar de escritorio en verde esmeralda institucional */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          moduloActivo={activeNavigation}
          onCambiarModulo={navegarAModulo}
          onOpenCitizenPortal={navegarPortalCiudadano}
        />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f8fafc]">
        {/* Barra Superior en blanco puro con borde limpio */}
        <Header
          tituloVista={title}
          onReturnPortal={volverAlPortalCiudadano}
          onRoleSelected={role => seleccionarPerfil(role)}
          onLogout={() => {
            void cerrarSesion();
            setModuloActivo(null);
            setVista('inicio');
          }}
        />

        {/* Área scrolleable de módulos con fondo suave */}
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:p-6 md:pb-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            {vista === 'inicio' && (
              usuario.rol === 'CIUDADANO'
                ? <CitizenPortalView onNavigate={navegarAModulo} />
                : <RoleHomeView
                    role={usuario.rol}
                    onNavigate={navegarAModulo}
                    onReturnToPortal={volverAlPortalCiudadano}
                  />
            )}
            {vista === 'modulo' && moduloActivo === 'mapa' && <M1MapModule />}
            {vista === 'modulo' && moduloActivo === 'reportar' && <M2CitizenReport />}
            {vista === 'modulo' && moduloActivo === 'coe' && <M3COEDashboard />}
            {vista === 'modulo' && moduloActivo === 'albergues' && <M4SheltersEvacuation />}
            {vista === 'modulo' && moduloActivo === 'asistencia' && <M5HumanitarianAid />}
            {vista === 'modulo' && moduloActivo === 'analitica' && <M6PredictiveAI />}
          </div>
        </main>

        {/* Barra de navegación inferior para móviles en campo (360px) en blanco limpio */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1 pb-[calc(0.375rem+env(safe-area-inset-bottom))] pt-1.5 shadow-lg backdrop-blur-md md:hidden">
          {usuario.rol === 'CIUDADANO' && (
            <button
              type="button"
              onClick={navegarPortalCiudadano}
              className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${vista === 'inicio' ? 'text-[#065f46] font-bold' : 'text-slate-500'}`}
            >
              <Globe aria-hidden="true" className="w-4 h-4" />
              <span className="text-[9px]">Portal</span>
            </button>
          )}
          {MODULOS_POR_ROL[usuario.rol].map(module => {
            const Icon = mobileIcons[module];
            return (
              <button
                type="button"
                key={module}
                onClick={() => navegarAModulo(module)}
                aria-label={`Abrir ${mobileLabels[module]}`}
                className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${
                  moduloActivo === module ? 'text-[#065f46] font-bold' : 'text-slate-500'
                }`}
              >
                <Icon aria-hidden="true" className="w-4 h-4" />
                <span className="text-[9px]">{mobileLabels[module]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenedor de Toasts de Notificación en Vivo */}
      <ToastContainer />
      <InstitutionalLoginModal
        role={loginRole}
        onClose={() => setLoginRole(null)}
        onSuccess={() => {
          setLoginRole(null);
          setModuloActivo(null);
          setVista('inicio');
        }}
      />
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
