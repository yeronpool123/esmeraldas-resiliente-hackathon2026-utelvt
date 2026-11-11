import { useEffect, useMemo, useState } from 'react';
import { CloudRain, CloudSun, RefreshCw, WifiOff } from 'lucide-react';

interface ForecastHour {
  time: string;
  precipitation_probability: number | null;
  temperature_c: number | null;
  precipitation_mm: number | null;
  weather_code: number | null;
}

interface WeatherForecast {
  fetched_at: string;
  provider: string;
  model: string;
  probability_basis: string;
  timezone: string;
  hours: ForecastHour[];
}

interface WeatherForecastCardProps {
  location: [number, number];
  online: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const CACHE_KEY = 'er2026_pronostico_ciudadano';

function isForecast(value: unknown): value is WeatherForecast {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const validHours = Array.isArray(record.hours) && record.hours.every(hour => {
    if (hour === null || typeof hour !== 'object') return false;
    const item = hour as Record<string, unknown>;
    return (
      typeof item.time === 'string' &&
      (typeof item.precipitation_probability === 'number' || item.precipitation_probability === null) &&
      (typeof item.temperature_c === 'number' || item.temperature_c === null) &&
      (typeof item.precipitation_mm === 'number' || item.precipitation_mm === null) &&
      (typeof item.weather_code === 'number' || item.weather_code === null)
    );
  });
  return (
    typeof record.fetched_at === 'string' &&
    typeof record.provider === 'string' &&
    typeof record.model === 'string' &&
    typeof record.probability_basis === 'string' &&
    typeof record.timezone === 'string' &&
    validHours
  );
}

function conditionFromCode(code: number | null | undefined) {
  if (code === null || code === undefined) return 'Condición no disponible';
  if (code === 0) return 'Despejado';
  if ([1, 2].includes(code)) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if ([45, 48].includes(code)) return 'Neblina';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Llovizna prevista';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Lluvia prevista';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Nieve prevista';
  if ([95, 96, 99].includes(code)) return 'Tormenta indicada por el modelo';
  return 'Condición variable';
}

function isStormCode(code: number | null | undefined) {
  return code === 95 || code === 96 || code === 99;
}

function formatForecastTime(value: string) {
  const time = value.match(/T(\d{2}):(\d{2})/);
  return time ? `${time[1]}:${time[2]}` : value;
}

export function WeatherForecastCard({ location, online }: WeatherForecastCardProps) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryCoordinates = useMemo(
    () => [Number(location[0].toFixed(2)), Number(location[1].toFixed(2))] as const,
    [location],
  );

  useEffect(() => {
    try {
      const cached: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
      if (isForecast(cached)) setForecast(cached);
    } catch (reason) {
      console.warn('No se pudo leer el pronóstico guardado localmente.', reason);
    }
  }, []);

  useEffect(() => {
    if (!online) return;
    let active = true;
    const loadForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const [latitude, longitude] = queryCoordinates;
        const url = new URL(`${API_BASE_URL}/api/public/weather`);
        url.searchParams.set('latitude', String(latitude));
        url.searchParams.set('longitude', String(longitude));
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Pronóstico no disponible (HTTP ${response.status}).`);
        const payload: unknown = await response.json();
        if (!isForecast(payload)) throw new Error('El proveedor devolvió un pronóstico incompleto.');
        if (!active) return;
        setForecast(payload);
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (reason) {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'No se pudo consultar el pronóstico.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadForecast();
    const intervalId = window.setInterval(() => void loadForecast(), 30 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [online, queryCoordinates]);

  const nextHours = forecast?.hours.slice(0, 6) ?? [];
  const peakPrecipitation = nextHours.reduce<number | null>((highest, hour) => {
    const probability = hour.precipitation_probability;
    if (typeof probability !== 'number') return highest;
    return highest === null ? probability : Math.max(highest, probability);
  }, null);
  const firstHour = nextHours[0];
  const stormHours = nextHours.filter(hour => isStormCode(hour.weather_code));
  const fetchedAt = forecast ? new Date(forecast.fetched_at) : null;
  const ageMinutes = fetchedAt && !Number.isNaN(fetchedAt.getTime())
    ? Math.max(0, Math.floor((Date.now() - fetchedAt.getTime()) / 60000))
    : null;
  const stale = ageMinutes !== null && ageMinutes > 90;

  return (
    <section
      aria-labelledby="citizen-weather-heading"
      className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-950 via-sky-900 to-indigo-950 p-5 text-white shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/15">
            {peakPrecipitation !== null && peakPrecipitation >= 40
              ? <CloudRain aria-hidden="true" className="h-6 w-6" />
              : <CloudSun aria-hidden="true" className="h-6 w-6" />}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">Pronóstico meteorológico</p>
            <h2 id="citizen-weather-heading" className="mt-1 text-lg font-extrabold">
              Tiempo previsto para tu ubicación
            </h2>
            <p className="mt-1 text-xs leading-5 text-sky-100/85">
              Esmeraldas · coordenadas consultadas {queryCoordinates[0]}, {queryCoordinates[1]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold">
          {loading
            ? <RefreshCw aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
            : !online
              ? <WifiOff aria-hidden="true" className="h-3.5 w-3.5" />
              : <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-300" />}
          {loading ? 'Actualizando' : online ? 'Datos externos' : 'Sin conexión'}
        </div>
      </div>

      {forecast && firstHour ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-100">Lluvia · próximas 6 h</p>
              <p className="mt-1 font-mono text-3xl font-extrabold">
                {peakPrecipitation === null ? '—' : `${peakPrecipitation}%`}
              </p>
              <p className="mt-1 text-[10px] text-sky-100/80">Probabilidad máxima de precipitación</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-100">Temperatura prevista</p>
              <p className="mt-1 font-mono text-3xl font-extrabold">
                {typeof firstHour.temperature_c === 'number' ? `${Math.round(firstHour.temperature_c)}°` : '—'}
              </p>
              <p className="mt-1 text-[10px] text-sky-100/80">{conditionFromCode(firstHour.weather_code)}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-100">Lluvia estimada</p>
              <p className="mt-1 font-mono text-3xl font-extrabold">
                {typeof firstHour.precipitation_mm === 'number' ? `${firstHour.precipitation_mm.toFixed(1)} mm` : '—'}
              </p>
              <p className="mt-1 text-[10px] text-sky-100/80">En la hora indicada abajo</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-sky-100/85">
            <span>Hora de referencia: {formatForecastTime(firstHour.time)} ({forecast.timezone})</span>
            <span>
              {forecast.provider} · {forecast.model}
              {ageMinutes !== null ? ` · actualizado hace ${ageMinutes} min` : ''}
              {stale ? ' · dato antiguo' : ''}
            </span>
          </div>
          {stormHours.length > 0 && (
            <p className="mt-3 rounded-lg border border-amber-300/50 bg-amber-300/15 px-3 py-2 text-xs font-bold text-amber-50">
              El código meteorológico del modelo indica tormenta para: {stormHours.map(hour => formatForecastTime(hour.time)).join(', ')}.
              Esto no es una alerta oficial.
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {nextHours.map(hour => (
              <article
                key={hour.time}
                className={`min-w-0 rounded-lg border p-2.5 ${
                  isStormCode(hour.weather_code)
                    ? 'border-amber-300/50 bg-amber-300/15'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <p className="text-[10px] font-bold text-white">{formatForecastTime(hour.time)}</p>
                <p className="mt-1 truncate text-[10px] text-sky-100">{conditionFromCode(hour.weather_code)}</p>
                <p className="mt-1 text-[10px] text-sky-50">
                  Lluvia:{' '}
                  <strong>
                    {typeof hour.precipitation_probability === 'number'
                      ? `${hour.precipitation_probability}%`
                      : 'sin dato'}
                  </strong>
                  {' · '}
                  {typeof hour.temperature_c === 'number' ? `${Math.round(hour.temperature_c)}°C` : '—'}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-3 rounded-lg border border-white/10 bg-black/10 p-2.5 text-[10px] leading-4 text-sky-100/85">
            La probabilidad corresponde a precipitación del proveedor, no a una predicción entrenada por esta app.
            Una tormenta se señala solo si uno de los códigos horarios del modelo la indica; no se calcula un porcentaje de tormenta.
            {forecast.probability_basis}
          </p>
        </>
      ) : (
        <p role={error ? 'status' : undefined} className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4 text-xs leading-5 text-sky-50">
          {error
            ? `${error} ${online ? 'El pronóstico no está disponible.' : 'Conéctate para cargar el pronóstico.'}`
            : 'No hay un pronóstico guardado. Conéctate para consultar datos meteorológicos.'}
        </p>
      )}
    </section>
  );
}
