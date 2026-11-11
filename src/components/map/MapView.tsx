/**
 * ESMERALDAS RESILIENTE 2026 - Visor Cartográfico Inteligente (Módulo M1 y M4)
 * Motor Leaflet con capas vectoriales GeoJSON, semáforo de riesgo y estilo institucional
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { ZONAS_RIESGO_INICIALES, HIDROGRAFIA_INICIAL } from '../../data/seed';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { CriticalAlertWidget } from './CriticalAlertWidget';

const getSpanishVoice = (): SpeechSynthesisVoice | null => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const spanishVoices = voices.filter(voice => /^es(-|_)/i.test(voice.lang));
  return (
    spanishVoices.find(voice => /^es[-_]EC/i.test(voice.lang)) ||
    spanishVoices.find(voice => /^es[-_]419/i.test(voice.lang)) ||
    spanishVoices.find(voice => /^es[-_](MX|US|CO|PE|ES|AR|CL)/i.test(voice.lang)) ||
    spanishVoices[0] ||
    null
  );
};

const waitForSpeechVoices = (timeoutMs = 1200): Promise<void> =>
  new Promise(resolve => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.getVoices().length > 0) {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener('voiceschanged', finish);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, timeoutMs);
    synth.addEventListener('voiceschanged', finish);
  });

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

interface MapViewProps {
  onSelectUbicacion?: (lat: number, lng: number) => void;
  marcadorSeleccion?: [number, number] | null;
  ubicacionActual?: { coordenadas: [number, number]; precisionMetros: number | null } | null;
  centrarEn?: [number, number] | null;
  mostrarControlesCapas?: boolean;
  altura?: string;
  incidenteFocoId?: number | null;
  mostrarAlertasCriticas?: boolean;
}

export function MapView({
  onSelectUbicacion,
  marcadorSeleccion,
  ubicacionActual,
  centrarEn,
  mostrarControlesCapas = true,
  altura = 'h-[600px]',
  incidenteFocoId,
  mostrarAlertasCriticas = false,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{ [key: string]: any }>({});
  const markerSeleccionRef = useRef<L.Marker | null>(null);
  const markerUbicacionActualRef = useRef<L.Marker | null>(null);
  const circuloPrecisionGpsRef = useRef<L.Circle | null>(null);
  const incidentMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const alertPlaybackRef = useRef<{
    incidentId: number | null;
    generation: number;
    timerId: number | null;
    audioContext: AudioContext | null;
    utterance: SpeechSynthesisUtterance | null;
  }>({
    incidentId: null,
    generation: 0,
    timerId: null,
    audioContext: null,
    utterance: null,
  });

  const { incidentes, albergues, vias, mostrarToast } = useApp();

  // Estados de visualización de capas
  const [capaBase, setCapaBase] = useState<'osm' | 'satelite'>('osm');
  const [verZonasRiesgo, setVerZonasRiesgo] = useState(true);
  const [verRios, setVerRios] = useState(true);
  const [verVias, setVerVias] = useState(true);
  const [verIncidentes, setVerIncidentes] = useState(true);
  const [verAlbergues, setVerAlbergues] = useState(true);
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false);
  const [leyendaAbierta, setLeyendaAbierta] = useState(true);

  const stopCriticalAlert = (incidentId?: number) => {
    const playback = alertPlaybackRef.current;
    if (incidentId !== undefined && playback.incidentId !== incidentId) return;

    if (playback.timerId !== null) {
      window.clearTimeout(playback.timerId);
    }
    if (playback.incidentId !== null && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (playback.audioContext && playback.audioContext.state !== 'closed') {
      void playback.audioContext.close();
    }
    alertPlaybackRef.current = {
      incidentId: null,
      generation: playback.generation + 1,
      timerId: null,
      audioContext: null,
      utterance: null,
    };
  };

  const startCriticalAlert = (incident: (typeof incidentes)[number]) => {
    stopCriticalAlert();
    const speechAvailable =
      typeof window.speechSynthesis !== 'undefined' &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    let audioContext: AudioContext | null = null;
    if ('AudioContext' in window) {
      try {
        audioContext = new window.AudioContext();
      } catch (error) {
        console.error('No se pudo crear el audio de la alerta crítica.', error);
        mostrarToast(
          'alerta',
          'Audio de alerta no disponible',
          'El navegador no permitió reproducir el pitido. La ficha de la alerta permanece abierta.',
        );
      }
    } else {
      mostrarToast(
        'alerta',
        'Audio de alerta no disponible',
        'Este navegador no admite el pitido de alerta.',
      );
    }

    if (!speechAvailable) {
      mostrarToast(
        'alerta',
        'Aviso de voz no disponible',
        'Este navegador no admite la lectura por voz de la alerta.',
      );
    }

    const generation = alertPlaybackRef.current.generation + 1;
    alertPlaybackRef.current = {
      incidentId: incident.id,
      generation,
      timerId: null,
      audioContext,
      utterance: null,
    };

    const cleanText = (value: string) => value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const details = [
      `Tipo de emergencia: ${cleanText(incident.tipo_evento)}.`,
      `Ubicación: ${cleanText(incident.zona_riesgo_nombre || 'ubicación reportada')}.`,
      incident.descripcion ? cleanText(incident.descripcion).slice(0, 180) : '',
      `Personas afectadas: ${incident.personas_afectadas}.`,
      `S O S. Se solicita ayuda inmediata en ${cleanText(incident.zona_riesgo_nombre || 'la ubicación reportada')}.`,
    ].filter(Boolean).join(' ');
    const announcement =
      `Atención. Alerta de estado crítico. Alerta de estado crítico. ${details}`;

    const isPlaybackActive = () => {
      const current = alertPlaybackRef.current;
      return current.incidentId === incident.id && current.generation === generation;
    };

    const schedulePlayback = (callback: () => void, delayMs: number) => {
      if (!isPlaybackActive()) return;
      const current = alertPlaybackRef.current;
      if (current.timerId !== null) window.clearTimeout(current.timerId);
      current.timerId = window.setTimeout(() => {
        const activePlayback = alertPlaybackRef.current;
        if (!isPlaybackActive()) return;
        activePlayback.timerId = null;
        callback();
      }, delayMs);
    };

    const announceAlert = async () => {
      if (!isPlaybackActive()) return;
      if (!speechAvailable) {
        schedulePlayback(playThreeBeeps, 5000);
        return;
      }

      await waitForSpeechVoices();
      if (!isPlaybackActive()) return;

      const synth = window.speechSynthesis;
      if (synth.paused) synth.resume();
      const spanishVoice = getSpanishVoice();
      if (!spanishVoice) {
        console.warn(
          'No se encontró una voz en español instalada en el sistema; se usará la voz predeterminada.',
        );
      }

      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.lang = spanishVoice?.lang || 'es-EC';
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      if (spanishVoice) utterance.voice = spanishVoice;
      alertPlaybackRef.current.utterance = utterance;

      let keepAliveId = 0;
      const stopKeepAlive = () => {
        if (keepAliveId !== 0) {
          window.clearInterval(keepAliveId);
          keepAliveId = 0;
        }
      };
      keepAliveId = window.setInterval(() => {
        if (alertPlaybackRef.current.utterance !== utterance) {
          stopKeepAlive();
          return;
        }
        if (synth.paused) synth.resume();
      }, 5000);

      utterance.onend = () => {
        stopKeepAlive();
        if (alertPlaybackRef.current.utterance === utterance) {
          alertPlaybackRef.current.utterance = null;
        }
        schedulePlayback(playThreeBeeps, 450);
      };
      utterance.onerror = event => {
        stopKeepAlive();
        if (alertPlaybackRef.current.utterance === utterance) {
          alertPlaybackRef.current.utterance = null;
        }
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error('No se pudo reproducir la voz de la alerta crítica.', event.error);
        }
        if (isPlaybackActive()) schedulePlayback(playThreeBeeps, 450);
      };
      synth.speak(utterance);
    };

    const playThreeBeeps = async () => {
      if (!isPlaybackActive()) return;
      const context = alertPlaybackRef.current.audioContext;
      if (!context) {
        schedulePlayback(announceAlert, 1050);
        return;
      }

      try {
        if (context.state === 'suspended') await context.resume();
      } catch (error) {
        if (isPlaybackActive()) {
          console.error('No se pudo activar el audio de la alerta crítica.', error);
          mostrarToast(
            'alerta',
            'Audio de alerta no disponible',
            'El navegador no permitió reproducir los pitidos. La lectura de voz seguirá activa.',
          );
        }
        schedulePlayback(announceAlert, 1050);
        return;
      }
      if (!isPlaybackActive()) return;

      if (context.state !== 'running') {
        schedulePlayback(announceAlert, 1050);
        return;
      }

      try {
        [880, 660, 880].forEach((frequency, index) => {
          const startAt = context.currentTime + index * 0.34;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, startAt);
          gain.gain.setValueAtTime(0.0001, startAt);
          gain.gain.exponentialRampToValueAtTime(0.7, startAt + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.24);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(startAt);
          oscillator.stop(startAt + 0.25);
        });
        schedulePlayback(announceAlert, 1180);
      } catch (error) {
        console.error('No se pudieron reproducir los pitidos de la alerta crítica.', error);
        mostrarToast(
          'alerta',
          'Audio de alerta no disponible',
          'El navegador no pudo reproducir los pitidos. La lectura de voz seguirá activa.',
        );
        schedulePlayback(announceAlert, 1050);
      }
    };

    playThreeBeeps();
  };

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
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      stopCriticalAlert();
      const target = e.originalEvent.target;
      if (target instanceof Element && target.closest('.leaflet-popup')) return;
      if (onSelectUbicacion) {
        onSelectUbicacion(e.latlng.lat, e.latlng.lng);
      }
    };
    map.on('click', handleMapClick);
    const stopWhenClickingElsewhere = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        target.closest('.critical-incident-marker') ||
        target.closest('.leaflet-popup')
      ) {
        return;
      }
      if (alertPlaybackRef.current.incidentId !== null) {
        stopCriticalAlert();
        map.closePopup();
      }
    };
    document.addEventListener('pointerdown', stopWhenClickingElsewhere, true);

    mapInstanceRef.current = map;

    return () => {
      document.removeEventListener('pointerdown', stopWhenClickingElsewhere, true);
      stopCriticalAlert();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!ubicacionActual) {
      if (markerUbicacionActualRef.current) map.removeLayer(markerUbicacionActualRef.current);
      if (circuloPrecisionGpsRef.current) map.removeLayer(circuloPrecisionGpsRef.current);
      markerUbicacionActualRef.current = null;
      circuloPrecisionGpsRef.current = null;
      return;
    }

    const { coordenadas, precisionMetros } = ubicacionActual;
    const gpsIcon = L.divIcon({
      className: 'current-location-marker',
      html: '<span class="current-location-pulse"></span><span class="current-location-core"><span></span></span>',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    if (markerUbicacionActualRef.current) {
      markerUbicacionActualRef.current.setLatLng(coordenadas);
      markerUbicacionActualRef.current.setIcon(gpsIcon);
    } else {
      markerUbicacionActualRef.current = L.marker(coordenadas, {
        icon: gpsIcon,
        keyboard: true,
        title: 'Tu ubicación GPS actual',
        zIndexOffset: 1000,
      }).addTo(map);
      markerUbicacionActualRef.current.bindPopup('Ubicación GPS actual del dispositivo. La precisión depende del sensor y la señal.');
    }

    if (typeof precisionMetros === 'number' && precisionMetros > 0) {
      if (circuloPrecisionGpsRef.current) {
        circuloPrecisionGpsRef.current.setLatLng(coordenadas).setRadius(precisionMetros);
      } else {
        circuloPrecisionGpsRef.current = L.circle(coordenadas, {
          radius: precisionMetros,
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.1,
          weight: 1.5,
          interactive: false,
        }).addTo(map);
      }
    } else if (circuloPrecisionGpsRef.current) {
      map.removeLayer(circuloPrecisionGpsRef.current);
      circuloPrecisionGpsRef.current = null;
    }
  }, [ubicacionActual]);

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
        <div style="font-family: var(--font-body); color: #0f172a; padding: 2px;">
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
        <div style="font-family: var(--font-body); color: #0f172a;">
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
        <div style="font-family: var(--font-body); color: #0f172a; padding: 2px;">
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
        <div style="font-family: var(--font-body); color: #0f172a; padding: 2px; min-width: 200px;">
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
    incidentMarkersRef.current.clear();
    if (!verIncidentes) return;

    incidentes.forEach(inc => {
      let markerColor = '#d97706';
      if (inc.gravedad === 'CRITICA') markerColor = '#dc2626';
      else if (inc.gravedad === 'ALTA') markerColor = '#ea580c';
      else if (inc.gravedad === 'BAJA') markerColor = '#16a34a';

      const incidenteCriticoActivo =
        inc.gravedad === 'CRITICA' &&
        inc.estado !== 'ATENDIDO' &&
        inc.estado !== 'DESCARTADO';
      const icon = L.divIcon({
        className: `custom-incident-marker${incidenteCriticoActivo ? ' critical-incident-marker' : ''}`,
        html: incidenteCriticoActivo ? `
          <span class="incident-marker-pulse"></span>
          <div class="incident-marker-core" style="background-color: ${markerColor};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        ` : `
          <div style="background-color: ${markerColor}; border: 2px solid #ffffff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        `,
        iconSize: incidenteCriticoActivo ? [40, 40] : [26, 26],
        iconAnchor: incidenteCriticoActivo ? [20, 20] : [13, 13],
      });

      const marker = L.marker(inc.ubicacion, { icon });
      incidentMarkersRef.current.set(inc.id, marker);

      marker.on('click', () => {
        if (!incidenteCriticoActivo) {
          stopCriticalAlert();
        }
      });
      if (incidenteCriticoActivo) {
        marker.on('popupopen', () => startCriticalAlert(inc));
        marker.on('popupclose', () => stopCriticalAlert(inc.id));
      }

      const eventLabel = escapeHtml(
        inc.es_sos_publico && inc.categoria_sos
          ? `S.O.S. · ${inc.categoria_sos.replace(/_/g, ' ')}`
          : inc.tipo_evento.replace(/_/g, ' '),
      );
      const description = escapeHtml(inc.descripcion);
      const zoneName = escapeHtml(inc.zona_riesgo_nombre || 'No determinado');
      const sourceLabel = escapeHtml(inc.fuente_origen);
      const stateLabel = escapeHtml(inc.estado.replace(/_/g, ' '));
      const locationLabel = inc.ubicacion_aproximada
        ? 'Coordenada pública aproximada'
        : `${inc.ubicacion[0].toFixed(6)}, ${inc.ubicacion[1].toFixed(6)}`;
      marker.bindPopup(`
        <div style="font-family: var(--font-body); color: #0f172a; padding: 2px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor};">
              ${escapeHtml(inc.gravedad)}
            </span>
            <span style="font-size: 10px; color: #64748b;">${new Date(inc.creado_en).toLocaleString('es-EC')}</span>
          </div>
          <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 4px;">${eventLabel}</strong>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; line-height: 1.4;">${description}</p>
          <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <div>Afectados: <strong style="color: #0f172a;">${inc.personas_afectadas} personas</strong></div>
            <div>Fuente: <strong style="color: #0369a1;">${sourceLabel}</strong></div>
            <div>Estado: <strong style="color: #1e293b;">${stateLabel}</strong></div>
            ${inc.es_sos_publico ? `
              <div>Sector: <strong style="color: #1e293b;">${zoneName}</strong></div>
              <div>Ubicación: <strong style="color: #1e293b;">${locationLabel}</strong></div>
              <div>Verificación: <strong style="color: #b91c1c;">${inc.verificado ? 'Verificada por operador' : 'Pendiente; aviso ciudadano'}</strong></div>
              <div>Precisión GPS: <strong style="color: #1e293b;">${typeof inc.gps_accuracy_m === 'number' ? `±${Math.round(inc.gps_accuracy_m)} m (indicada por dispositivo)` : 'no informada'}</strong></div>
              <div>Perímetro afectado: <strong style="color: #1e293b;">No determinado</strong></div>
              ${inc.es_simulacion ? '<div style="font-weight: bold; color: #a16207;">SIMULACIÓN DE LABORATORIO</div>' : ''}
              ${inc.estado_sync === 'PENDIENTE' ? '<div style="font-weight: bold; color: #a16207;">PENDIENTE EN ESTE DISPOSITIVO · NO ENVIADO</div>' : ''}
            ` : ''}
            ${inc.score_ia ? `<div>Score Prioridad IA: <strong style="color: #b45309;">${inc.score_ia}/100</strong></div>` : ''}
          </div>
        </div>
      `);

      group.addLayer(marker);
    });

    return () => stopCriticalAlert();
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

  const enfocarIncidenteCritico = (incidente: (typeof incidentes)[number]) => {
    setVerIncidentes(true);
    mapInstanceRef.current?.setView(incidente.ubicacion, 15, {
      animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    incidentMarkersRef.current.get(incidente.id)?.openPopup();
  };

  return (
    <div className={`relative w-full ${altura} rounded-2xl overflow-hidden border border-slate-300 shadow-sm`}>
      {/* Contenedor del mapa Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {mostrarAlertasCriticas && (
        <CriticalAlertWidget
          incidentes={incidentes}
          onFocusIncident={enfocarIncidenteCritico}
        />
      )}

      {/* Selector de Capa Base (OSM vs Satélite) */}
      <div className="absolute left-2 top-2 z-[400] flex rounded-xl border border-slate-300 bg-white/95 p-1 text-[10px] shadow-md backdrop-blur-md sm:left-3 sm:top-3 sm:text-xs">
        <button
          onClick={() => setCapaBase('osm')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            capaBase === 'osm'
              ? 'bg-[#064e3b] font-semibold text-white shadow-xs'
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
        <div className="absolute right-2 top-12 z-[400] sm:right-12 sm:top-3">
          <button
            onClick={() => setPanelCapasAbierto(!panelCapasAbierto)}
            className="flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-800 shadow-md backdrop-blur-md transition-all hover:border-emerald-600 sm:px-3 sm:text-xs"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Capas ({[verZonasRiesgo, verRios, verVias, verIncidentes, verAlbergues].filter(Boolean).length})</span>
          </button>

          {/* Panel desplegable de capas */}
          {panelCapasAbierto && (
            <div className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-2rem))] space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
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
      <div className="absolute bottom-2 left-2 z-[400] max-w-[calc(100%-1rem)] sm:bottom-3 sm:left-3">
        {leyendaAbierta ? (
          <div className="max-h-44 max-w-[min(20rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-slate-300 bg-white/95 p-2.5 text-[10px] shadow-xl backdrop-blur-md animate-in fade-in duration-150 sm:max-h-64 sm:p-3 sm:text-xs">
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
