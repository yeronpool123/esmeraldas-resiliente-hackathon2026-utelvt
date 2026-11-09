/**
 * ESMERALDAS RESILIENTE 2026 - Tipos del Sistema
 * Definición exhaustiva de entidades según Sección S08 y S10
 */

export type RolUsuario = 'CIUDADANO' | 'OPERADOR_COE' | 'ADMIN';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
}

export type FuenteOrigen = 'REPORTE_CIUDADANO' | 'DATO_SIMULADO' | 'ALERTA_OFICIAL';

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type TipoAmenaza = 'INUNDACION' | 'DESLIZAMIENTO' | 'DESBORDAMIENTO_RIO';

export interface ZonaRiesgo {
  id: number;
  nombre_sector: string;
  parroquia: string;
  tipo_amenaza: TipoAmenaza;
  nivel_riesgo: NivelRiesgo;
  descripcion: string;
  fuente_dato: string;
  poligono: [number, number][]; // [lat, lng][] para Leaflet
}

export type EstadoTransito = 'OPERATIVA' | 'PRECAUCION' | 'INTERRUMPIDA';
export type CategoriaVia = 'TRONCAL' | 'PROVINCIAL' | 'URBANA' | 'PASARELA';

export interface InfraestructuraVial {
  id: number;
  nombre_via: string;
  categoria: CategoriaVia;
  estado_transito: EstadoTransito;
  detalle_estado: string;
  linea: [number, number][]; // [lat, lng][]
}

export interface Hidrografia {
  id: number;
  nombre: string;
  tipo: 'RIO' | 'ESTERO';
  linea: [number, number][];
}

export type TipoServicio = 'SALUD' | 'SEGURIDAD' | 'BOMBEROS' | 'ABASTECIMIENTO' | 'EDUCACION';

export interface ServicioEsencial {
  id: number;
  nombre: string;
  tipo_servicio: TipoServicio;
  direccion: string;
  telefono: string;
  ubicacion: [number, number]; // [lat, lng]
}

export type GravedadIncidente = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type EstadoIncidente = 'PENDIENTE' | 'EN_PROCESO' | 'ATENDIDO' | 'DESCARTADO';

export interface IncidenteEmergencia {
  id: number;
  uuid_cliente: string;
  fuente_origen: FuenteOrigen;
  tipo_evento: string;
  gravedad: GravedadIncidente;
  estado: EstadoIncidente;
  personas_afectadas: number;
  descripcion: string;
  foto_url?: string;
  zona_riesgo_id?: number;
  zona_riesgo_nombre?: string;
  verificado: boolean;
  score_ia?: number;
  ubicacion: [number, number]; // [lat, lng]
  creado_en: string;
}

export type EstadoAlbergue = 'DISPONIBLE' | 'CASI_LLENO' | 'LLENO' | 'CERRADO';

export interface Albergue {
  id: number;
  nombre_albergue: string;
  direccion: string;
  responsable: string;
  telefono: string;
  capacidad_maxima: number;
  ocupacion_actual: number;
  estado: EstadoAlbergue;
  servicios: string[];
  ubicacion: [number, number]; // [lat, lng]
}

export type NivelAlerta = 'INFORMATIVA' | 'PRECAUCION' | 'ALERTA' | 'EMERGENCIA';

export interface Alerta {
  id: number;
  titulo: string;
  mensaje: string;
  nivel: NivelAlerta;
  sector: string;
  fuente: string;
  activa: boolean;
  creado_en: string;
}

export interface FamiliaAfectada {
  id: number;
  jefe_hogar: string; // Enmascarada en UI pública
  telefono_contacto: string; // Enmascarada
  numero_integrantes: number;
  necesidades_prioritarias: string[];
  albergue_asignado_id?: number;
  estado: 'REGISTRADA' | 'EVACUADA' | 'ALBERGADA' | 'ATENDIDA';
  creado_en: string;
  ubicacion: [number, number];
}

export type TipoItemInventario = 'KIT_ALIMENTOS' | 'AGUA_POTABLE' | 'KIT_MEDICINAS' | 'KIT_ASEO';

export interface InventarioItem {
  id: number;
  tipo_item: TipoItemInventario;
  descripcion: string;
  stock: number;
  stock_reservado: number;
}

export interface EntregaAsistencia {
  id: number;
  familia_id: number;
  familia_nombre: string;
  tipo_item: TipoItemInventario;
  cantidad: number;
  creado_en: string;
  entregado_por: string;
}

export interface RegistroAuditoria {
  id: number;
  usuario: string;
  accion: string;
  entidad: string;
  entidad_id: number;
  detalle: string;
  fecha: string;
}

export interface ReporteOfflinePendiente {
  uuid_cliente: string;
  tipo_evento: string;
  gravedad: GravedadIncidente;
  descripcion: string;
  personas_afectadas: number;
  lat: number;
  lng: number;
  foto_data?: string;
  creado_en: string;
  estado_sync: 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';
}
