import {
  ArrowRight,
  Activity,
  BedDouble,
  Map,
  Megaphone,
  ShieldCheck,
  UsersRound,
  Waypoints,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModuloId, RolUsuario } from '../../types';

interface RoleHomeViewProps {
  role: RolUsuario;
  onNavigate: (module: ModuloId) => void;
  onReturnToPortal: () => void;
}

const roleCopy: Record<RolUsuario, { title: string; subtitle: string; label: string }> = {
  CIUDADANO: {
    title: 'Portal ciudadano',
    subtitle: 'Consulta información de referencia y conoce cómo reportar una situación.',
    label: 'Comunidad',
  },
  OPERADOR_COE: {
    title: 'Espacio de coordinación COE',
    subtitle: 'Accede a las herramientas disponibles para revisar el escenario y coordinar acciones.',
    label: 'Operaciones',
  },
  ADMIN: {
    title: 'Resumen de administración',
    subtitle: 'Vista general del escenario y accesos a las herramientas disponibles.',
    label: 'Administración',
  },
};

const roleModules: Record<RolUsuario, { id: ModuloId; title: string; description: string; icon: typeof Map }[]> = {
  CIUDADANO: [
    { id: 'mapa', title: 'Consultar mapa', description: 'Explora las capas territoriales mostradas en el visor.', icon: Map },
    { id: 'reportar', title: 'Reportar una situación', description: 'Registra ubicación y detalles para revisión.', icon: Megaphone },
  ],
  OPERADOR_COE: [
    { id: 'coe', title: 'Tablero de operaciones', description: 'Revisa incidentes, alertas e indicadores disponibles.', icon: Activity },
    { id: 'mapa', title: 'Visor cartográfico', description: 'Consulta las capas y ubicaciones del escenario.', icon: Map },
    { id: 'albergues', title: 'Albergues y vías', description: 'Consulta ocupación y estado de rutas representadas.', icon: BedDouble },
    { id: 'analitica', title: 'Analítica preventiva', description: 'Consulta indicadores territoriales del escenario.', icon: BrainCircuit },
  ],
  ADMIN: [
    { id: 'mapa', title: 'Visor cartográfico', description: 'Consulta las capas territoriales disponibles.', icon: Map },
    { id: 'coe', title: 'Resumen de operaciones', description: 'Revisa los indicadores e incidentes del escenario.', icon: Activity },
    { id: 'albergues', title: 'Albergues y vías', description: 'Consulta el estado de albergues y rutas.', icon: Waypoints },
    { id: 'asistencia', title: 'Asistencia humanitaria', description: 'Accede al inventario y los registros de demostración.', icon: UsersRound },
    { id: 'analitica', title: 'Analítica preventiva', description: 'Consulta indicadores territoriales del escenario.', icon: BrainCircuit },
  ],
};

export function RoleHomeView({ role, onNavigate, onReturnToPortal }: RoleHomeViewProps) {
  const { usuario, incidentes, alertas, albergues, vias, colaOffline } = useApp();
  const copy = roleCopy[role];
  const pendingIncidents = incidentes.filter(incident => incident.estado === 'PENDIENTE').length;
  const activeAlerts = alertas.filter(alert => alert.activa).length;
  const highOccupancyShelters = albergues.filter(
    shelter => shelter.capacidad_maxima > 0 && shelter.ocupacion_actual / shelter.capacidad_maxima >= 0.9,
  ).length;
  const interruptedRoads = vias.filter(road => road.estado_transito === 'INTERRUMPIDA').length;

  const summaryItems = role === 'CIUDADANO'
    ? [
        { label: 'Capas para consulta', value: 'Mapa', icon: Map },
        { label: 'Reportes en cola en este dispositivo', value: colaOffline.length, icon: Megaphone },
      ]
    : [
        { label: 'Incidentes pendientes', value: pendingIncidents, icon: Activity },
        { label: 'Alertas activas', value: activeAlerts, icon: Megaphone },
        { label: 'Albergues con ocupación alta', value: highOccupancyShelters, icon: BedDouble },
        { label: 'Vías interrumpidas', value: interruptedRoads, icon: Waypoints },
      ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-[#064e3b] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{copy.label}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.title}</h1>
            <p className="mt-3 text-sm leading-6 text-emerald-50/90 sm:text-base">{copy.subtitle}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-emerald-50">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Sesión verificada: {usuario.nombre}
            </p>
            {usuario.entidad && (
              <p className="mt-2 text-xs font-semibold text-emerald-100">
                Entidad seleccionada: {usuario.entidad.replaceAll('_', ' ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onReturnToPortal}
            className="min-h-10 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Volver al Portal Ciudadano
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
          <p>
            <strong>Escenario de referencia:</strong> el acceso institucional ya fue verificado por el
            servidor. Aun así, los indicadores y registros de estos módulos pueden proceder de datos
            locales y no sustituyen los canales oficiales de emergencia.
          </p>
        </div>
      </div>

      <div className={`grid gap-3 ${summaryItems.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
        {summaryItems.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold leading-5 text-slate-600">{label}</p>
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-800" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900">Accesos disponibles</h2>
          <p className="mt-1 text-sm text-slate-600">Abre una herramienta para continuar.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roleModules[role].map(({ id, title, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="group flex min-h-40 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="mt-4 flex w-full items-center justify-between gap-3 font-bold text-slate-900">
                {title}
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-800 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-2 text-sm leading-5 text-slate-600">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
