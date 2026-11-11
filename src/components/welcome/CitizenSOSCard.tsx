import { FormEvent, useState } from 'react';
import { AlertOctagon, CheckCircle2, Clock3, LocateFixed, MapPin, Radio, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IncidenteEmergencia, SOSPendiente } from '../../types';

interface CitizenSOSCardProps {
  currentLocation: { lat: number; lng: number; accuracy: number | null } | null;
}

const SOS_TYPES: Array<{ value: SOSPendiente['tipo_evento']; label: string }> = [
  { value: 'ASISTENCIA', label: 'Necesito ayuda urgente' },
  { value: 'INUNDACION', label: 'Inundación' },
  { value: 'DESLIZAMIENTO', label: 'Deslizamiento' },
  { value: 'INCENDIO', label: 'Incendio' },
  { value: 'OTRA', label: 'Otra emergencia' },
];

function requestDeviceLocation(): Promise<{ lat: number; lng: number; accuracy: number | null }> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Este dispositivo no ofrece geolocalización. Selecciona tu punto en el mapa.'));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
      }),
      error => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'No se concedió el permiso GPS. Actívalo en los permisos del navegador y vuelve a intentar.'
          : error.code === error.TIMEOUT
            ? 'El GPS tardó demasiado. Intenta de nuevo al aire libre.'
            : 'No se pudo determinar la ubicación. Verifica el GPS del dispositivo.';
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

function formatCoordinates([lat, lng]: [number, number]) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function CitizenSOSCard({ currentLocation }: CitizenSOSCardProps) {
  const { enviarSOS, demoModeEnabled, incidentes, online } = useApp();
  const [eventType, setEventType] = useState<SOSPendiente['tipo_evento']>('ASISTENCIA');
  const [description, setDescription] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSOS, setLastSOS] = useState<IncidenteEmergencia | null>(null);

  const submitSOS = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const location = currentLocation ?? await requestDeviceLocation();
      const result = await enviarSOS({
        tipo_evento: eventType,
        descripcion: description.trim(),
        lat: location.lat,
        lng: location.lng,
        gps_accuracy_m: location.accuracy,
        demo_mode: demoMode,
      });
      setLastSOS(result.incidente);
      setDescription('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo enviar el SOS.');
    } finally {
      setSending(false);
    }
  };

  const recentSOS = [...incidentes]
    .filter(incident => incident.es_sos_publico && incident.estado !== 'DESCARTADO')
    .sort((left, right) => new Date(right.creado_en).getTime() - new Date(left.creado_en).getTime())
    .slice(0, 3);

  return (
    <section
      aria-labelledby="citizen-sos-heading"
      className="overflow-hidden rounded-2xl border border-red-300 bg-white shadow-sm"
    >
      <div className="bg-gradient-to-r from-red-950 via-red-800 to-rose-700 px-5 py-5 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25">
              <AlertOctagon aria-hidden="true" className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-100">Auxilio ciudadano</p>
              <h2 id="citizen-sos-heading" className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                Enviar S.O.S.
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-red-50/90">
                Comparte una ubicación GPS y un aviso de ayuda. No esperes respuesta de esta app para llamar al 911.
              </p>
            </div>
          </div>
          <a
            href="tel:911"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-extrabold text-red-900 shadow-sm transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Llamar al 911
          </a>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)]">
        <form className="space-y-4" onSubmit={submitSOS}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-800">
              ¿Qué ocurre?
              <select
                value={eventType}
                onChange={event => setEventType(event.target.value as SOSPendiente['tipo_evento'])}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
              >
                {SOS_TYPES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <LocateFixed aria-hidden="true" className="h-4 w-4 text-sky-700" />
                Ubicación del dispositivo
              </p>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">
                {currentLocation
                  ? `GPS disponible · precisión aproximada ${currentLocation.accuracy === null ? 'no informada' : `±${Math.round(currentLocation.accuracy)} m`}`
                  : 'Al enviar, el navegador solicitará permiso GPS.'}
              </p>
            </div>
          </div>

          <label className="block text-xs font-bold text-slate-800">
            Nota breve (opcional; no incluyas datos personales)
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value.slice(0, 280))}
              maxLength={280}
              rows={2}
              placeholder="Ej.: agua ingresando a la vivienda, necesito evacuación"
              className="mt-1.5 min-h-20 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
            />
          </label>

          {demoModeEnabled && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={event => setDemoMode(event.target.checked)}
                className="mt-1 h-4 w-4 accent-amber-700"
              />
              <span>
                <strong className="block">Simulación de laboratorio · no es una emergencia real</strong>
                El servidor debe tener DEMO activado. El aviso quedará marcado como simulado.
              </span>
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs leading-5 text-red-900">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-base font-black text-white shadow-[0_8px_24px_rgba(185,28,28,0.2)] transition hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:cursor-wait disabled:opacity-60"
          >
            <Radio aria-hidden="true" className={`h-5 w-5 ${sending ? 'animate-pulse' : ''}`} />
            {sending ? 'Obteniendo GPS y enviando…' : demoMode ? 'Enviar SOS · SIMULACIÓN' : 'Enviar SOS con mi GPS'}
          </button>
          <p className="text-[10px] leading-4 text-slate-500">
            {online
              ? 'Con conexión, el servidor publica el aviso. La ubicación visible al público se aproxima; las coordenadas exactas se reservan al COE/Administración.'
              : 'Sin conexión, el aviso se guarda en este dispositivo y no lo reciben otras personas hasta sincronizar.'}
          </p>
        </form>

        <aside className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-800">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-700" />
              Transparencia del reporte
            </h3>
            <ul className="mt-3 space-y-2 text-[11px] leading-4 text-slate-600">
              <li><strong className="text-slate-800">Estado:</strong> recibido o pendiente de sincronización; no equivale a despacho.</li>
              <li><strong className="text-slate-800">Verificación:</strong> cada aviso ciudadano inicia sin verificar; GPS no demuestra que el hecho ocurrió.</li>
              <li><strong className="text-slate-800">Perímetro/cuadras:</strong> no se estima con un punto GPS; requiere observación o delimitación oficial.</li>
              <li><strong className="text-slate-800">Radio GPS:</strong> la precisión es la reportada por el dispositivo y puede variar.</li>
            </ul>
          </div>

          {lastSOS && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4" role="status">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-red-800">
                {lastSOS.es_simulacion ? 'SOS simulado' : 'Último SOS enviado'}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-900">
                {lastSOS.estado_sync === 'PENDIENTE' ? 'Pendiente en este dispositivo' : 'Recibido por el servidor'}
              </p>
              <p className="mt-2 break-all font-mono text-[10px] text-slate-700">
                Coordenadas exactas: {formatCoordinates(lastSOS.ubicacion)}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                {lastSOS.gps_accuracy_m === null || lastSOS.gps_accuracy_m === undefined
                  ? 'Precisión GPS no informada'
                  : `Precisión GPS reportada ±${Math.round(lastSOS.gps_accuracy_m)} m`}
                {' · Radio afectado: no determinado'}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600">
                {lastSOS.estado_sync === 'PENDIENTE'
                  ? <WifiOff aria-hidden="true" className="h-3 w-3" />
                  : <Clock3 aria-hidden="true" className="h-3 w-3" />}
                {new Date(lastSOS.creado_en).toLocaleString('es-EC')}
              </p>
            </div>
          )}

          {recentSOS.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <MapPin aria-hidden="true" className="h-4 w-4 text-red-700" />
                Avisos recientes en el mapa
              </h3>
              <ul className="mt-2 space-y-2">
                {recentSOS.map(incident => (
                  <li key={incident.uuid_cliente ?? incident.id} className="border-t border-slate-100 pt-2 text-[10px] leading-4">
                    <span className="font-bold text-slate-800">
                      {incident.es_simulacion ? 'SIMULACIÓN · ' : ''}{incident.zona_riesgo_nombre ?? 'Sector por ubicar'}
                    </span>
                    <span className="block text-slate-600">
                      {incident.ubicacion_aproximada ? 'Ubicación pública aproximada' : formatCoordinates(incident.ubicacion)}
                      {' · '}{new Date(incident.creado_en).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                      {' · Sin verificar'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
