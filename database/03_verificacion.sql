-- Ejecutar después del esquema y los datos semilla.
SELECT PostGIS_Full_Version();

-- Incidentes ubicados en los polígonos de riesgo.
SELECT i.id, i.tipo_evento, z.nombre_sector, z.nivel_riesgo
FROM incidentes_emergencia AS i
JOIN zonas_riesgo AS z ON ST_Within(i.ubicacion_geom, z.poligono_geom)
ORDER BY i.id;

-- Albergues con cupos, ordenados por distancia desde Portal del Río.
SELECT
    a.id,
    a.nombre_albergue,
    a.capacidad_maxima - a.ocupacion_actual AS cupos,
    ROUND(ST_Distance(a.ubicacion_geom::geography, ST_SetSRID(ST_MakePoint(-79.6760, 0.9380), 4326)::geography)::numeric) AS distancia_m
FROM albergues AS a
WHERE a.estado NOT IN ('LLENO', 'CERRADO')
ORDER BY ST_Distance(a.ubicacion_geom::geography, ST_SetSRID(ST_MakePoint(-79.6760, 0.9380), 4326)::geography)
LIMIT 3;

-- Indicadores básicos para comprobar la carga del escenario.
SELECT
    (SELECT COUNT(*) FROM incidentes_emergencia) AS incidentes,
    (SELECT COALESCE(SUM(personas_afectadas), 0) FROM incidentes_emergencia) AS personas_afectadas,
    (SELECT COUNT(*) FROM familias_afectadas) AS familias,
    (SELECT COUNT(*) FROM infraestructura_vial WHERE estado_transito = 'INTERRUMPIDA') AS vias_interrumpidas,
    (SELECT COUNT(*) FROM albergues WHERE 100.0 * ocupacion_actual / capacidad_maxima >= 90) AS albergues_criticos;
