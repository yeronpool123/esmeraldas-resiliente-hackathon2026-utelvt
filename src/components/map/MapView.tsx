/**
 * ESMERALDAS RESILIENTE 2026 - Visor Cartográfico Inteligente (Módulo M1 y M4)
 * Motor Leaflet con capas vectoriales GeoJSON, semáforo de riesgo y estilo institucional
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { ZONAS_RIESGO_INICIALES, HIDROGRAFIA_INICIAL } from '../../data/seed';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface MapViewProps {
  onSelectUbicacion?: (lat: number, lng: number) => void;
  marcadorSeleccion?: [number, number] | null;
  centrarEn?: [number, number] | null;
  mostrarControlesCapas?: boolean;
  altura?: string;
  incidenteFocoId?: number | null;
}

export function MapView({
  onSelectUbicacion,
  marcadorSeleccion,
  centrarEn,
  mostrarControlesCapas = true,
  altura = 'h-[600px]',
  incidenteFocoId,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{ [key: string]: any }>({});
  const markerSeleccionRef = useRef<L.Marker | null>(null);

  const { incidentes, albergues, vias } = useApp();

  // Estados de visualización de capas
  const [capaBase, setCapaBase] = useState<'osm' | 'satelite'>('osm');
  const [verZonasRiesgo, setVerZonasRiesgo] = useState(true);
  const [verRios, setVerRios] = useState(true);
  const [verVias, setVerVias] = useState(true);
  const [verIncidentes, setVerIncidentes] = useState(true);
  const [verAlbergues, setVerAlbergues] = useState(true);
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false);
  const [leyendaAbierta, setLeyendaAbierta] = useState(true);

  // Inicialización del mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centro oficial del reto: 0.9592, -79.6539
    const map = L.map(mapContainerRef.current, {
      center: [0.9592, -79.6539],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    // Control de zoom en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Inicializar grupos de capas
    const baseOsm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const baseSatelite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      }
    );

    baseOsm.addTo(map);

    layersGroupRef.current = {
      baseOsm,
      baseSatelite,
      zonas: L.layerGroup().addTo(map),
      rios: L.layerGroup().addTo(map),
      vias: L.layerGroup().addTo(map),
      incidentes: L.layerGroup().addTo(map),
      albergues: L.layerGroup().addTo(map),
    };

    // Evento de clic en mapa para geolocalización manual
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectUbicacion) {
        onSelectUbicacion(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cambio de capa base
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layersGroupRef.current;
    if (!map || !groups) return;

    if (capaBase === 'osm') {
      map.removeLayer(groups.baseSatelite);
      map.addLayer(groups.baseOsm);
    } else {
      map.removeLayer(groups.baseOsm);
      map.addLayer(groups.baseSatelite);
    }
  }, [capaBase]);

  // Renderizar Zonas de Riesgo
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current.zonas;
    if (!map || !group) return;

    group.clearLayers();
    if (!verZonasRiesgo) return;

    ZONAS_RIESGO_INICIALES.forEach(zona => {
      let fillColor = '#16a34a'; // BAJO
      let borderColor = '#15803d';

      if (zona.nivel_riesgo === 'CRITICO') {
        fillColor = '#dc2626';
        borderColor = '#b91c1c';
      } else if (zona.nivel_riesgo === 'ALTO') {
        fillColor = '#ea580c';
        borderColor = '#c2410c';
      } else if (zona.nivel_riesgo === 'MEDIO') {
        fillColor = '#ca8a04';
        borderColor = '#a16207';
      }

      const polygon = L.polygon(zona.poligono, {
        color: borderColor,
        fillColor: fillColor,
        fillOpacity: 0.3,
        weight: 2,
        dashArray: zona.nivel_riesgo === 'CRITICO' ? '4, 4' : undefined,
      });

      polygon.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">${zona.nombre_sector}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${fillColor}20; color: ${borderColor}; border: 1px solid ${borderColor};">
              ${zona.nivel_riesgo}
            </span>
          </div>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #334155; line-height: 1.4;">${zona.descripcion}</p>
          <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <div>Parroquia: <strong style="color: #1e293b;">${zona.parroquia}</strong></div>
            <div>Tipo de amenaza: <strong style="color: #1e293b;">${zona.tipo_amenaza.replace(/_/g, ' ')}</strong></div>
            <div>Fuente de dato: <strong style="color: #1e293b;">${zona.fuente_dato}</strong></div>
          </div>
        </div>
      `);

      group.addLayer(polygon);
    });
  }, [verZonasRiesgo]);

  // Renderizar Hidrografía (Ríos)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current.rios;
    if (!map || !group) return;

    group.clearLayers();
    if (!verRios) return;

    HIDROGRAFIA_INICIAL.forEach(rio => {
      const line = L.polyline(rio.linea, {
        color: '#0284c7',
        weight: rio.nombre.includes('Esmeraldas') ? 5 : 4,
        opacity: 0.85,
      });

      line.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a;">
          <strong style="color: #0284c7; font-size: 13px;">${rio.nombre}</strong>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Cuerpo hídrico superficial principal</div>
        </div>
      `);

      group.addLayer(line);
    });
  }, [verRios]);

  // Renderizar Infraestructura Vial
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current.vias;
    if (!map || !group) return;

    group.clearLayers();
    if (!verVias) return;

    vias.forEach(via => {
      let color = '#16a34a'; // OPERATIVA
      let dashArray: string | undefined = undefined;

      if (via.estado_transito === 'INTERRUMPIDA') {
        color = '#dc2626';
        dashArray = '8, 8';
      } else if (via.estado_transito === 'PRECAUCION') {
        color = '#d97706';
        dashArray = '4, 4';
      }

      const line = L.polyline(via.linea, {
        color,
        weight: via.categoria === 'TRONCAL' ? 5 : 3.5,
        dashArray,
        opacity: 0.9,
      });

      line.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 12px;">${via.nombre_via}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${color}20; color: ${color}; border: 1px solid ${color};">
              ${via.estado_transito}
            </span>
          </div>
          <p style="font-size: 11px; color: #334155; margin: 0 0 4px 0; line-height: 1.4;">${via.detalle_estado}</p>
          <div style="font-size: 10px; color: #64748b;">Categoría: ${via.categoria}</div>
        </div>
      `);

      group.addLayer(line);
    });
  }, [vias, verVias]);

  // Renderizar Albergues
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current.albergues;
    if (!map || !group) return;

    group.clearLayers();
    if (!verAlbergues) return;

    albergues.forEach(albergue => {
      const pct = (albergue.ocupacion_actual / albergue.capacidad_maxima) * 100;
      let badgeColor = '#16a34a'; // <70%
      if (pct >= 90) badgeColor = '#dc2626'; // CRITICO
      else if (pct >= 70) badgeColor = '#d97706';

      const icon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div style="background-color: #ffffff; border: 2.5px solid ${badgeColor}; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.18);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${badgeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(albergue.ubicacion, { icon });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 2px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 13px;">${albergue.nombre_albergue}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor};">
              ${albergue.estado.replace(/_/g, ' ')}
            </span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
            <div>Capacidad: <strong style="color: #0f172a;">${albergue.ocupacion_actual} / ${albergue.capacidad_maxima}</strong> (${Math.round(pct)}%)</div>
            <div>Cupos libres: <strong style="color: #047857;">${albergue.capacidad_maxima - albergue.ocupacion_actual}</strong></div>
          </div>
          <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${Math.min(100, pct)}%; height: 100%; background: ${badgeColor};"></div>
          </div>
          <div style="font-size: 10px; color: #64748b;">
            <div>Responsable: ${albergue.responsable}</div>
            <div>Servicios: ${albergue.servicios.join(', ')}</div>
          </div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [albergues, verAlbergues]);

  // Renderizar Incidentes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current.incidentes;
    if (!map || !group) return;

    group.clearLayers();
    if (!verIncidentes) return;

    incidentes.forEach(inc => {
      let markerColor = '#d97706';
      if (inc.gravedad === 'CRITICA') markerColor = '#dc2626';
      else if (inc.gravedad === 'ALTA') markerColor = '#ea580c';
      else if (inc.gravedad === 'BAJA') markerColor = '#16a34a';

      const icon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div style="background-color: ${markerColor}; border: 2px solid #ffffff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker(inc.ubicacion, { icon });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 2px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor};">
              ${inc.gravedad}
            </span>
            <span style="font-size: 10px; color: #64748b;">${new Date(inc.creado_en).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 4px;">${inc.tipo_evento.replace(/_/g, ' ')}</strong>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; line-height: 1.4;">${inc.descripcion}</p>
          <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <div>Afectados: <strong style="color: #0f172a;">${inc.personas_afectadas} personas</strong></div>
            <div>Fuente: <strong style="color: #0369a1;">${inc.fuente_origen}</strong></div>
            <div>Estado: <strong style="color: #1e293b;">${inc.estado}</strong></div>
            ${inc.score_ia ? `<div>Score Prioridad IA: <strong style="color: #b45309;">${inc.score_ia}/100</strong></div>` : ''}
          </div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [incidentes, verIncidentes]);

  // Marcador de selección manual (para reporte de ciudadano)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (marcadorSeleccion) {
      if (markerSeleccionRef.current) {
        markerSeleccionRef.current.setLatLng(marcadorSeleccion);
      } else {
        const icon = L.divIcon({
          className: 'custom-selection-marker',
          html: `
            <div style="background-color: #047857; border: 3px solid #ffffff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(4,120,87,0.5);">
              <div style="background-color: #064e3b; width: 10px; height: 10px; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker(marcadorSeleccion, { icon, draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          if (onSelectUbicacion) {
            onSelectUbicacion(pos.lat, pos.lng);
          }
        });
        markerSeleccionRef.current = marker;
      }
    } else if (markerSeleccionRef.current) {
      map.removeLayer(markerSeleccionRef.current);
      markerSeleccionRef.current = null;
    }
  }, [marcadorSeleccion, onSelectUbicacion]);

  // Centrar mapa si cambia centrarEn o incidenteFocoId
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (centrarEn) {
      map.setView(centrarEn, 15, { animate: true });
    } else if (incidenteFocoId) {
      const inc = incidentes.find(i => i.id === incidenteFocoId);
      if (inc) {
        map.setView(inc.ubicacion, 15, { animate: true });
      }
    }
  }, [centrarEn, incidenteFocoId, incidentes]);

  return (
    <div className={`relative w-full ${altura} rounded-2xl overflow-hidden border border-slate-300 shadow-sm`}>
      {/* Contenedor del mapa Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Selector de Capa Base (OSM vs Satélite) */}
      <div className="absolute top-3 left-3 z-[400] flex bg-white/95 backdrop-blur-md rounded-xl p-1 border border-slate-300 shadow-md text-xs">
        <button
          onClick={() => setCapaBase('osm')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            capaBase === 'osm'
              ? 'bg-[#064e3b] text-white font-semibold shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Mapa Calles
        </button>
        <button
          onClick={() => setCapaBase('satelite')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            capaBase === 'satelite'
              ? 'bg-[#064e3b] text-white font-semibold shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Satélite Esri
        </button>
      </div>

      {/* Botón flotante para Alternar Panel de Capas (RF-M1-02) */}
      {mostrarControlesCapas && (
        <div className="absolute top-3 right-12 z-[400]">
          <button
            onClick={() => setPanelCapasAbierto(!panelCapasAbierto)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 text-slate-800 text-xs font-semibold hover:border-emerald-600 transition-all shadow-md"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Capas ({[verZonasRiesgo, verRios, verVias, verIncidentes, verAlbergues].filter(Boolean).length})</span>
          </button>

          {/* Panel desplegable de capas */}
          {panelCapasAbierto && (
            <div className="mt-2 w-56 p-3 rounded-xl bg-white border border-slate-200 shadow-xl space-y-2 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-semibold text-slate-800">
                <span>Capas del Visor SIG</span>
                <span className="text-[10px] text-slate-500">SRID 4326</span>
              </div>
              
              <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span>
                  Zonas de Riesgo
                </span>
                <input
                  type="checkbox"
                  checked={verZonasRiesgo}
                  onChange={e => setVerZonasRiesgo(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-600"></span>
                  Ríos (Esmeraldas y Teaone)
                </span>
                <input
                  type="checkbox"
                  checked={verRios}
                  onChange={e => setVerRios(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                  Red Vial y Tránsito
                </span>
                <input
                  type="checkbox"
                  checked={verVias}
                  onChange={e => setVerVias(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                  Incidentes de Emergencia
                </span>
                <input
                  type="checkbox"
                  checked={verIncidentes}
                  onChange={e => setVerIncidentes(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
                  Albergues y Ocupación
                </span>
                <input
                  type="checkbox"
                  checked={verAlbergues}
                  onChange={e => setVerAlbergues(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Leyenda Colapsable del Semáforo (RF-M1-06) */}
      <div className="absolute bottom-3 left-3 z-[400]">
        {leyendaAbierta ? (
          <div className="p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 shadow-xl text-xs max-w-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
              <span className="font-semibold text-slate-900">Semáforo de Riesgo y Estado</span>
              <button
                onClick={() => setLeyendaAbierta(false)}
                className="text-slate-400 hover:text-slate-600"
                title="Minimizar leyenda"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-medium text-slate-600 block mb-1">Nivel de Riesgo</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span><span>Crítico (Rojo)</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span>Alto (Naranja)</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span><span>Medio (Amarillo)</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span><span>Bajo (Verde)</span></div>
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-600 block mb-1">Estado Vial</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-1 bg-emerald-600"></span><span>Operativa</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-1 bg-amber-500"></span><span>Precaución</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-1 border-t-2 border-dashed border-red-600"></span><span>Interrumpida (E20)</span></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLeyendaAbierta(true)}
            className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 text-slate-700 hover:text-slate-900 shadow-md text-xs flex items-center gap-1.5"
            title="Mostrar leyenda"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Leyenda</span>
          </button>
        )}
      </div>

      {/* Badge de coordenadas en centro de mapa */}
      <div className="absolute bottom-3 right-3 z-[400] px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-300 text-[10px] font-mono-num text-slate-600 shadow-xs">
        Esmeraldas · Lat 0.9592 / Lon -79.6539
      </div>
    </div>
  );
}
