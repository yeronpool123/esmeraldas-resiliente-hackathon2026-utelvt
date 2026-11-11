-- Datos operativos demostrativos del escenario. Las familias son ficticias;
-- las zonas de riesgo son aproximaciones didacticas, no cartografia oficial.
-- El script es repetible: los registros usan identificadores estables.
BEGIN;

INSERT INTO hidrografia (id, nombre, tipo, linea_geom) VALUES
(1, 'Río Esmeraldas', 'RIO', ST_GeomFromText('LINESTRING(-79.6420 0.9300, -79.6330 0.9600, -79.6180 0.9850, -79.6000 0.9990)', 4326)),
(2, 'Río Teaone', 'RIO', ST_GeomFromText('LINESTRING(-79.7350 0.8700, -79.7150 0.9050, -79.6900 0.9200, -79.6680 0.9280, -79.6500 0.9400)', 4326))
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, tipo = EXCLUDED.tipo, linea_geom = EXCLUDED.linea_geom;

INSERT INTO zonas_riesgo (id, nombre_sector, parroquia, tipo_amenaza, nivel_riesgo, descripcion, fuente_dato, poligono_geom) VALUES
(1, 'Barrio 50 Casas y ribera del Teaone', 'Luis Tello', 'DESBORDAMIENTO_RIO', 'CRITICO', 'Sector ribereño del sur, inundado de forma recurrente por el Teaone (jun-2023 y ene-2024).', 'PRENSA_VERIFICADA', ST_GeomFromText('POLYGON((-79.6740 0.9370, -79.6740 0.9490, -79.6620 0.9490, -79.6620 0.9370, -79.6740 0.9370))', 4326)),
(2, 'Barrio 24 de Mayo', 'Luis Tello', 'INUNDACION', 'ALTO', 'Barrio del suroccidente de la ciudad, afectado por el desborde del Teaone de enero de 2024.', 'PRENSA_VERIFICADA', ST_GeomFromText('POLYGON((-79.6690 0.9440, -79.6690 0.9530, -79.6590 0.9530, -79.6590 0.9440, -79.6690 0.9440))', 4326)),
(3, 'Barrio Los Mangos', 'Luis Tello', 'INUNDACION', 'ALTO', 'Zona baja contigua a 24 de Mayo, con antecedentes de inundación urbana.', 'PRENSA_VERIFICADA', ST_GeomFromText('POLYGON((-79.6745 0.9440, -79.6745 0.9510, -79.6670 0.9510, -79.6670 0.9440, -79.6745 0.9440))', 4326)),
(4, 'Barrio La Propicia', 'Luis Tello', 'INUNDACION', 'ALTO', 'Sector occidental con evacuaciones preventivas documentadas ante crecidas del Teaone.', 'PRENSA_VERIFICADA', ST_GeomFromText('POLYGON((-79.6770 0.9490, -79.6770 0.9580, -79.6680 0.9580, -79.6680 0.9490, -79.6770 0.9490))', 4326)),
(5, 'Barrio Portal del Río (acceso sur)', 'Luis Tello', 'DESBORDAMIENTO_RIO', 'ALTO', 'Barrio de la vía de acceso sur, junto al puente sobre el Teaone; familias evacuadas en 2024.', 'PRENSA_VERIFICADA', ST_GeomFromText('POLYGON((-79.6810 0.9340, -79.6810 0.9420, -79.6720 0.9420, -79.6720 0.9340, -79.6810 0.9340))', 4326)),
(6, 'Isla Luis Vargas Torres', 'Esmeraldas', 'DESBORDAMIENTO_RIO', 'ALTO', 'Isla del río Esmeraldas, anegada en eventos de crecida documentados.', 'PRENSA_VERIFICADA', ST_GeomFromText('POLYGON((-79.6330 0.9750, -79.6330 0.9890, -79.6170 0.9890, -79.6170 0.9750, -79.6330 0.9750))', 4326)),
(7, 'Sector Las Palmas', 'Simón Plata Torres', 'INUNDACION', 'MEDIO', 'Sector al norte del río Esmeraldas, expuesto a crecidas y lluvias intensas.', 'DATO_SIMULADO', ST_GeomFromText('POLYGON((-79.6530 0.9770, -79.6530 0.9910, -79.6390 0.9910, -79.6390 0.9770, -79.6530 0.9770))', 4326)),
(8, 'Centro y Malecón (parroquia Esmeraldas)', 'Esmeraldas', 'INUNDACION', 'MEDIO', 'Zona baja del centro histórico junto al malecón del río Esmeraldas.', 'DATO_SIMULADO', ST_GeomFromText('POLYGON((-79.6580 0.9590, -79.6580 0.9710, -79.6460 0.9710, -79.6460 0.9590, -79.6580 0.9590))', 4326)),
(9, 'Laderas vía E20 (parroquia Vuelta Larga)', 'Vuelta Larga', 'DESLIZAMIENTO', 'ALTO', 'Tramo de ladera susceptible a deslizamientos que interrumpen la vía a Quinindé.', 'DATO_SIMULADO', ST_GeomFromText('POLYGON((-79.6990 0.9140, -79.6990 0.9260, -79.6830 0.9260, -79.6830 0.9140, -79.6990 0.9140))', 4326))
ON CONFLICT (id) DO UPDATE SET
    nombre_sector = EXCLUDED.nombre_sector, parroquia = EXCLUDED.parroquia,
    tipo_amenaza = EXCLUDED.tipo_amenaza, nivel_riesgo = EXCLUDED.nivel_riesgo,
    descripcion = EXCLUDED.descripcion, fuente_dato = EXCLUDED.fuente_dato,
    poligono_geom = EXCLUDED.poligono_geom, actualizado_en = NOW();

INSERT INTO infraestructura_vial (id, nombre_via, categoria, estado_transito, detalle_estado, linea_geom) VALUES
(1, 'Vía E20 Esmeraldas - Quinindé (tramo Vuelta Larga)', 'TRONCAL', 'INTERRUMPIDA', 'Deslizamiento de tierra en la madrugada del jueves bloquea ambos carriles; maquinaria en camino.', ST_GeomFromText('LINESTRING(-79.6729 0.9323, -79.6900 0.9250, -79.7100 0.9150)', 4326)),
(2, 'Vía E15 Ruta del Spondylus (Esmeraldas - Atacames)', 'TRONCAL', 'PRECAUCION', 'Lluvia persistente y visibilidad reducida; tránsito con precaución.', ST_GeomFromText('LINESTRING(-79.6540 0.9765, -79.6620 0.9950, -79.6850 1.0200)', 4326)),
(3, 'Avenida Libertad (eje urbano)', 'URBANA', 'OPERATIVA', 'Eje principal norte-sur operativo con acumulación de agua en cunetas.', ST_GeomFromText('LINESTRING(-79.6729 0.9323, -79.6630 0.9530, -79.6541 0.9765)', 4326)),
(4, 'Acceso sur y puente sobre el río Teaone', 'PROVINCIAL', 'PRECAUCION', 'Caudal crecido del Teaone; tránsito restringido a vehículos livianos.', ST_GeomFromText('LINESTRING(-79.6710 0.9380, -79.6660 0.9430)', 4326)),
(5, 'Vía Esmeraldas - San Mateo', 'PROVINCIAL', 'OPERATIVA', 'Vía rural operativa, uso como ruta alterna hacia el suroccidente.', ST_GeomFromText('LINESTRING(-79.6600 0.9400, -79.6450 0.9150, -79.6300 0.8900)', 4326))
ON CONFLICT (id) DO UPDATE SET nombre_via = EXCLUDED.nombre_via, categoria = EXCLUDED.categoria,
    estado_transito = EXCLUDED.estado_transito, detalle_estado = EXCLUDED.detalle_estado, linea_geom = EXCLUDED.linea_geom;

INSERT INTO servicios_esenciales (id, nombre, tipo_servicio, direccion, telefono, ubicacion_geom) VALUES
(1, 'Hospital Delfina Torres de Concha', 'SALUD', 'Avenida Libertad', '0990000010', ST_SetSRID(ST_MakePoint(-79.654089, 0.976560), 4326)),
(2, 'Cuerpo de Bomberos de Esmeraldas', 'BOMBEROS', 'Avenida Libertad, centro', '0990000011', ST_SetSRID(ST_MakePoint(-79.6570, 0.9630), 4326)),
(3, 'Unidad de Policía Comunitaria del Centro', 'SEGURIDAD', 'Centro, parroquia Esmeraldas', '0990000012', ST_SetSRID(ST_MakePoint(-79.6530, 0.9660), 4326)),
(4, 'Mercado Municipal Central', 'ABASTECIMIENTO', 'Centro, parroquia Esmeraldas', '0990000013', ST_SetSRID(ST_MakePoint(-79.6560, 0.9640), 4326)),
(5, 'Campus UTLVTE Puerto Balao', 'EDUCACION', 'Vía Puerto Balao', '0990000014', ST_SetSRID(ST_MakePoint(-79.665838, 0.974110), 4326))
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, tipo_servicio = EXCLUDED.tipo_servicio,
    direccion = EXCLUDED.direccion, telefono = EXCLUDED.telefono, ubicacion_geom = EXCLUDED.ubicacion_geom;

INSERT INTO albergues (id, nombre_albergue, direccion, responsable, telefono, capacidad_maxima, ocupacion_actual, estado, servicios, ubicacion_geom) VALUES
(1, 'Coliseo Municipal de Esmeraldas', 'Centro, parroquia Esmeraldas', 'GAD Municipal de Esmeraldas', '0990000001', 400, 386, 'CASI_LLENO', ARRAY['AGUA','ELECTRICIDAD','LETRINAS','AREA_INFANTIL'], ST_SetSRID(ST_MakePoint(-79.6550, 0.9650), 4326)),
(2, 'Unidad Educativa 5 de Agosto', 'Parroquia 5 de Agosto', 'GAD Municipal de Esmeraldas', '0990000002', 300, 145, 'DISPONIBLE', ARRAY['AGUA','ELECTRICIDAD','LETRINAS'], ST_SetSRID(ST_MakePoint(-79.6630, 0.9600), 4326)),
(3, 'Escuela Bartolomé Ruiz', 'Parroquia Bartolomé Ruiz', 'GAD Municipal de Esmeraldas', '0990000003', 250, 80, 'DISPONIBLE', ARRAY['AGUA','ELECTRICIDAD'], ST_SetSRID(ST_MakePoint(-79.6600, 0.9705), 4326)),
(4, 'Aula Magna UTLVTE (Campus Puerto Balao)', 'Campus UTLVTE Puerto Balao', 'UTLVTE', '0990000004', 600, 210, 'DISPONIBLE', ARRAY['AGUA','ELECTRICIDAD','LETRINAS','COMEDOR'], ST_SetSRID(ST_MakePoint(-79.665838, 0.974110), 4326)),
(5, 'Centro Comunitario de San Mateo', 'Parroquia rural San Mateo', 'Junta Parroquial de San Mateo', '0990000005', 150, 12, 'DISPONIBLE', ARRAY['AGUA'], ST_SetSRID(ST_MakePoint(-79.6400, 0.9050), 4326))
ON CONFLICT (id) DO UPDATE SET nombre_albergue = EXCLUDED.nombre_albergue, direccion = EXCLUDED.direccion,
    responsable = EXCLUDED.responsable, telefono = EXCLUDED.telefono, capacidad_maxima = EXCLUDED.capacidad_maxima,
    ocupacion_actual = EXCLUDED.ocupacion_actual, estado = EXCLUDED.estado, servicios = EXCLUDED.servicios,
    ubicacion_geom = EXCLUDED.ubicacion_geom;

INSERT INTO incidentes_emergencia (id, uuid_cliente, fuente_origen, tipo_evento, gravedad, estado, personas_afectadas, descripcion, zona_riesgo_id, verificado, score_ia, ubicacion_geom, creado_en) VALUES
(1, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0001', 'ALERTA_OFICIAL', 'AVISO_METEOROLOGICO', 'ALTA', 'EN_PROCESO', 0, 'INAMHI, Advertencia Meteorológica No. 86: lluvias fuertes, tormentas eléctricas y posibles desbordamientos en la provincia de Esmeraldas. Vigencia regional.', NULL, TRUE, 78.5, ST_SetSRID(ST_MakePoint(-79.6539, 0.9592), 4326), '2026-11-05 06:00:00-05'),
(2, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0002', 'REPORTE_CIUDADANO', 'INUNDACION_URBANA', 'CRITICA', 'PENDIENTE', 85, 'El agua ingresó a las viviendas del barrio 50 Casas tras la crecida del río Teaone. Se reporta nivel cercano a 1 metro en las calles.', 1, FALSE, 94.8, ST_SetSRID(ST_MakePoint(-79.6680, 0.9430), 4326), '2026-11-05 06:05:00-05'),
(3, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0003', 'REPORTE_CIUDADANO', 'DESLIZAMIENTO_TIERRA', 'ALTA', 'PENDIENTE', 0, 'Deslizamiento de tierra bloquea la vía a Quinindé en el tramo Vuelta Larga. Material sobre calzada en al menos 40 metros.', 9, FALSE, 86.2, ST_SetSRID(ST_MakePoint(-79.6905, 0.9200), 4326), '2026-11-05 06:10:00-05'),
(4, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0004', 'DATO_SIMULADO', 'DESBORDAMIENTO_RIO', 'CRITICA', 'EN_PROCESO', 120, 'Desborde del río Teaone afecta a comunidades de la parroquia rural Vuelta Larga; conectividad de telefonía móvil intermitente.', 9, TRUE, 91.5, ST_SetSRID(ST_MakePoint(-79.7000, 0.9120), 4326), '2026-11-05 06:12:00-05'),
(5, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0005', 'REPORTE_CIUDADANO', 'PERSONAS_ATRAPADAS', 'CRITICA', 'PENDIENTE', 23, 'Familias atrapadas en el sector Portal del Río solicitan evacuación inmediata; el agua rodea las viviendas y sigue subiendo.', 5, FALSE, 97.4, ST_SetSRID(ST_MakePoint(-79.6760, 0.9380), 4326), '2026-11-05 06:15:00-05'),
(6, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0006', 'DATO_SIMULADO', 'ALBERGUE_SATURACION', 'ALTA', 'EN_PROCESO', 386, 'El Coliseo Municipal, albergue temporal, alcanza el 96.5% de su capacidad (386 de 400). Se requiere redireccionar nuevos evacuados.', NULL, TRUE, 89.1, ST_SetSRID(ST_MakePoint(-79.6550, 0.9650), 4326), '2026-11-05 06:20:00-05'),
(7, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0007', 'REPORTE_CIUDADANO', 'SOLICITUD_SUMINISTROS', 'ALTA', 'PENDIENTE', 386, 'Solicitud urgente de agua potable, alimentos y medicinas para los albergados en el Coliseo Municipal.', NULL, FALSE, 82.0, ST_SetSRID(ST_MakePoint(-79.6550, 0.9650), 4326), '2026-11-05 06:25:00-05'),
(8, '9a7c3b21-1f4a-4d2b-9e1a-8c5e6d7b0008', 'REPORTE_CIUDADANO', 'INUNDACION_URBANA', 'MEDIA', 'ATENDIDO', 12, 'Anegamiento moderado en calles del barrio Los Mangos; agua acumulada en cunetas y patios, drenando lentamente.', 3, TRUE, 54.3, ST_SetSRID(ST_MakePoint(-79.6700, 0.9470), 4326), '2026-11-05 06:30:00-05')
ON CONFLICT (id) DO UPDATE SET
    uuid_cliente = EXCLUDED.uuid_cliente, fuente_origen = EXCLUDED.fuente_origen,
    tipo_evento = EXCLUDED.tipo_evento, gravedad = EXCLUDED.gravedad, estado = EXCLUDED.estado,
    personas_afectadas = EXCLUDED.personas_afectadas, descripcion = EXCLUDED.descripcion,
    zona_riesgo_id = EXCLUDED.zona_riesgo_id, verificado = EXCLUDED.verificado, score_ia = EXCLUDED.score_ia,
    ubicacion_geom = EXCLUDED.ubicacion_geom, creado_en = EXCLUDED.creado_en;

INSERT INTO alertas (id, titulo, mensaje, nivel, sector, fuente, activa, creado_en) VALUES
(1, 'Desbordamiento del río Teaone: sectores sur y suroccidente', 'Ante el desborde del río Teaone se activa evacuación preventiva en los barrios ribereños. Ejercicio académico; ante emergencias reales comuníquese con ECU 911.', 'EMERGENCIA', 'Sur de la ciudad de Esmeraldas', 'DATO_SIMULADO', TRUE, '2026-11-05 06:35:00-05'),
(2, 'Capacidad crítica del albergue Coliseo Municipal', 'El albergue Coliseo Municipal alcanzó el 96.5% de su capacidad. Los operadores deben redireccionar a los evacuados hacia los albergues con cupo disponible.', 'ALERTA', 'Centro de Esmeraldas', 'DATO_SIMULADO', TRUE, '2026-11-05 06:36:00-05')
ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, mensaje = EXCLUDED.mensaje,
    nivel = EXCLUDED.nivel, sector = EXCLUDED.sector, fuente = EXCLUDED.fuente,
    activa = EXCLUDED.activa, creado_en = EXCLUDED.creado_en;

INSERT INTO familias_afectadas (id, jefe_hogar, telefono_contacto, numero_integrantes, necesidades_prioritarias, albergue_asignado_id, estado, ubicacion_geom) VALUES
(1, 'Ana Torres', '0991112223', 5, ARRAY['AGUA','ALIMENTOS'], 1, 'ALBERGADA', ST_SetSRID(ST_MakePoint(-79.6762, 0.9382), 4326)),
(2, 'Pedro Saltos', '0991112224', 4, ARRAY['EVACUACION','AGUA'], NULL, 'REGISTRADA', ST_SetSRID(ST_MakePoint(-79.6678, 0.9432), 4326)),
(3, 'Lucía Quiñónez', '0991112225', 6, ARRAY['MEDICINAS','AGUA'], NULL, 'REGISTRADA', ST_SetSRID(ST_MakePoint(-79.6638, 0.9492), 4326)),
(4, 'Jorge Valdez', '0991112226', 3, ARRAY['ALIMENTOS'], 2, 'ALBERGADA', ST_SetSRID(ST_MakePoint(-79.6718, 0.9532), 4326)),
(5, 'Rosa Cabezas', '0991112227', 7, ARRAY['AGUA','ALIMENTOS','MEDICINAS'], NULL, 'EVACUADA', ST_SetSRID(ST_MakePoint(-79.6990, 0.9130), 4326)),
(6, 'Marcos Angulo', '0991112228', 4, ARRAY['ABRIGO'], 4, 'ALBERGADA', ST_SetSRID(ST_MakePoint(-79.6702, 0.9472), 4326))
ON CONFLICT (id) DO UPDATE SET jefe_hogar = EXCLUDED.jefe_hogar, telefono_contacto = EXCLUDED.telefono_contacto,
    numero_integrantes = EXCLUDED.numero_integrantes, necesidades_prioritarias = EXCLUDED.necesidades_prioritarias,
    albergue_asignado_id = EXCLUDED.albergue_asignado_id, estado = EXCLUDED.estado, ubicacion_geom = EXCLUDED.ubicacion_geom;

INSERT INTO inventario_suministros (id, tipo_item, descripcion, stock, stock_reservado) VALUES
(1, 'KIT_ALIMENTOS', 'Kit de alimentos secos para familia (5 días)', 319, 0),
(2, 'AGUA_POTABLE', 'Bidones de agua potable 20 litros', 478, 0),
(3, 'KIT_MEDICINAS', 'Kit de primeros auxilios y medicinas básicas', 150, 0),
(4, 'KIT_ASEO', 'Kit de higiene y aseo personal familiar', 200, 0)
ON CONFLICT (id) DO UPDATE SET tipo_item = EXCLUDED.tipo_item, descripcion = EXCLUDED.descripcion,
    stock = EXCLUDED.stock, stock_reservado = EXCLUDED.stock_reservado;

INSERT INTO entregas_asistencia (id, familia_id, inventario_id, cantidad, estado, creado_en) VALUES
(1, 1, 2, 2, 'ENTREGADA', '2026-11-05 06:40:00-05'),
(2, 1, 1, 1, 'ENTREGADA', '2026-11-05 06:42:00-05')
ON CONFLICT (id) DO UPDATE SET familia_id = EXCLUDED.familia_id, inventario_id = EXCLUDED.inventario_id,
    cantidad = EXCLUDED.cantidad, estado = EXCLUDED.estado, creado_en = EXCLUDED.creado_en;

SELECT setval(pg_get_serial_sequence('hidrografia', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM hidrografia), 1));
SELECT setval(pg_get_serial_sequence('zonas_riesgo', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM zonas_riesgo), 1));
SELECT setval(pg_get_serial_sequence('infraestructura_vial', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM infraestructura_vial), 1));
SELECT setval(pg_get_serial_sequence('servicios_esenciales', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM servicios_esenciales), 1));
SELECT setval(pg_get_serial_sequence('albergues', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM albergues), 1));
SELECT setval(pg_get_serial_sequence('incidentes_emergencia', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM incidentes_emergencia), 1));
SELECT setval(pg_get_serial_sequence('alertas', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM alertas), 1));
SELECT setval(pg_get_serial_sequence('familias_afectadas', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM familias_afectadas), 1));
SELECT setval(pg_get_serial_sequence('inventario_suministros', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM inventario_suministros), 1));
SELECT setval(pg_get_serial_sequence('entregas_asistencia', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM entregas_asistencia), 1));

COMMIT;
