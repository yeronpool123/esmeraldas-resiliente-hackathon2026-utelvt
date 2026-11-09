/**
 * ESMERALDAS RESILIENTE 2026 - Módulo M3: Centro de Operaciones de Emergencia (COE)
 * Tablero en tiempo real, KPIs ejecutivos, ciclo de vida de incidentes y alertas
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SourceBadge } from '../common/SourceBadge';
import {
  Users,
  Siren,
  Route,
  Home,
  Clock,
  Filter,
  Radio,
  X,
} from 'lucide-react';
import { EstadoIncidente } from '../../types';

export function M3COEDashboard() {
  const {
    incidentes,
    albergues,
    vias,
    familias,
    alertas,
    actualizarEstadoIncidente,
    emitirAlerta,
    usuario,
  } = useApp();

  // Filtros
  const [filtroGravedad, setFiltroGravedad] = useState<string>('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroFuente, setFiltroFuente] = useState<string>('TODAS');
  const [modalAlertaAbierto, setModalAlertaAbierto] = useState<boolean>(false);

  // Formulario de emisión de alerta
  const [tituloAlerta, setTituloAlerta] = useState<string>('');
  const [mensajeAlerta, setMensajeAlerta] = useState<string>('');
  const [nivelAlerta, setNivelAlerta] = useState<'INFORMATIVA' | 'PRECAUCION' | 'ALERTA' | 'EMERGENCIA'>('ALERTA');
  const [sectorAlerta, setSectorAlerta] = useState<string>('Sur de Esmeraldas');

  // Cálculo de KPIs gerenciales (RF-M3-01 y Consulta 3 de S09.2)
  const totalIncidentes = incidentes.length;
  const personasAfectadasTotal = incidentes.reduce((acc, i) => acc + (i.personas_afectadas || 0), 0);
  const alberguesSaturados = albergues.filter(
    a => (a.ocupacion_actual / a.capacidad_maxima) >= 0.9
  ).length;
  const viasInterrumpidas = vias.filter(v => v.estado_transito === 'INTERRUMPIDA').length;
  const reportesPendientes = incidentes.filter(i => i.estado === 'PENDIENTE').length;
  const familiasAfectadasTotal = familias.length;

  // Filtrado de incidentes
  const incidentesFiltrados = incidentes.filter(i => {
    if (filtroGravedad !== 'TODAS' && i.gravedad !== filtroGravedad) return false;
    if (filtroEstado !== 'TODOS' && i.estado !== filtroEstado) return false;
    if (filtroFuente !== 'TODAS' && i.fuente_origen !== filtroFuente) return false;
    return true;
  });

  const handleEmitirAlerta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloAlerta.trim() || !mensajeAlerta.trim()) return;
    emitirAlerta({
      titulo: tituloAlerta,
      mensaje: mensajeAlerta,
      nivel: nivelAlerta,
      sector: sectorAlerta,
    });
    setTituloAlerta('');
    setMensajeAlerta('');
    setModalAlertaAbierto(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tarjetas de KPIs Ejecutivos (RF-M3-01) en blanco con bordes limpios */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Personas Afectadas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Afectados</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-mono-num font-extrabold text-slate-900">
            {personasAfectadasTotal.toLocaleString('es-EC')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Personas en registro</div>
        </div>

        {/* KPI 2: Reportes Pendientes */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pendientes</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono-num font-extrabold text-amber-600">
            {reportesPendientes}
          </div>
          <div className="text-[10px] text-amber-800 mt-1">Requieren despacho</div>
        </div>

        {/* KPI 3: Albergues Críticos */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Albergues &gt;90%</span>
            <Home className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-mono-num font-extrabold text-red-600">
            {alberguesSaturados}
          </div>
          <div className="text-[10px] text-red-700 mt-1">Coliseo al 96.5%</div>
        </div>

        {/* KPI 4: Vías Interrumpidas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vías Cortadas</span>
            <Route className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-mono-num font-extrabold text-red-600">
            {viasInterrumpidas}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Vía E20 bloqueada</div>
        </div>

        {/* KPI 5: Familias Censadas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Familias</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-mono-num font-extrabold text-[#064e3b]">
            {familiasAfectadasTotal}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Censo humanitario</div>
        </div>

        {/* KPI 6: Total Incidentes */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Casos</span>
            <Siren className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-mono-num font-extrabold text-slate-900">
            {totalIncidentes}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Escenario 06:00 AM</div>
        </div>
      </div>

      {/* Barra de Acciones y Filtros */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>

          {/* Filtro Gravedad */}
          <select
            value={filtroGravedad}
            onChange={e => setFiltroGravedad(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-600 outline-none"
          >
            <option value="TODAS">Gravedad: Todas</option>
            <option value="CRITICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-600 outline-none"
          >
            <option value="TODOS">Estado: Todos</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="ATENDIDO">Atendidos</option>
          </select>

          {/* Filtro Fuente */}
          <select
            value={filtroFuente}
            onChange={e => setFiltroFuente(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-600 outline-none"
          >
            <option value="TODAS">Origen: Todos</option>
            <option value="REPORTE_CIUDADANO">Reporte Ciudadano</option>
            <option value="DATO_SIMULADO">Dato Simulado</option>
            <option value="ALERTA_OFICIAL">Alerta Oficial</option>
          </select>
        </div>

        {/* Botón Emitir Alerta Sectorial (RF-M3-05) */}
        {usuario.rol !== 'CIUDADANO' && (
          <button
            onClick={() => setModalAlertaAbierto(true)}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-heading font-bold text-xs tracking-wide shadow flex items-center gap-2 transition-colors"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Emitir Alerta Sectorial</span>
          </button>
        )}
      </div>

      {/* Grid: Incidentes en Vivo + Alertas Vigentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabla de Incidentes Clasificados */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Cola Operativa de Incidentes ({incidentesFiltrados.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono-num">
              Sincronizado vía WebSocket
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {incidentesFiltrados.map(inc => (
              <div key={inc.id} className="py-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      #{inc.id} · {inc.tipo_evento.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.gravedad === 'CRITICA' ? 'bg-red-100 text-red-800 border border-red-200' :
                      inc.gravedad === 'ALTA' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {inc.gravedad}
                    </span>
                    <SourceBadge fuente={inc.fuente_origen} />
                  </div>

                  {/* Ciclo de Vida: Estado del Incidente */}
                  <div className="flex items-center gap-2">
                    {usuario.rol !== 'CIUDADANO' ? (
                      <select
                        value={inc.estado}
                        onChange={e => actualizarEstadoIncidente(inc.id, e.target.value as EstadoIncidente)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="EN_PROCESO">EN PROCESO</option>
                        <option value="ATENDIDO">ATENDIDO</option>
                        <option value="DESCARTADO">DESCARTADO</option>
                      </select>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {inc.estado}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{inc.descripcion}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono-num">
                  <div className="flex items-center gap-4">
                    <span>Afectados: <strong className="text-slate-900">{inc.personas_afectadas}</strong></span>
                    <span>Zona: <strong className="text-emerald-800">{inc.zona_riesgo_nombre || 'General'}</strong></span>
                    {inc.score_ia && (
                      <span>Score IA: <strong className="text-amber-700 font-bold">{inc.score_ia}/100</strong></span>
                    )}
                  </div>
                  <span>{new Date(inc.creado_en).toLocaleTimeString('es-EC')} ECT</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed de Alertas Vigentes */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-600" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Alertas Activas del COE
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                {alertas.length} emitidas
              </span>
            </div>

            <div className="space-y-3">
              {alertas.map(a => (
                <div key={a.id} className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                      {a.nivel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-num">
                      {new Date(a.creado_en).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <strong className="text-xs text-slate-900 block">{a.titulo}</strong>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{a.mensaje}</p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-red-100">
                    Sector: <span className="text-slate-900 font-semibold">{a.sector}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Emitir Alerta */}
      {modalAlertaAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-600" />
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Emitir Alerta Territorial Oficial
                </h3>
              </div>
              <button onClick={() => setModalAlertaAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmitirAlerta} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la Alerta</label>
                <input
                  type="text"
                  value={tituloAlerta}
                  onChange={e => setTituloAlerta(e.target.value)}
                  placeholder="ej. Evacuación preventiva por crecida del Teaone"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nivel de Alerta</label>
                  <select
                    value={nivelAlerta}
                    onChange={e => setNivelAlerta(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
                  >
                    <option value="INFORMATIVA">INFORMATIVA</option>
                    <option value="PRECAUCION">PRECAUCIÓN</option>
                    <option value="ALERTA">ALERTA</option>
                    <option value="EMERGENCIA">EMERGENCIA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sector o Parroquia</label>
                  <input
                    type="text"
                    value={sectorAlerta}
                    onChange={e => setSectorAlerta(e.target.value)}
                    placeholder="ej. Sur de Esmeraldas"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mensaje e Instrucciones a la Población</label>
                <textarea
                  rows={3}
                  value={mensajeAlerta}
                  onChange={e => setMensajeAlerta(e.target.value)}
                  placeholder="Indique medidas inmediatas y albergues habilitados..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAlertaAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow"
                >
                  Emitir y Difundir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
