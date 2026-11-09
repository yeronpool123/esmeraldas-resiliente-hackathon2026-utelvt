/**
 * ESMERALDAS RESILIENTE 2026 - Contexto Global de Estado y Tiempo Real
 * Sincronización de eventos, roles RBAC y orquestación de módulos
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Usuario,
  IncidenteEmergencia,
  Albergue,
  Alerta,
  FamiliaAfectada,
  InventarioItem,
  EntregaAsistencia,
  InfraestructuraVial,
  RegistroAuditoria,
  ReporteOfflinePendiente,
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
  obtenerUsuarioActual,
  guardarUsuarioActual,
  registrarAuditoria,
  actualizarOcupacionAlbergue,
  registrarEntregaHumanitaria,
  encolarReporteOffline,
  limpiarColaOffline,
  resetearEscenarioCompleto,
} from '../lib/storage';
import { detectarZonaRiesgo } from '../lib/geo';
import { calcularPrioridadIncidente } from '../lib/aiModel';

export interface ToastMensaje {
  id: string;
  tipo: 'exito' | 'error' | 'alerta' | 'info';
  titulo: string;
  mensaje: string;
}

interface AppContextType {
  usuario: Usuario;
  cambiarUsuario: (usuario: Usuario) => void;
  online: boolean;
  setOnlineManual: (estado: boolean) => void;
  sincronizando: boolean;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario>(USUARIOS_INICIALES[1]); // Default COE Operator
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
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
    setUsuario(obtenerUsuarioActual());

    // Listeners de red
    const handleOnline = () => {
      setOnline(true);
      mostrarToast('info', 'Conexión Restablecida', 'Sincronizando reportes pendientes en cola...');
      sincronizarColaInterna();
    };
    const handleOffline = () => {
      setOnline(false);
      mostrarToast('alerta', 'Modo Sin Conexión', 'La aplicación guardará los reportes localmente en IndexedDB.');
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

  const mostrarToast = (tipo: 'exito' | 'error' | 'alerta' | 'info', titulo: string, mensaje: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, tipo, titulo, mensaje }]);
    setTimeout(() => {
      quitarToast(id);
    }, 4500);
  };

  const quitarToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const cambiarUsuario = (nuevo: Usuario) => {
    setUsuario(nuevo);
    guardarUsuarioActual(nuevo);
    mostrarToast('info', 'Sesión Activa', `Perfil cambiado a: ${nuevo.nombre} (${nuevo.rol})`);
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
        cambiarUsuario,
        online,
        setOnlineManual,
        sincronizando,
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
