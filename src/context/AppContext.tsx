/**
 * ESMERALDAS RESILIENTE 2026 - Contexto Global de Estado y Tiempo Real
 * Sincronización de eventos, roles RBAC y orquestación de módulos
 */

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Usuario,
  RolUsuario,
  EntidadCoe,
  IncidenteEmergencia,
  Albergue,
  Alerta,
  FamiliaAfectada,
  InventarioItem,
  EntregaAsistencia,
  InfraestructuraVial,
  RegistroAuditoria,
  ReporteOfflinePendiente,
  SOSPendiente,
  EstadoIncidente,
  EstadoTransito,
  TipoItemInventario,
} from '../types';
import {
  ZONAS_RIESGO_INICIALES,
  USUARIOS_INICIALES,
} from '../data/seed';
import {
  inicializarStorage,
  obtenerIncidentes,
  obtenerAlbergues,
  obtenerAlertas,
  obtenerFamilias,
  obtenerInventario,
  obtenerEntregas,
  obtenerVias,
  obtenerAuditoria,
  obtenerColaOffline,
  registrarAuditoria,
  actualizarOcupacionAlbergue,
  registrarEntregaHumanitaria,
  encolarReporteOffline,
  limpiarColaOffline,
  resetearEscenarioCompleto,
} from '../lib/storage';
import { detectarZonaRiesgo } from '../lib/geo';
import { calcularPrioridadIncidente } from '../lib/aiModel';
import { guardarSOSPendientes, obtenerSOSPendientes } from '../lib/sosQueue';
import { DEMO_AUTH_ENABLED, DEMO_SESSION_STORAGE_KEY } from '../lib/demoAuth';

export interface ToastMensaje {
  id: string;
  tipo: 'exito' | 'error' | 'alerta' | 'info';
  titulo: string;
  mensaje: string;
}

interface AppContextType {
  usuario: Usuario;
  accessToken: string | null;
  sesionInstitucionalActiva: boolean;
  demoAuthEnabled: boolean;
  iniciarSesion: (
    identifier: string,
    password: string,
    role: Exclude<RolUsuario, 'CIUDADANO'>,
    entity: EntidadCoe | null,
  ) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  online: boolean;
  setOnlineManual: (estado: boolean) => void;
  sincronizando: boolean;
  demoModeEnabled: boolean;
  sosPendientes: number;
  tema: 'dark' | 'light';
  toggleTema: () => void;
  
  // Datos
  incidentes: IncidenteEmergencia[];
  albergues: Albergue[];
  alertas: Alerta[];
  familias: FamiliaAfectada[];
  inventario: InventarioItem[];
  entregas: EntregaAsistencia[];
  vias: InfraestructuraVial[];
  auditoria: RegistroAuditoria[];
  colaOffline: ReporteOfflinePendiente[];
  toasts: ToastMensaje[];
  quitarToast: (id: string) => void;
  mostrarToast: (tipo: 'exito' | 'error' | 'alerta' | 'info', titulo: string, mensaje: string) => void;

  // Acciones
  crearIncidente: (datos: {
    tipo_evento: string;
    gravedad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    descripcion: string;
    personas_afectadas: number;
    lat: number;
    lng: number;
    foto_url?: string;
  }) => Promise<{ success: boolean; encoladoOffline?: boolean; mensaje: string }>;
  enviarSOS: (datos: Omit<SOSPendiente, 'uuid_cliente' | 'capturado_en_dispositivo'>) => Promise<{
    encoladoOffline: boolean;
    incidente: IncidenteEmergencia;
  }>;
  sincronizarSOS: () => Promise<void>;

  actualizarEstadoIncidente: (id: number, nuevoEstado: EstadoIncidente) => void;
  emitirAlerta: (alerta: { titulo: string; mensaje: string; nivel: 'INFORMATIVA' | 'PRECAUCION' | 'ALERTA' | 'EMERGENCIA'; sector: string }) => void;
  cambiarOcupacionAlbergue: (id: number, delta: number) => { success: boolean; mensaje: string };
  cambiarEstadoVia: (id: number, nuevoEstado: EstadoTransito, detalle?: string) => void;
  registrarNuevaFamilia: (familia: Omit<FamiliaAfectada, 'id' | 'creado_en'>) => void;
  hacerEntregaHumanitaria: (familiaId: number, tipoItem: TipoItemInventario, cantidad: number) => { success: boolean; mensaje: string };
  sincronizarCola: () => Promise<void>;
  restaurarEscenario06AM: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  usuario: Pick<Usuario, 'id' | 'nombre' | 'email' | 'rol' | 'entidad'>;
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!isRecord(value) || !isRecord(value.usuario)) return false;
  const data = value;
  const user = value.usuario;
  return (
    typeof data.access_token === 'string' &&
    typeof data.refresh_token === 'string' &&
    typeof user.id === 'number' &&
    typeof user.nombre === 'string' &&
    typeof user.email === 'string' &&
    (user.rol === 'ADMIN' || user.rol === 'OPERADOR_COE') &&
    (user.entidad === null || typeof user.entidad === 'string')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const SOS_TYPES = ['ASISTENCIA', 'INUNDACION', 'DESLIZAMIENTO', 'INCENDIO', 'OTRA'] as const;

function isSOSResponse(value: unknown): value is Record<string, unknown> & {
  id: number;
  uuid_cliente: string;
  tipo_evento: 'SOS_CIUDADANO';
  gravedad: 'CRITICA';
  estado: EstadoIncidente;
  descripcion: string;
  categoria_sos: SOSPendiente['tipo_evento'];
  ubicacion: [number, number];
  creado_en: string;
  verificado: false;
} {
  if (!isRecord(value) || !Array.isArray(value.ubicacion)) return false;
  const [lat, lng] = value.ubicacion;
  return (
    typeof value.id === 'number' &&
    typeof value.uuid_cliente === 'string' &&
    value.tipo_evento === 'SOS_CIUDADANO' &&
    value.gravedad === 'CRITICA' &&
    ['PENDIENTE', 'EN_PROCESO', 'ATENDIDO', 'DESCARTADO'].includes(String(value.estado)) &&
    typeof value.descripcion === 'string' &&
    typeof value.categoria_sos === 'string' &&
    SOS_TYPES.includes(value.categoria_sos as (typeof SOS_TYPES)[number]) &&
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    typeof value.creado_en === 'string' &&
    value.verificado === false
  );
}

function buildSosIncident(
  report: SOSPendiente,
  id: number,
  syncState: 'PENDIENTE' | 'SINCRONIZADO',
): IncidenteEmergencia {
  return {
    id,
    uuid_cliente: report.uuid_cliente,
    fuente_origen: report.demo_mode ? 'DATO_SIMULADO' : 'REPORTE_CIUDADANO',
    tipo_evento: report.demo_mode ? 'SOS_SIMULADO' : 'SOS_CIUDADANO',
    categoria_sos: report.tipo_evento,
    gravedad: 'CRITICA',
    estado: 'PENDIENTE',
    personas_afectadas: 0,
    descripcion: report.descripcion || `Solicitud de ayuda · ${report.tipo_evento.toLowerCase()}`,
    verificado: false,
    gps_accuracy_m: report.gps_accuracy_m,
    capturado_en_dispositivo: report.capturado_en_dispositivo,
    es_simulacion: report.demo_mode,
    estado_sync: syncState,
    es_sos_publico: true,
    ubicacion: [report.lat, report.lng],
    creado_en: report.capturado_en_dispositivo,
  };
}

function mapServerSos(value: unknown, exactLocation: boolean): IncidenteEmergencia | null {
  if (!isSOSResponse(value)) return null;
  const latitude = value.ubicacion[0];
  const longitude = value.ubicacion[1];
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return {
    id: 1_000_000_000 + value.id,
    uuid_cliente: value.uuid_cliente,
    fuente_origen: value.es_simulacion === true ? 'DATO_SIMULADO' : 'REPORTE_CIUDADANO',
    tipo_evento: value.tipo_evento,
    categoria_sos: value.categoria_sos,
    gravedad: value.gravedad,
    estado: value.estado,
    personas_afectadas: 0,
    descripcion: value.descripcion,
    zona_riesgo_nombre: typeof value.zona_riesgo_nombre === 'string' ? value.zona_riesgo_nombre : undefined,
    verificado: false,
    gps_accuracy_m: typeof value.gps_accuracy_m === 'number' ? value.gps_accuracy_m : null,
    capturado_en_dispositivo:
      typeof value.capturado_en_dispositivo === 'string' ? value.capturado_en_dispositivo : null,
    es_simulacion: value.es_simulacion === true,
    estado_sync: 'SINCRONIZADO',
    es_sos_publico: true,
    ubicacion_aproximada: !exactLocation,
    ubicacion: [latitude, longitude],
    creado_en: value.creado_en,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [demoSessionUser, setDemoSessionUser] = useState<Usuario | null>(() => {
    if (!DEMO_AUTH_ENABLED) return null;
    const stored = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    if (!stored) return null;
    try {
      const session: unknown = JSON.parse(stored);
      if (
        isRecord(session) &&
        (session.rol === 'ADMIN' || session.rol === 'OPERADOR_COE') &&
        typeof session.email === 'string' &&
        (session.entidad === null || typeof session.entidad === 'string')
      ) {
        return {
          id: 0,
          nombre: session.rol === 'ADMIN' ? 'Administrador · Demostración' : 'Operador COE · Demostración',
          email: session.email,
          rol: session.rol,
          activo: true,
          entidad: session.entidad,
        };
      }
    } catch (error) {
      console.warn('Se descartó una sesión local de demostración inválida.', error);
    }
    sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    return null;
  });
  const [usuario, setUsuario] = useState<Usuario>(demoSessionUser ?? USUARIOS_INICIALES[2]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState<boolean>(
    () => localStorage.getItem('er2026_demo_mode_enabled') === 'true',
  );
  const [sosPendientes, setSosPendientes] = useState(0);
  const [tema, setTema] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<ToastMensaje[]>([]);

  // Estados de entidades
  const [incidentes, setIncidentes] = useState<IncidenteEmergencia[]>([]);
  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [familias, setFamilias] = useState<FamiliaAfectada[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [entregas, setEntregas] = useState<EntregaAsistencia[]>([]);
  const [vias, setVias] = useState<InfraestructuraVial[]>([]);
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>([]);
  const [colaOffline, setColaOffline] = useState<ReporteOfflinePendiente[]>([]);

  // Inicialización
  useEffect(() => {
    inicializarStorage();
    recargarTodo();
    try {
      setSosPendientes(obtenerSOSPendientes().length);
    } catch (error) {
      console.error('No se pudo leer la cola local de SOS.', error);
    }

    // Listeners de red
    const handleOnline = () => {
      setOnline(true);
      mostrarToast('info', 'Conexión Restablecida', 'Sincronizando reportes y SOS pendientes en cola...');
      sincronizarColaInterna();
    };
    const handleOffline = () => {
      setOnline(false);
      mostrarToast('alerta', 'Modo Sin Conexión', 'Los reportes y SOS se guardarán localmente hasta que vuelva la conexión.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recargarTodo = () => {
    setIncidentes(obtenerIncidentes());
    setAlbergues(obtenerAlbergues());
    setAlertas(obtenerAlertas());
    setFamilias(obtenerFamilias());
    setInventario(obtenerInventario());
    setEntregas(obtenerEntregas());
    setVias(obtenerVias());
    setAuditoria(obtenerAuditoria());
    setColaOffline(obtenerColaOffline());
  };

  const quitarToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const mostrarToast = useCallback((
    tipo: 'exito' | 'error' | 'alerta' | 'info',
    titulo: string,
    mensaje: string,
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, tipo, titulo, mensaje }]);
    setTimeout(() => {
      quitarToast(id);
    }, 4500);
  }, [quitarToast]);

  useEffect(() => {
    let active = true;
    const fetchPublicConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/config`);
        if (!response.ok) throw new Error(`Configuración pública: HTTP ${response.status}`);
        const value: unknown = await response.json();
        if (!isRecord(value) || typeof value.demo_mode_enabled !== 'boolean') {
          throw new Error('La configuración pública del backend no tiene el formato esperado.');
        }
        if (!active) return;
        setDemoModeEnabled(value.demo_mode_enabled);
        localStorage.setItem('er2026_demo_mode_enabled', String(value.demo_mode_enabled));
      } catch (error) {
        if (active && navigator.onLine) {
          console.warn('No se pudo consultar la configuración pública; se conserva el último valor local.', error);
        }
      }
    };
    void fetchPublicConfig();
    return () => {
      active = false;
    };
  }, []);

  const enviarSOS = async (
    datos: Omit<SOSPendiente, 'uuid_cliente' | 'capturado_en_dispositivo'>,
  ): Promise<{ encoladoOffline: boolean; incidente: IncidenteEmergencia }> => {
    if (datos.demo_mode && (!online || !navigator.onLine || !demoModeEnabled)) {
      throw new Error('La simulación no está habilitada por el servidor o no hay conexión para confirmarla. No se envió ninguna alerta.');
    }

    const report: SOSPendiente = {
      ...datos,
      uuid_cliente: crypto.randomUUID(),
      capturado_en_dispositivo: new Date().toISOString(),
    };
    const localId = Date.now();
    const saveLocalIncident = (incident: IncidenteEmergencia) => {
      const current = obtenerIncidentes().filter(item => item.uuid_cliente !== report.uuid_cliente);
      const next = [incident, ...current];
      localStorage.setItem('er2026_incidentes', JSON.stringify(next));
      setIncidentes(next);
    };
    const enqueueLocally = () => {
      const queue = obtenerSOSPendientes();
      if (!queue.some(item => item.uuid_cliente === report.uuid_cliente)) {
        const nextQueue = [...queue, report];
        guardarSOSPendientes(nextQueue);
        setSosPendientes(nextQueue.length);
      }
      const incidente = buildSosIncident(report, localId, 'PENDIENTE');
      saveLocalIncident(incidente);
      mostrarToast(
        'alerta',
        'SOS guardado en este dispositivo',
        'Aún no lo reciben otros usuarios. Se intentará enviar cuando vuelva la conexión con el servidor.',
      );
      return { encoladoOffline: true, incidente };
    };

    if (!online || !navigator.onLine) return enqueueLocally();

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/public/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      if (report.demo_mode) {
        throw new Error('No se pudo confirmar con el servidor que la simulación está habilitada. No se guardó ni envió el SOS simulado.');
      }
      return enqueueLocally();
    }

    if (!response.ok) {
      let detail = `El servidor rechazó el SOS (HTTP ${response.status}).`;
      try {
        const errorBody: unknown = await response.json();
        if (isRecord(errorBody) && typeof errorBody.detail === 'string') detail = errorBody.detail;
      } catch {
        // The HTTP status remains the authoritative error when its body is invalid.
      }
      if (response.status >= 500) {
        if (report.demo_mode) {
          throw new Error('El servidor no pudo confirmar la simulación. No se guardó ni envió el SOS simulado.');
        }
        return enqueueLocally();
      }
      throw new Error(detail);
    }

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      if (report.demo_mode) {
        throw new Error('El servidor no confirmó la respuesta de simulación. No se guardó ni envió el SOS simulado.');
      }
      return enqueueLocally();
    }
    const serverIncident = mapServerSos(result, true);
    if (!serverIncident) {
      if (report.demo_mode) {
        throw new Error('La respuesta del servidor no confirmó la simulación. No se guardó ni envió el SOS simulado.');
      }
      return enqueueLocally();
    }
    const incidente = {
      ...buildSosIncident(report, localId, 'SINCRONIZADO'),
      zona_riesgo_nombre: serverIncident.zona_riesgo_nombre,
      creado_en: serverIncident.creado_en,
      ubicacion_aproximada: false,
    };
    saveLocalIncident(incidente);
    mostrarToast('exito', 'SOS recibido por el sistema', 'El reporte quedó registrado y visible para los usuarios conectados.');
    return { encoladoOffline: false, incidente };
  };

  const sincronizarSOS = useCallback(async () => {
    if (!online || !navigator.onLine) return;
    const pending = obtenerSOSPendientes();
    let synchronizedCount = 0;
    for (const report of pending) {
      let response: Response;
      try {
        response = await fetch(`${API_BASE_URL}/api/public/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        break;
      }
      if (!response.ok) {
        if (response.status < 500 && response.status !== 429) {
          let reason = `HTTP ${response.status}`;
          try {
            const body: unknown = await response.json();
            if (isRecord(body) && typeof body.detail === 'string') reason = body.detail;
          } catch {
            // Report the status if the server response is not JSON.
          }
          mostrarToast('error', 'No se pudo sincronizar el SOS', reason);
        }
        break;
      }
      let value: unknown;
      try {
        value = await response.json();
      } catch {
        break;
      }
      const serverIncident = mapServerSos(value, true);
      if (!serverIncident) break;

      const localIncident = buildSosIncident(report, Date.now(), 'SINCRONIZADO');
      localIncident.zona_riesgo_nombre = serverIncident.zona_riesgo_nombre;
      localIncident.creado_en = serverIncident.creado_en;
      localIncident.ubicacion_aproximada = false;
      const stored = obtenerIncidentes().filter(item => item.uuid_cliente !== report.uuid_cliente);
      const next = [localIncident, ...stored];
      localStorage.setItem('er2026_incidentes', JSON.stringify(next));
      setIncidentes(next);
      const remainingQueue = obtenerSOSPendientes().filter(item => item.uuid_cliente !== report.uuid_cliente);
      guardarSOSPendientes(remainingQueue);
      setSosPendientes(remainingQueue.length);
      synchronizedCount += 1;
    }
    if (synchronizedCount > 0) {
      mostrarToast('exito', 'SOS sincronizados', `${synchronizedCount} reporte(s) ya llegaron al servidor.`);
    }
  }, [online, mostrarToast]);

  useEffect(() => {
    if (!online) return;
    let active = true;
    const refreshSOS = async () => {
      try {
        await sincronizarSOS();
        const path = accessToken ? '/api/public/sos/exact' : '/api/public/sos';
        let response = await fetch(`${API_BASE_URL}${path}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
        let exactLocation = Boolean(accessToken);
        if (accessToken && (response.status === 401 || response.status === 403)) {
          response = await fetch(`${API_BASE_URL}/api/public/sos`);
          exactLocation = false;
        }
        if (!response.ok) throw new Error(`Consulta de SOS: HTTP ${response.status}`);
        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error('El servidor devolvió una lista de SOS inválida.');
        const remote = payload
          .map(item => mapServerSos(item, exactLocation))
          .filter((item): item is IncidenteEmergencia => item !== null);
        if (!active) return;

        const local = obtenerIncidentes();
        const localSOSByUuid = new Map(
          local
            .filter(item => item.es_sos_publico && item.uuid_cliente)
            .map(item => [item.uuid_cliente!, item]),
        );
        const mergedRemote = remote.map(item => {
          const localCopy = item.uuid_cliente ? localSOSByUuid.get(item.uuid_cliente) : undefined;
          return localCopy
            ? {
                ...localCopy,
                ...item,
                id: localCopy.id,
                ubicacion: localCopy.ubicacion,
                ubicacion_aproximada: false,
              }
            : item;
        });
        const localNonSOS = local.filter(item => !item.es_sos_publico);
        setIncidentes([...mergedRemote, ...local.filter(item => item.es_sos_publico && item.estado_sync === 'PENDIENTE'), ...localNonSOS]);
      } catch (error) {
        if (active && navigator.onLine) {
          console.warn('No se pudieron actualizar los SOS desde FastAPI.', error);
        }
      }
    };
    void refreshSOS();
    const intervalId = window.setInterval(() => void refreshSOS(), 20000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [accessToken, online, sincronizarSOS]);

  const iniciarSesion = async (
    identifier: string,
    password: string,
    role: Exclude<RolUsuario, 'CIUDADANO'>,
    entity: EntidadCoe | null,
  ) => {
    if (DEMO_AUTH_ENABLED) {
      if (!identifier.trim() || !password) {
        throw new Error('Ingresa un usuario y una contraseña para continuar.');
      }
      if (role === 'OPERADOR_COE' && !entity) {
        throw new Error('Selecciona la entidad COE para continuar.');
      }
      const demoUser: Usuario = {
        id: 0,
        nombre: role === 'ADMIN' ? 'Administrador · Demostración' : `Operador COE · ${entity}`,
        email: identifier.trim(),
        rol: role,
        activo: true,
        entidad: entity,
      };
      sessionStorage.setItem(
        DEMO_SESSION_STORAGE_KEY,
        JSON.stringify({ email: demoUser.email, rol: demoUser.rol, entidad: demoUser.entidad ?? null }),
      );
      setDemoSessionUser(demoUser);
      setUsuario(demoUser);
      setAccessToken(null);
      setRefreshToken(null);
      mostrarToast('alerta', 'Sesión local de demostración', 'No se validó con FastAPI y no concede acceso a datos protegidos del backend.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role, entity }),
    });
    if (response.status === 401) throw new Error('Identificador o contraseña incorrectos.');
    if (response.status === 423) throw new Error('Acceso bloqueado durante 5 minutos por intentos fallidos.');
    if (response.status === 429) throw new Error('Se alcanzó el límite de intentos. Espera un momento y vuelve a intentar.');
    if (!response.ok) throw new Error(`El servicio de autenticación respondió con error (${response.status}).`);

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new Error('El servicio de autenticación devolvió una respuesta inválida.');
    }
    if (!isLoginResponse(result)) {
      throw new Error('El servicio de autenticación devolvió una respuesta inválida.');
    }
    if (result.usuario.rol !== role) {
      throw new Error('La cuenta no tiene permisos para el perfil seleccionado.');
    }

    const authenticatedUser: Usuario = { ...result.usuario, activo: true };
    setUsuario(authenticatedUser);
    setAccessToken(result.access_token);
    setRefreshToken(result.refresh_token);
    mostrarToast('exito', 'Acceso institucional verificado', `Sesión iniciada como ${authenticatedUser.nombre}.`);
  };

  const cerrarSesion = async () => {
    const tokenToRevoke = refreshToken;
    setDemoSessionUser(null);
    sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUsuario(USUARIOS_INICIALES[2]);
    if (!tokenToRevoke) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokenToRevoke }),
      });
      if (!response.ok) {
        mostrarToast('alerta', 'Sesión local cerrada', 'No se confirmó la revocación en el servidor; el token local fue eliminado.');
      }
    } catch {
      mostrarToast('alerta', 'Sesión local cerrada', 'No se pudo confirmar la revocación en el servidor; el token local fue eliminado.');
    }
  };

  const toggleTema = () => {
    setTema(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setOnlineManual = (estado: boolean) => {
    setOnline(estado);
    if (estado) {
      mostrarToast('exito', 'Red Activada', 'Conexión simulada activa');
      sincronizarColaInterna();
    } else {
      mostrarToast('alerta', 'Red Desconectada', 'Modo offline activado para pruebas');
    }
  };

  // Sincronización interna
  const sincronizarColaInterna = async () => {
    const cola = obtenerColaOffline();
    if (cola.length === 0) return;
    setSincronizando(true);

    // Simular latencia de red de 600ms
    await new Promise(res => setTimeout(res, 600));

    const incidentesActuales = obtenerIncidentes();
    const nuevosIncidentes: IncidenteEmergencia[] = [...incidentesActuales];

    for (const item of cola) {
      // Detección espacial ST_Within
      const zona = detectarZonaRiesgo(item.lat, item.lng, ZONAS_RIESGO_INICIALES);
      
      const nuevoInc: IncidenteEmergencia = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        uuid_cliente: item.uuid_cliente,
        fuente_origen: 'REPORTE_CIUDADANO',
        tipo_evento: item.tipo_evento,
        gravedad: item.gravedad,
        estado: 'PENDIENTE',
        personas_afectadas: item.personas_afectadas,
        descripcion: item.descripcion,
        foto_url: item.foto_data,
        zona_riesgo_id: zona?.id,
        zona_riesgo_nombre: zona?.nombre_sector,
        verificado: false,
        ubicacion: [item.lat, item.lng],
        creado_en: item.creado_en,
      };

      const prioridad = calcularPrioridadIncidente(nuevoInc, zona);
      nuevoInc.score_ia = prioridad.score;
      nuevosIncidentes.unshift(nuevoInc);

      registrarAuditoria(
        'Ciudadano (Sincronizado)',
        'INCIDENTE_SINCRONIZADO_OFFLINE',
        'INCIDENTES',
        nuevoInc.id,
        `Sincronización de reporte offline con UUID ${item.uuid_cliente}. Sector: ${zona?.nombre_sector || 'General'}`
      );
    }

    localStorage.setItem('er2026_incidentes', JSON.stringify(nuevosIncidentes));
    limpiarColaOffline();
    recargarTodo();
    setSincronizando(false);
    mostrarToast('exito', 'Sincronización Exitosa', `${cola.length} reporte(s) offline sincronizados con el COE.`);
  };

  // Crear reporte (Online u Offline)
  const crearIncidente = async (datos: {
    tipo_evento: string;
    gravedad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    descripcion: string;
    personas_afectadas: number;
    lat: number;
    lng: number;
    foto_url?: string;
  }): Promise<{ success: boolean; encoladoOffline?: boolean; mensaje: string }> => {
    const uuid_cliente = crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`;

    if (!online) {
      // Guardar en cola offline
      const pendiente: ReporteOfflinePendiente = {
        uuid_cliente,
        tipo_evento: datos.tipo_evento,
        gravedad: datos.gravedad,
        descripcion: datos.descripcion,
        personas_afectadas: datos.personas_afectadas,
        lat: datos.lat,
        lng: datos.lng,
        foto_data: datos.foto_url,
        creado_en: new Date().toISOString(),
        estado_sync: 'PENDIENTE',
      };
      encolarReporteOffline(pendiente);
      recargarTodo();
      mostrarToast('alerta', 'Guardado en Cola Offline', 'Sin conexión: el reporte se sincronizará automáticamente al volver la red.');
      return { success: true, encoladoOffline: true, mensaje: 'Reporte encolado offline' };
    }

    // Proceso Online
    const zona = detectarZonaRiesgo(datos.lat, datos.lng, ZONAS_RIESGO_INICIALES);
    const incidentesActuales = obtenerIncidentes();

    const nuevoInc: IncidenteEmergencia = {
      id: Date.now(),
      uuid_cliente,
      fuente_origen: usuario.rol === 'OPERADOR_COE' ? 'ALERTA_OFICIAL' : 'REPORTE_CIUDADANO',
      tipo_evento: datos.tipo_evento,
      gravedad: datos.gravedad,
      estado: 'PENDIENTE',
      personas_afectadas: datos.personas_afectadas,
      descripcion: datos.descripcion,
      foto_url: datos.foto_url,
      zona_riesgo_id: zona?.id,
      zona_riesgo_nombre: zona?.nombre_sector,
      verificado: usuario.rol === 'OPERADOR_COE',
      ubicacion: [datos.lat, datos.lng],
      creado_en: new Date().toISOString(),
    };

    const prioridad = calcularPrioridadIncidente(nuevoInc, zona);
    nuevoInc.score_ia = prioridad.score;

    const listaActualizada = [nuevoInc, ...incidentesActuales];
    localStorage.setItem('er2026_incidentes', JSON.stringify(listaActualizada));

    registrarAuditoria(
      usuario.nombre,
      'INCIDENTE_CREADO',
      'INCIDENTES',
      nuevoInc.id,
      `Nuevo reporte de ${datos.tipo_evento} (${datos.gravedad}). Ubicación en zona: ${zona?.nombre_sector || 'Área urbana general'}`
    );

    recargarTodo();
    mostrarToast('exito', 'Reporte Enviado', `Registrado y clasificado en el COE. Zona: ${zona?.nombre_sector || 'Fuera de polígono crítico'}`);
    return { success: true, encoladoOffline: false, mensaje: 'Reporte creado y transmitido por WebSocket' };
  };

  const actualizarEstadoIncidente = (id: number, nuevoEstado: EstadoIncidente) => {
    const lista = obtenerIncidentes();
    const idx = lista.findIndex(i => i.id === id);
    if (idx === -1) return;

    const anterior = lista[idx].estado;
    lista[idx].estado = nuevoEstado;
    if (nuevoEstado === 'ATENDIDO') lista[idx].verificado = true;

    localStorage.setItem('er2026_incidentes', JSON.stringify(lista));
    registrarAuditoria(
      usuario.nombre,
      'INCIDENTE_ESTADO_CAMBIADO',
      'INCIDENTES',
      id,
      `Estado modificado de ${anterior} a ${nuevoEstado}`
    );
    recargarTodo();
    mostrarToast('info', 'Estado Actualizado', `Incidente #${id} actualizado a ${nuevoEstado}`);
  };

  const emitirAlerta = (nueva: { titulo: string; mensaje: string; nivel: 'INFORMATIVA' | 'PRECAUCION' | 'ALERTA' | 'EMERGENCIA'; sector: string }) => {
    const lista = obtenerAlertas();
    const alertaObj: Alerta = {
      id: Date.now(),
      titulo: nueva.titulo,
      mensaje: nueva.mensaje,
      nivel: nueva.nivel,
      sector: nueva.sector,
      fuente: 'OPERADOR_COE',
      activa: true,
      creado_en: new Date().toISOString(),
    };
    localStorage.setItem('er2026_alertas', JSON.stringify([alertaObj, ...lista]));
    registrarAuditoria(
      usuario.nombre,
      'ALERTA_EMITIDA',
      'ALERTAS',
      alertaObj.id,
      `Alerta de nivel ${nueva.nivel} emitida para ${nueva.sector}: ${nueva.titulo}`
    );
    recargarTodo();
    mostrarToast('alerta', `Alerta de Emergencia Emitida`, `${nueva.titulo} (${nueva.sector})`);
  };

  const cambiarOcupacionAlbergue = (id: number, delta: number) => {
    const res = actualizarOcupacionAlbergue(id, delta, usuario.nombre);
    if (res.success) {
      recargarTodo();
      mostrarToast('exito', 'Albergue Actualizado', res.mensaje);
    } else {
      mostrarToast('error', 'Error en Capacidad', res.mensaje);
    }
    return res;
  };

  const cambiarEstadoVia = (id: number, nuevoEstado: EstadoTransito, detalle?: string) => {
    const listaVias = obtenerVias();
    const idx = listaVias.findIndex(v => v.id === id);
    if (idx === -1) return;

    listaVias[idx].estado_transito = nuevoEstado;
    if (detalle) listaVias[idx].detalle_estado = detalle;

    localStorage.setItem('er2026_vias', JSON.stringify(listaVias));
    registrarAuditoria(
      usuario.nombre,
      'ESTADO_VIA_ACTUALIZADO',
      'VIAS',
      id,
      `Vía ${listaVias[idx].nombre_via} cambiada a estado ${nuevoEstado}`
    );
    recargarTodo();
    mostrarToast('info', 'Tránsito Vial Actualizado', `${listaVias[idx].nombre_via}: ${nuevoEstado}`);
  };

  const registrarNuevaFamilia = (datos: Omit<FamiliaAfectada, 'id' | 'creado_en'>) => {
    const lista = obtenerFamilias();
    const nuevaFam: FamiliaAfectada = {
      ...datos,
      id: Date.now(),
      creado_en: new Date().toISOString(),
    };
    localStorage.setItem('er2026_familias', JSON.stringify([nuevaFam, ...lista]));
    registrarAuditoria(
      usuario.nombre,
      'FAMILIA_CENSADA',
      'FAMILIAS',
      nuevaFam.id,
      `Censo de familia con ${datos.numero_integrantes} integrantes en ${datos.estado}`
    );
    recargarTodo();
    mostrarToast('exito', 'Familia Registrada', `Censo familiar completado con protección LOPDP.`);
  };

  const hacerEntregaHumanitaria = (familiaId: number, tipoItem: TipoItemInventario, cantidad: number) => {
    const res = registrarEntregaHumanitaria(familiaId, tipoItem, cantidad, usuario.nombre);
    if (res.success) {
      recargarTodo();
      mostrarToast('exito', 'Entrega Humanitaria Registrada', res.mensaje);
    } else {
      mostrarToast('error', 'Error en Despacho', res.mensaje);
    }
    return res;
  };

  const sincronizarCola = async () => {
    await sincronizarColaInterna();
  };

  const restaurarEscenario06AM = () => {
    resetearEscenarioCompleto();
    recargarTodo();
    mostrarToast('info', 'Escenario Reiniciado', 'Datos restaurados al estado oficial Jueves 06:00 AM');
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        accessToken,
        sesionInstitucionalActiva: Boolean(accessToken || demoSessionUser),
        demoAuthEnabled: DEMO_AUTH_ENABLED,
        iniciarSesion,
        cerrarSesion,
        online,
        setOnlineManual,
        sincronizando,
        demoModeEnabled,
        sosPendientes,
        tema,
        toggleTema,
        incidentes,
        albergues,
        alertas,
        familias,
        inventario,
        entregas,
        vias,
        auditoria,
        colaOffline,
        toasts,
        quitarToast,
        mostrarToast,
        crearIncidente,
        enviarSOS,
        sincronizarSOS,
        actualizarEstadoIncidente,
        emitirAlerta,
        cambiarOcupacionAlbergue,
        cambiarEstadoVia,
        registrarNuevaFamilia,
        hacerEntregaHumanitaria,
        sincronizarCola,
        restaurarEscenario06AM,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}
