/**
 * ESMERALDAS RESILIENTE 2026 - Módulo M2: Reporte Ciudadano Offline-First
 * Captura GPS, compresión canvas, cola offline y sincronización idempotente
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialWarning } from '../common/OfficialWarning';
import { SourceBadge } from '../common/SourceBadge';
import { MapView } from '../map/MapView';
import {
  Megaphone,
  Camera,
  MapPin,
  WifiOff,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { GravedadIncidente } from '../../types';

export function M2CitizenReport() {
  const {
    crearIncidente,
    online,
    colaOffline,
    sincronizarCola,
    sincronizando,
    incidentes,
  } = useApp();

  // Estados del formulario
  const [tipoEvento, setTipoEvento] = useState<string>('INUNDACION_URBANA');
  const [gravedad, setGravedad] = useState<GravedadIncidente>('ALTA');
  const [descripcion, setDescripcion] = useState<string>('');
  const [personasAfectadas, setPersonasAfectadas] = useState<number>(4);
  const [latitud, setLatitud] = useState<number>(0.9430);
  const [longitud, setLongitud] = useState<number>(-79.6680);
  const [precisionGps, setPrecisionGps] = useState<number | null>(12);
  const [fotoBase64, setFotoBase64] = useState<string | undefined>(undefined);
  const [fotoTamanoOriginal, setFotoTamanoOriginal] = useState<string | null>(null);
  const [fotoTamanoComprimido, setFotoTamanoComprimido] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [pestaña, setPestaña] = useState<'formulario' | 'mis_reportes'>('formulario');

  // Obtener GPS automático del navegador
  const capturarGpsActual = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no es soportada por este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitud(pos.coords.latitude);
        setLongitud(pos.coords.longitude);
        setPrecisionGps(Math.round(pos.coords.accuracy));
      },
      () => {
        setLatitud(0.9440);
        setLongitud(-79.6690);
        setPrecisionGps(null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Compresión de imagen en cliente con HTML5 Canvas (RF-M2-03)
  const manejarSubidaFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      alert('El archivo supera el límite de 5 MB. Por favor seleccione una foto más liviana.');
      return;
    }

    setFotoTamanoOriginal(`${(archivo.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const comprimido = canvas.toDataURL('image/jpeg', 0.7);
          setFotoBase64(comprimido);
          const pesoKBytes = (comprimido.length * (3 / 4) / 1024).toFixed(1);
          setFotoTamanoComprimido(`${pesoKBytes} KB (optimizado)`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(archivo);
  };

  // Enviar reporte
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      alert('Por favor describa brevemente la situación de emergencia.');
      return;
    }

    setEnviando(true);
    await crearIncidente({
      tipo_evento: tipoEvento,
      gravedad,
      descripcion,
      personas_afectadas: personasAfectadas,
      lat: latitud,
      lng: longitud,
      foto_url: fotoBase64,
    });
    setEnviando(false);

    // Resetear formulario
    setDescripcion('');
    setFotoBase64(undefined);
    setFotoTamanoOriginal(null);
    setFotoTamanoComprimido(null);
    setPestaña('mis_reportes');
  };

  // Mis reportes ciudadanos
  const misReportes = incidentes.filter(i => i.fuente_origen === 'REPORTE_CIUDADANO');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Oficial Obligatorio de Seguridad (RF-M2-07) */}
      <OfficialWarning />

      {/* Pestañas: Formulario vs Mis Reportes */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPestaña('formulario')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              pestaña === 'formulario'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formulario de Reporte
          </button>
          <button
            onClick={() => setPestaña('mis_reportes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              pestaña === 'mis_reportes'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Mis Reportes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono-num font-bold">
              {misReportes.length}
            </span>
          </button>
        </div>

        {/* Indicador de cola offline */}
        {colaOffline.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-800 font-medium flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              {colaOffline.length} en cola sin conexión
            </span>
            {online && (
              <button
                onClick={() => sincronizarCola()}
                disabled={sincronizando}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${sincronizando ? 'animate-spin' : ''}`} />
                <span>Sincronizar ahora</span>
              </button>
            )}
          </div>
        )}
      </div>

      {pestaña === 'formulario' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulario Ciudadano con fondo blanco limpio */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-700" />
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  Nuevo Reporte de Emergencia Territorial
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono-num">
                {online ? 'Modo Online' : 'Modo Offline (IndexedDB)'}
              </span>
            </div>

            {/* Tipo de Evento (Chips) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipo de Afectación o Evento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'INUNDACION_URBANA', label: 'Inundación Urbana' },
                  { id: 'DESBORDAMIENTO_RIO', label: 'Desborde de Río' },
                  { id: 'PERSONAS_ATRAPADAS', label: 'Personas Atrapadas' },
                  { id: 'DESLIZAMIENTO_TIERRA', label: 'Deslizamiento' },
                  { id: 'SOLICITUD_SUMINISTROS', label: 'Pedido de Insumos' },
                  { id: 'DANO_ESTRUCTURAL', label: 'Daño de Vivienda' },
                ].map(opc => (
                  <button
                    key={opc.id}
                    type="button"
                    onClick={() => setTipoEvento(opc.id)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      tipoEvento === opc.id
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gravedad Percibida */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gravedad Percibida en Sitio
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'BAJA', label: 'Baja', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                  { id: 'MEDIA', label: 'Media', color: 'border-yellow-400 text-yellow-900 bg-yellow-50' },
                  { id: 'ALTA', label: 'Alta', color: 'border-orange-500 text-orange-900 bg-orange-50' },
                  { id: 'CRITICA', label: 'Crítica', color: 'border-red-500 text-red-900 bg-red-50' },
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGravedad(g.id as GravedadIncidente)}
                    className={`py-2 rounded-xl border text-center font-bold transition-all ${
                      gravedad === g.id
                        ? `${g.color} shadow-xs ring-1 ring-current`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personas Afectadas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número Estimado de Personas Afectadas
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={personasAfectadas}
                onChange={e => setPersonasAfectadas(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono-num text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
              />
            </div>

            {/* Descripción (máx 500 caracteres) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Descripción Detallada de la Situación
                </label>
                <span className="text-[10px] text-slate-500 font-mono-num">
                  {descripcion.length} / 500 caracteres
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Indique puntos de referencia, altura del agua o urgencia particular..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none leading-relaxed"
                required
              />
            </div>

            {/* Foto con compresión en cliente (RF-M2-03) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fotografía de Evidencia (Opcional - máx 5 MB)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors shadow-xs">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Seleccionar imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={manejarSubidaFoto}
                    className="hidden"
                  />
                </label>
                {fotoBase64 ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={fotoBase64}
                      alt="Vista previa evidencia"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-300 shadow-xs"
                    />
                    <div className="text-[11px] text-slate-700">
                      <div>Original: {fotoTamanoOriginal}</div>
                      <div className="text-emerald-700 font-semibold">{fotoTamanoComprimido}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Ninguna fotografía cargada</span>
                )}
              </div>
            </div>

            {/* Botón Primario de Envío en verde institucional */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3 px-4 rounded-xl bg-[#064e3b] hover:bg-[#065f46] text-white font-heading font-bold text-sm tracking-wide shadow transition-all flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando reporte...</span>
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  <span>
                    {online ? 'Enviar Reporte al COE Inmediatamente' : 'Guardar en Cola Offline (Sin Conexión)'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Mini-mapa selector de ubicación GPS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-heading font-bold text-xs text-slate-900">
                    Georreferenciación del Reporte
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={capturarGpsActual}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  <span>Mi GPS</span>
                </button>
              </div>

              <div className="mb-3 text-[11px] text-slate-600 font-mono-num flex justify-between">
                <span>Lat: {latitud.toFixed(4)} | Lon: {longitud.toFixed(4)}</span>
                {precisionGps && <span className="text-emerald-700 font-semibold">±{precisionGps}m</span>}
              </div>

              <MapView
                altura="h-[360px]"
                marcadorSeleccion={[latitud, longitud]}
                onSelectUbicacion={(lat, lng) => {
                  setLatitud(lat);
                  setLongitud(lng);
                }}
              />
              <p className="text-[11px] text-slate-500 italic mt-2 text-center">
                Arrastre el marcador o haga clic en el mapa para ajustar la coordenada exacta.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Listado de Mis Reportes y Seguimiento en blanco limpio */
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Historial de Reportes Ciudadanos Remitidos
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono-num">
              Total registrados: {misReportes.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {misReportes.map(r => (
              <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {r.tipo_evento.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.gravedad === 'CRITICA' ? 'bg-red-50 text-red-800 border border-red-200' :
                      r.gravedad === 'ALTA' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                      'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    }`}>
                      {r.gravedad}
                    </span>
                    <SourceBadge fuente={r.fuente_origen} />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">{r.descripcion}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-4">
                    <span>Afectados: <strong className="text-slate-800">{r.personas_afectadas}</strong></span>
                    <span>Zona: <strong className="text-emerald-800">{r.zona_riesgo_nombre || 'General'}</strong></span>
                    <span>Fecha: {new Date(r.creado_en).toLocaleString('es-EC')}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    r.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-900 border border-amber-300' :
                    r.estado === 'EN_PROCESO' ? 'bg-sky-50 text-sky-900 border border-sky-300' :
                    'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  }`}>
                    {r.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
