import { useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  HeartHandshake,
  Info,
  MapPin,
  Megaphone,
  Navigation,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { ALBERGUES_INICIALES, ZONAS_RIESGO_INICIALES } from '../../data/seed';
import { detectarZonaRiesgo } from '../../lib/geo';
import { Albergue, ZonaRiesgo } from '../../types';
import { useApp } from '../../context/AppContext';
import { ModuloId } from '../layout/Sidebar';
import { MapView } from '../map/MapView';
import { CitizenSOSCard } from './CitizenSOSCard';
import { WeatherForecastCard } from './WeatherForecastCard';

interface CitizenPortalViewProps {
  onNavigate: (module: ModuloId) => void;
}

interface CitizenSector {
  id: string;
  label: string;
  zoneId: number | null;
  location: [number, number];
}

const CITIZEN_SECTORS: CitizenSector[] = [
  { id: '50-casas', label: 'Barrio 50 Casas', zoneId: 1, location: [0.943, -79.668] },
  { id: 'la-propicia', label: 'La Propicia (Riberas)', zoneId: 4, location: [0.953, -79.672] },
  { id: 'isla-piedad', label: 'Isla Piedad / Puerto', zoneId: 6, location: [0.982, -79.625] },
  { id: 'san-rafael', label: 'San Rafael', zoneId: null, location: [0.9592, -79.6539] },
  { id: 'las-palmas', label: 'Las Palmas / Centro', zoneId: 7, location: [0.984, -79.646] },
];

const RECOMMENDED_ACTIONS = [
  'Prepare una mochila de emergencia con agua, medicinas y documentos protegidos.',
  'Identifique con su familia una ruta hacia terreno alto y un punto seguro.',
  'Si el agua sube, aléjese de cauces y siga las indicaciones de las autoridades.',
];

function shelterStatusClasses(shelter: Albergue) {
  const occupancy = shelter.capacidad_maxima > 0
    ? shelter.ocupacion_actual / shelter.capacidad_maxima
    : 1;

  if (shelter.estado === 'CERRADO' || shelter.estado === 'LLENO' || occupancy >= 0.9) {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  if (shelter.estado === 'CASI_LLENO' || occupancy >= 0.7) {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-800';
}

function riskPanelClasses(level?: ZonaRiesgo['nivel_riesgo']) {
  if (level === 'CRITICO') return 'border-red-300 bg-red-50/80';
  if (level === 'ALTO') return 'border-orange-300 bg-orange-50/70';
  if (level === 'MEDIO') return 'border-amber-300 bg-amber-50/70';
  if (level === 'BAJO') return 'border-emerald-300 bg-emerald-50/70';
  return 'border-slate-200 bg-slate-50';
}

function riskIconClasses(level?: ZonaRiesgo['nivel_riesgo']) {
  if (level === 'CRITICO') return 'bg-red-700 text-white';
  if (level === 'ALTO') return 'bg-orange-600 text-white';
  if (level === 'MEDIO') return 'bg-amber-500 text-white';
  if (level === 'BAJO') return 'bg-emerald-700 text-white';
  return 'bg-slate-500 text-white';
}

function formatAvailability(shelter: Albergue) {
  return Math.max(0, shelter.capacidad_maxima - shelter.ocupacion_actual).toLocaleString('es-EC');
}

export function CitizenPortalView({ onNavigate }: CitizenPortalViewProps) {
  const { albergues, mostrarToast, online } = useApp();
  const [selectedSector, setSelectedSector] = useState<CitizenSector>(CITIZEN_SECTORS[0]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [gpsPosition, setGpsPosition] = useState<{ lat: number; lng: number; accuracy: number | null } | null>(null);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [gpsCenter, setGpsCenter] = useState<[number, number] | null>(null);
  const gpsWatchId = useRef<number | null>(null);
  const selectedZone = selectedSector.zoneId === null
    ? null
    : ZONAS_RIESGO_INICIALES.find(zone => zone.id === selectedSector.zoneId) ?? null;
  const shelters = albergues.length > 0 ? albergues : ALBERGUES_INICIALES;
  const activeShelters = shelters.filter(shelter => shelter.estado !== 'CERRADO');

  const stopGpsTracking = () => {
    if (gpsWatchId.current !== null) {
      if (navigator.geolocation) navigator.geolocation.clearWatch(gpsWatchId.current);
      gpsWatchId.current = null;
    }
    setGpsTracking(false);
  };

  useEffect(() => () => {
    if (gpsWatchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchId.current);
    }
  }, []);

  const selectSector = (sector: CitizenSector) => {
    stopGpsTracking();
    setGpsPosition(null);
    setGpsCenter(null);
    setSelectedSector(sector);
    setSelectedLocation(null);
  };

  const selectMapLocation = (lat: number, lng: number) => {
    stopGpsTracking();
    setGpsPosition(null);
    setGpsCenter(null);
    const zone = detectarZonaRiesgo(lat, lng, ZONAS_RIESGO_INICIALES);
    setSelectedSector({
      id: `map-${lat.toFixed(4)}-${lng.toFixed(4)}`,
      label: 'Punto consultado en el mapa',
      zoneId: zone?.id ?? null,
      location: [lat, lng],
    });
    setSelectedLocation([lat, lng]);
  };

  const useCurrentLocation = () => {
    if (gpsTracking) {
      stopGpsTracking();
      return;
    }
    if (!navigator.geolocation) {
      mostrarToast('error', 'Ubicación no disponible', 'Este navegador no permite consultar la ubicación del dispositivo.');
      return;
    }

    setGpsCenter(null);
    setGpsTracking(true);
    gpsWatchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const zone = detectarZonaRiesgo(coords.latitude, coords.longitude, ZONAS_RIESGO_INICIALES);
        const location: [number, number] = [coords.latitude, coords.longitude];
        setGpsPosition({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
        });
        setGpsCenter(previous => previous ?? location);
        setSelectedSector({
          id: 'mi-ubicacion',
          label: 'Mi ubicación actual',
          zoneId: zone?.id ?? null,
          location,
        });
        setSelectedLocation(null);
      },
      error => {
        stopGpsTracking();
        const message = error.code === error.PERMISSION_DENIED
          ? 'No se concedió permiso de ubicación. Actívalo en los permisos del navegador y vuelve a intentar.'
          : error.code === error.TIMEOUT
            ? 'El GPS tardó demasiado. Inténtalo nuevamente en un lugar abierto.'
            : 'No fue posible actualizar la ubicación GPS.';
        mostrarToast('error', 'No se pudo consultar la ubicación', message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );
  };

  const riskLevel = selectedZone?.nivel_riesgo;
  const riskLabel = riskLevel ?? 'SIN DATO LOCAL';
  const weatherLocation: [number, number] = gpsPosition
    ? [gpsPosition.lat, gpsPosition.lng]
    : [0.9592, -79.6539];

  return (
    <div className="space-y-6 font-[var(--font-body)]">
      <section className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-950 px-6 py-7 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 font-bold uppercase text-slate-950">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-950" />
              Escenario de referencia · El Niño 2026
            </span>
            <span className="font-semibold text-emerald-50">Cantón Esmeraldas</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-[26px]">
            Portal Ciudadano de Información y Prevención
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">
            Consulte información de referencia sobre vulnerabilidad, zonas de riesgo y puntos seguros de evacuación.
          </p>
        </div>
        <a
          href="tel:911"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:self-center"
        >
          <PhoneCall aria-hidden="true" className="h-4 w-4" />
          Emergencias ECU 911
        </a>
      </section>

      <CitizenSOSCard currentLocation={gpsPosition} />
      <WeatherForecastCard location={weatherLocation} online={online} />

      <section aria-labelledby="preventive-query-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <MapPin aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="preventive-query-heading" className="text-base font-bold text-slate-900">
                Consulta Preventiva: ¿Tu barrio o vivienda está en riesgo de inundación?
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Seleccione un sector o use su GPS para consultar las zonas de referencia disponibles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
              gpsTracking
                ? 'border-sky-500 bg-sky-50 text-sky-900'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            <Navigation aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            {gpsTracking ? 'Detener seguimiento GPS' : 'Usar GPS en tiempo real'}
          </button>
        </div>
        {gpsPosition && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-950">
            <span className="inline-flex items-center gap-1.5 font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sky-600" />
              GPS actualizado {gpsTracking ? '· seguimiento activo' : ''}
            </span>
            <span>Lat {gpsPosition.lat.toFixed(6)} · Lon {gpsPosition.lng.toFixed(6)}</span>
            <span>Precisión {gpsPosition.accuracy === null ? 'no informada' : `±${Math.round(gpsPosition.accuracy)} m`}</span>
          </div>
        )}

        <div className="pt-4">
          <p className="text-xs font-medium text-slate-700">Sectores ribereños y urbanos frecuentes de Esmeraldas:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CITIZEN_SECTORS.map(sector => (
              <button
                key={sector.id}
                type="button"
                aria-pressed={selectedSector.id === sector.id}
                onClick={() => selectSector(sector)}
                className={`min-h-8 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  selectedSector.id === sector.id
                    ? 'bg-emerald-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                {sector.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`mt-5 rounded-2xl border p-4 sm:p-5 ${riskPanelClasses(riskLevel)}`}>
          <div className="flex flex-col gap-3 border-b border-slate-300/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${riskIconClasses(riskLevel)}`}>
                <AlertOctagon aria-hidden="true" className="h-6 w-6" />
              </span>
              <div>
                <span className="inline-flex rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800">
                  Nivel de riesgo: {riskLabel}
                </span>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {selectedZone
                    ? `${selectedZone.nombre_sector} (${selectedZone.parroquia})`
                    : selectedSector.label}
                </h3>
              </div>
            </div>
            <p className="font-mono-num text-xs font-semibold text-slate-600">
              Amenaza: {selectedZone ? selectedZone.tipo_amenaza.replace(/_/g, ' ') : 'SIN DATO LOCAL'}
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Situación del sector:</h4>
              <p className="mt-2 min-h-16 rounded-xl border border-slate-200 bg-white/80 p-3 text-xs leading-5 text-slate-700">
                {selectedZone
                  ? selectedZone.descripcion
                  : 'No hay una delimitación de riesgo disponible para este punto en los datos locales de demostración. La falta de un registro no significa que el sector esté libre de riesgo.'}
              </p>
              <p className="mt-2 text-[10px] text-slate-500">
                Fuente de referencia: <strong>{selectedZone?.fuente_dato ?? 'sin dato local'}</strong>
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">¿Qué medidas puede tomar su familia?</h4>
              <ul className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-white/80 p-3 text-xs leading-5 text-slate-700">
                {RECOMMENDED_ACTIONS.map(action => (
                  <li key={action} className="flex items-start gap-2">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="citizen-map-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="citizen-map-heading" className="text-base font-bold text-slate-900">
            Mapa Ciudadano de Zonas Inundables y Puntos Seguros
          </h2>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            Cartografía de referencia · WGS84
          </span>
        </div>
        <MapView
          altura="h-[360px] sm:h-[440px]"
          centrarEn={gpsTracking ? gpsCenter : selectedSector.location}
          marcadorSeleccion={selectedLocation}
          ubicacionActual={gpsPosition
            ? { coordenadas: [gpsPosition.lat, gpsPosition.lng], precisionMetros: gpsPosition.accuracy }
            : null}
          onSelectUbicacion={selectMapLocation}
        />
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <p>Los polígonos, capas y ubicaciones se muestran como referencia del escenario local; consulte a las autoridades para instrucciones y alertas vigentes.</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <section aria-labelledby="shelters-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 id="shelters-heading" className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <HeartHandshake aria-hidden="true" className="h-5 w-5 text-emerald-700" />
              Albergues y Puntos de Evacuación Habilitados
            </h2>
            <span className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
              {activeShelters.length} registrados
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeShelters.map(shelter => (
              <article key={shelter.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xs font-bold leading-5 text-slate-900">{shelter.nombre_albergue}</h3>
                  <span className={`shrink-0 rounded border px-2 py-1 text-[9px] font-bold uppercase ${shelterStatusClasses(shelter)}`}>
                    {shelter.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  {shelter.direccion}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-2.5 text-[11px]">
                  <span className="text-slate-500">Cupos disponibles:</span>
                  <strong className="font-mono-num text-slate-900">
                    {formatAvailability(shelter)} de {shelter.capacidad_maxima.toLocaleString('es-EC')} personas
                  </strong>
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('albergues')}
            className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <MapPin aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            Ver rutas y albergues en el módulo
          </button>
        </section>

        <section aria-labelledby="emergency-lines-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">
          <h2 id="emergency-lines-heading" className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <PhoneCall aria-hidden="true" className="h-5 w-5 text-red-600" />
            Líneas de Auxilio Inmediato
          </h2>
          <div className="space-y-2.5">
            <a href="tel:911" className="flex min-h-[66px] items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
              <span>
                <span className="block text-xs font-bold text-red-900">ECU 911 Esmeraldas</span>
                <span className="mt-1 block text-[11px] text-red-800">Emergencias y rescate</span>
              </span>
              <strong className="font-mono-num text-base text-red-800">911</strong>
            </a>
            <a href="tel:102" className="flex min-h-[66px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <span>
                <span className="block text-xs font-bold text-slate-900">Cuerpo de Bomberos</span>
                <span className="mt-1 block text-[11px] text-slate-500">Estación Central Esmeraldas</span>
              </span>
              <strong className="font-mono-num text-sm text-slate-700">102</strong>
            </a>
            <a href="tel:911" className="flex min-h-[66px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <span>
                <span className="block text-xs font-bold text-slate-900">Hospital Delfina Torres</span>
                <span className="mt-1 block text-[11px] text-slate-500">Atención médica de urgencia</span>
              </span>
              <strong className="text-xs text-slate-700">911</strong>
            </a>
          </div>
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-950">
            <p><strong>Aviso de seguridad:</strong> evite cruzar calles inundadas y no se acerque a ríos o quebradas crecidas.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('reportar')}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Megaphone aria-hidden="true" className="h-4 w-4" />
            Reportar una situación
          </button>
        </section>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <p>Esta versión usa datos locales de demostración; la ocupación de albergues y el estado de las alertas pueden no estar actualizados. En una emergencia, llame al ECU 911.</p>
      </div>
    </div>
  );
}
