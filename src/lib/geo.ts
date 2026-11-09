/**
 * ESMERALDAS RESILIENTE 2026 - Biblioteca Geoespacial y LOPDP
 * Cálculos espaciales equivalentes a PostGIS (ST_Within, ST_Distance::geography, ST_Intersects(ST_Buffer))
 */

import { ZonaRiesgo, Albergue, InfraestructuraVial } from '../types';

/**
 * Algoritmo Ray-Casting (equivalente a ST_Within de PostGIS)
 * Comprueba si una coordenada [lat, lng] está dentro de un polígono
 */
export function puntoEnPoligono(lat: number, lng: number, poligono: [number, number][]): boolean {
  let dentro = false;
  const n = poligono.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poligono[i][0];
    const yi = poligono[i][1];
    const xj = poligono[j][0];
    const yj = poligono[j][1];

    const intersecta = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersecta) dentro = !dentro;
  }
  return dentro;
}

/**
 * Encuentra la zona de riesgo en la que cae una coordenada
 */
export function detectarZonaRiesgo(lat: number, lng: number, zonas: ZonaRiesgo[]): ZonaRiesgo | null {
  for (const zona of zonas) {
    if (puntoEnPoligono(lat, lng, zona.poligono)) {
      return zona;
    }
  }
  return null;
}

/**
 * Distancia geodésica en metros (fórmula Haversine, equivalente a ST_Distance sobre ::geography)
 */
export function calcularDistanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Comprueba si dos segmentos de línea se intersectan
 */
function segmentosSeCruzan(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): boolean {
  const ccw = (A: [number, number], B: [number, number], C: [number, number]) => {
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  };
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
    ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

/**
 * Distancia mínima de un punto a un segmento en metros
 */
function distanciaPuntoASegmentoMetros(
  p: [number, number],
  v: [number, number],
  w: [number, number]
): number {
  const l2 = Math.pow(v[0] - w[0], 2) + Math.pow(v[1] - w[1], 2);
  if (l2 === 0) return calcularDistanciaMetros(p[0], p[1], v[0], v[1]);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  const proy: [number, number] = [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])];
  return calcularDistanciaMetros(p[0], p[1], proy[0], proy[1]);
}

/**
 * Comprueba si una trayectoria recta cruza el buffer de 150m de una vía interrumpida
 * Equivalente a PostGIS: ST_Intersects(ST_MakeLine(origen, destino)::geography, ST_Buffer(linea_geom::geography, 150))
 */
export function trayectoriaCruzaViaInterrumpida(
  origen: [number, number],
  destino: [number, number],
  vias: InfraestructuraVial[]
): boolean {
  const viasInterrumpidas = vias.filter(v => v.estado_transito === 'INTERRUMPIDA');
  
  for (const via of viasInterrumpidas) {
    for (let i = 0; i < via.linea.length - 1; i++) {
      const v1 = via.linea[i];
      const v2 = via.linea[i + 1];
      
      // Chequeo de intersección directa
      if (segmentosSeCruzan(origen, destino, v1, v2)) {
        return true;
      }
      
      // Chequeo de buffer de 150 metros
      const puntosMuestra = 10;
      for (let s = 0; s <= puntosMuestra; s++) {
        const factor = s / puntosMuestra;
        const puntoMuestra: [number, number] = [
          origen[0] + factor * (destino[0] - origen[0]),
          origen[1] + factor * (destino[1] - origen[1]),
        ];
        const dist = distanciaPuntoASegmentoMetros(puntoMuestra, v1, v2);
        if (dist <= 150) {
          return true;
        }
      }
    }
  }
  return false;
}

export interface AlbergueCercanoResultado {
  albergue: Albergue;
  distancia_m: number;
  cupos_libres: number;
  porcentaje_ocupacion: number;
  ruta_bloqueada: boolean;
  advertencia_via?: string;
}

/**
 * Encuentra albergues con cupo disponibles y calcula si la ruta está bloqueada
 */
export function buscarAlberguesCercanos(
  origenLat: number,
  origenLng: number,
  albergues: Albergue[],
  vias: InfraestructuraVial[]
): AlbergueCercanoResultado[] {
  const origen: [number, number] = [origenLat, origenLng];

  // Descartar albergues LLENOS o CERRADOS
  const disponibles = albergues.filter(a => a.estado !== 'LLENO' && a.estado !== 'CERRADO');

  const resultados: AlbergueCercanoResultado[] = disponibles.map(a => {
    const dist = calcularDistanciaMetros(origenLat, origenLng, a.ubicacion[0], a.ubicacion[1]);
    const cupos = a.capacidad_maxima - a.ocupacion_actual;
    const pct = Math.round((a.ocupacion_actual / a.capacidad_maxima) * 1000) / 10;
    const bloqueada = trayectoriaCruzaViaInterrumpida(origen, a.ubicacion, vias);

    return {
      albergue: a,
      distancia_m: dist,
      cupos_libres: cupos,
      porcentaje_ocupacion: pct,
      ruta_bloqueada: bloqueada,
      advertencia_via: bloqueada
        ? 'Precaución: El trayecto directo cruza el perímetro de corte de la Vía E20 interrumpida.'
        : undefined,
    };
  });

  // Ordenar por distancia ascendente
  resultados.sort((a, b) => a.distancia_m - b.distancia_m);
  return resultados;
}

/**
 * Protección de datos personales (LOPDP Ecuador)
 * Minimización y seudonimización de nombres y teléfonos
 */
export function enmascararNombre(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  const primerNombre = partes[0];
  const inicialApellido = partes[partes.length - 1][0] || '';
  return `${primerNombre} ${inicialApellido}.`;
}

export function enmascararTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.length < 7) return '09XXXXXXX';
  const inicio = limpio.substring(0, 2);
  const fin = limpio.substring(limpio.length - 3);
  return `${inicio}···${fin}`;
}
