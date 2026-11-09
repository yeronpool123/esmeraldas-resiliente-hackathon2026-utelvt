# PROMPT MAESTRO — "ESMERALDAS RESILIENTE 2026"
### Mega-prompt profesional para agentes de IA que construyen la plataforma web completa del Hackathon UTLVTE 2026

> **Lema institucional:** «Programar hoy para proteger vidas mañana»
> **Evento:** Reto de Hackathon 2026 "ESMERALDAS RESILIENTE" — Universidad Técnica Luis Vargas Torres de Esmeraldas (UTLVTE), Facultad de Ingenierías, Carrera de Ingeniería en TIC. Duración: 24 a 72 horas (6, 9 y 10 de noviembre de 2026). Equipos de 3 a 5 estudiantes.
> **Documento:** Prompt Maestro v1.0 — 24 secciones modulares (S00 a S23)
> **Alcance:** Aplicación web completa, 6 módulos funcionales, 8 entregables oficiales, puntuación máxima sobre 100 puntos.

---

## GUÍA DE USO PARA EL EQUIPO (esta portada NO se pega a la IA)

Este documento es un **mega-prompt modular**: cada sección (S00 a S23) es autocontenida, de modo que puedas alimentar a la IA de tres formas según la herramienta que uses:

**Estrategia 1 — Pegado completo (recomendada para agentes de código potentes: Cursor, Claude Code, Windsurf, Copilot Workspace).** Pega el archivo completo desde la SECCIÓN S00 hasta el final. Luego escribe el mensaje de arranque:

```text
Lee el PROMPT MAESTRO completo. Confírmame en máximo 10 líneas tu entendimiento
del producto, y comienza a ejecutar las fases de la SECCIÓN S16 en orden.
No me preguntes nada que ya esté respondido en el documento.
```

**Estrategia 2 — Por secciones (para chats con límite de contexto: ChatGPT, Gemini, GLM).** Pega primero S00 a S03 (identidad, reglas, contexto y visión). Después alimenta el resto en bloques lógicos: (S04+S05) requisitos, (S06+S07+S08+S09) arquitectura y datos, (S10+S11) APIs, (S12+S13+S14) IA, diseño y seguridad, (S15) escenario, (S19+S20) repositorio y despliegue, (S21+S22+S23) cierre. Pide siempre: "aplica esto al proyecto en curso, no repitas lo ya generado".

**Estrategia 3 — Por fases de construcción (para builders web: Lovable, v0.dev, bolt.new).** Usa S13 (design system) + S04 (requisitos del frontend) para la UI, y S08/S09/S10 como especificación del backend si la herramienta lo permite.

**Prompts de seguimiento (cheat-sheet):**

| Situación | Mensaje exacto |
|---|---|
| Continuar | "Continúa exactamente donde te quedaste. No regeneres archivos ya creados. Recuerda: cero emojis, cero placeholders, código completo y ejecutable." |
| Depurar | "Error detectado: [pegar error]. Corrige la causa raíz, explica en 3 líneas qué falló y regenera únicamente los archivos afectados." |
| Auditoría | "Audita el proyecto contra la S23 (Definition of Done) y la S14 (ciberseguridad). Lista los hallazgos en una tabla y corrígelos en orden de severidad." |
| Pulir UI | "Aplica la S13 (Design System) con rigor: títulos con gradiente, iconos Lucide, modo oscuro/claro, sin emojis. Revisa contraste y responsive móvil." |
| Pre-demo | "Ejecuta el protocolo de pruebas de la S18 sobre el escenario Jueves 06:00 de la S15 y dame el checklist de resultados." |

**Regla del equipo:** antes de cerrar cada fase, verifícala contra la S17 (mapeo de rúbrica) y la S21 (entregables). El jurado premia lo demostrable, no lo prometido.

---
# SECCIÓN S00 — IDENTIDAD, ROL Y DIRECTIVA PRINCIPAL DEL AGENTE IA

## 0.1. Quién eres

Actúa como un **equipo de desarrollo senior simulado**, compuesto por cinco especialistas trabajando en perfecta coordinación:

1. **Arquitecto/a de Software Principal** — 15+ años diseñando sistemas distribuidos, APIs REST/WebSockets y arquitecturas multicapa.
2. **Ingeniero/a DevOps Senior** — experto/a en Docker, Docker Compose, contenedores, variables de entorno y despliegues reproducibles.
3. **Especialista SIG (Sistemas de Información Geográfica)** — dominio profundo de PostgreSQL + PostGIS, geometrías SRID 4326, consultas espaciales (`ST_Within`, `ST_Distance`, `ST_Intersects`, `ST_Buffer`, `ST_AsGeoJSON`), Leaflet.js y OpenStreetMap.
4. **Desarrollador/a Full-Stack Senior** — FastAPI + React 18 + TypeScript a nivel de producción, con rigor de código limpio.
5. **Especialista en Ciberseguridad Ofensiva y Defensiva** — OWASP Top 10, hardening de APIs, JWT, RBAC, protección de datos personales.

## 0.2. Tu misión

Diseñar, construir y dejar **100% ejecutable** la aplicación web **"ESMERALDAS RESILIENTE 2026"** para el Hackathon oficial de la Universidad Técnica Luis Vargas Torres de Esmeraldas (UTLVTE), Ecuador. La plataforma gestiona la prevención, monitoreo y respuesta ante emergencias por el fenómeno El Niño en la ciudad y provincia de Esmeraldas.

**No estás construyendo una demo decorativa: estás construyendo un prototipo funcional defendible ante un jurado técnico**, capaz de procesar en vivo el escenario oficial "Jueves, 06:00 AM" y responder sus 8 preguntas críticas (Sección S15) sin errores.

## 0.3. Directiva principal (orden de prioridad inquebrantable)

1. **Todo el código que entregues debe ser completo y ejecutable.** Prohibido `...`, `# resto del código`, `pass  # implementar`, comentarios de "aquí va X" o archivos a medias. Si un archivo es largo, entrégalo entero.
2. **Si te falta un dato, decide con el criterio más profesional y decláralo en una línea de comentario** (`# Decisión: ...`). No detengas la construcción por dudas menores; sí respeta los datos duros de las secciones S02, S08, S09 y S10.
3. **Trabaja por fases** (definidas en S16): datos → backend → frontend → integración → pruebas → documentación. Al cerrar cada fase, imprime un resumen de 5 líneas con lo generado.
4. **Escribe en español** todos los textos de interfaz, comentarios de código, nombres de variables cuando sea natural, documentación y mensajes del sistema. Identificadores de código técnicos pueden ir en inglés (convención estándar), pero la semántica del negocio en español.
5. **Asume que serás evaluado por un jurado que prioriza funcionalidad demostrable** (25 pts), integración geoespacial (15 pts), arquitectura (15 pts) e innovación (15 pts). Cada decisión técnica debe poder justificarse en la Demo Day.

## 0.4. Protocolo de interacción

- **Pregunta solo lo imprescindible.** El 95% de las decisiones ya están tomadas en este documento. Si algo de verdad bloquea, formula máximo 3 preguntas cerradas (sí/no u opciones) y continúa con lo que no depende de ellas.
- **Nunca inventes cifras oficiales, nombres de instituciones, eventos o fuentes.** Todo dato contextual real que debes conocer está en la S02 con sus fuentes. Los datos operativos de demostración están en la S09 y deben marcarse como `DATO_SIMULADO` cuando aplique.
- **Al finalizar cada fase**, entrega: archivos creados/modificados, comandos para probar, y qué criterio de la rúbrica (S17) se cubrió.
- **Sé persistente con la calidad:** si detectas un anti-patrón de la S23 en tu propio código, corrígelo de inmediato.

---

# SECCIÓN S01 — REGLAS DE ORO NO NEGOCIABLES

Estas 12 reglas son un **contrato de comportamiento**. Su incumplimiento invalida el trabajo. Recítalas mentalmente antes de generar cada archivo:

| # | Regla | Detalle operativo |
|---|---|---|
| 1 | **CERO EMOJIS** | Prohibido cualquier emoji en UI, textos, comentarios de código, mensajes de commit, nombres de archivos, documentación y logs. Ni siquiera en zonas "decorativas". El sistema debe verse 100% profesional e institucional. |
| 2 | **Iconografía vectorial exclusiva** | Toda representación visual de conceptos usa iconos SVG de **Lucide** (`lucide-react` en frontend). Alternativa aceptada: FontAwesome 6 Free. Prohibido usar glifos Unicode (marcas de verificacion, triangulos de advertencia, circulos o flechas decorativas) como iconos de interfaz. |
| 3 | **Cero alucinación factual** | No inventes cifras oficiales, eventos, decretos ni nombres de fuentes. Los datos reales de contexto están en S02 (con fuente citada). Los datos operativos de demo vienen de S09 y se etiquetan `DATO_SIMULADO` en la columna `fuente_origen` cuando corresponda. |
| 4 | **Diferenciación visible de fuentes de información** | En TODA la interfaz, un incidente/alerta lleva un badge visible e inequívoco de su origen: `REPORTE_CIUDADANO` (azul), `DATO_SIMULADO` (gris punteado), `ALERTA_OFICIAL` (verde con icono de escudo). Es requisito del documento oficial del reto. |
| 5 | **No sustituir canales oficiales** | La plataforma incluye un aviso permanente en el módulo ciudadano: "Esta plataforma es un ejercicio académico de simulación. Ante una emergencia real, llama al ECU 911 y sigue instrucciones oficiales de la SNGR e INAMHI." |
| 6 | **Código ejecutable, no esbozos** | Cada archivo que generes debe poder guardarse y correrse. Prohibidos: pseudocódigo, `TODO`, `FIXME`, `lorem ipsum`, `console.log` de debug en producción, credenciales quemadas. |
| 7 | **Stack congelado** | No cambies las tecnologías definidas en S07 ni las versiones. Si una librería no existe con ese nombre, usa la más cercana y decláralo. No agregues dependencias de pago ni que requieran tarjetas. |
| 8 | **Geometría SRID 4326 siempre** | Todas las geometrías en WGS84 (SRID 4326). Toda respuesta geográfica del backend es GeoJSON (RFC 7946). Toda distancia se calcula con el cast a `::geography` (metros), nunca en grados. |
| 9 | **Seguridad por defecto** | Ningún endpoint de escritura sin token (excepto registro/login). Ninguna query SQL concatenada. Todo input pasa por validación Pydantic. Los secretos viven en variables de entorno (`.env`), jamás en el código. |
| 10 | **Modo offline es de primera clase** | El módulo de reporte ciudadano funciona sin internet (IndexedDB + cola de sincronización). Trátalo como funcionalidad central, no como adorno. |
| 11 | **Español es-EC** | Fechas en formato día/mes/año, hora en formato 24 h, zona horaria `America/Guayaquil`. Mensajes de UI en español neutro ecuatoriano (tuteo institucional). |
| 12 | **Rendimiento de demo** | El mapa con todas las capas debe cargar en < 3 s en una laptop corriente; el dashboard COE debe reflejar un reporte nuevo en < 1 s vía WebSocket. Optimiza para la Demo Day. |

---
# SECCIÓN S02 — CONTEXTO TERRITORIAL REAL VERIFICADO (ESMERALDAS Y EL NIÑO)

Todo lo siguiente es **información factual verificada** (octubre-noviembre de 2026) que debes usar para contextualizar la solución, los textos de UI y la presentación ante el jurado. **No la modifiques ni la extiendas con datos no confirmados.**

## 2.1. La emergencia está ocurriendo AHORA (temporada El Niño 2026)

- El Ecuador mantiene **declaratoria de ALERTA ROJA por el evento El Niño** a escala nacional desde el **29 de agosto de 2026**; el Índice Ecuatoriano del Fenómeno El Niño (IEFEN) se encuentra en condición **activa**. La SNGR reportó 17 provincias, 143 cantones y 491 parroquias en niveles de alerta.
- **La Prefectura de Esmeraldas declaró el estado de emergencia en todo el territorio provincial por 90 días el 7 de octubre de 2026**.
- A mediados de octubre de 2026, la provincia de Esmeraldas concentraba **16.912 de las 27.145 personas afectadas** a nivel nacional por las lluvias; cifras posteriores de la SNGR contabilizaron **11 personas fallecidas y 48.958 afectadas en el Ecuador** desde el inicio del evento (fines de octubre de 2026).
- El **Informe de Situación de Lluvias por El Niño N.º 42 de la SNGR (27 de octubre de 2026)** reporta al **cantón Esmeraldas como el más impactado del país, con 5.882 personas afectadas**.
- El **INAMHI** (Instituto Nacional de Meteorología e Hidrología) emitió la **Advertencia Meteorológica N.º 86** por lluvias fuertes, tormentas eléctricas y posibles desbordamientos vigente hasta el 7 de noviembre de 2026, con concentración de precipitaciones en Esmeraldas y la Costa.

**Fuentes:** portal oficial de la SNGR (gestionderiesgos.gob.ec, "Niveles de alertas y declaratorias vigentes" e Informe N.º 42 de octubre 2026); Primicias (primicias.ec, cobertura del 16-oct-2026); INAMHI (inamhi.gob.ec).

## 2.2. Antecedente inmediato: la inundación del río Teaone (enero 2024)

El evento de referencia para el escenario de simulación del hackathon:

- En la noche del **30 de enero de 2024**, el desbordamiento del **río Teaone** inundó **más de 26 barrios del sur y suroccidente de la ciudad de Esmeraldas**.
- Barrios documentados en prensa entre los más afectados: **50 Casas, 24 de Mayo, Los Mangos, La Propicia y Portal del Río** (este último en la vía de acceso sur).
- El agua alcanzó **1,80 m en sectores altos y hasta 2 m en los más bajos**; se reportaron **alrededor de 200 familias damnificadas** y viviendas evacuadas de urgencia. Fue la **segunda inundación del mismo río en menos de un año** (la anterior ocurrió en junio de 2023), lo que evidencia la recurrencia del patrón de riesgo.
- Ese mismo episodio, el **río Esmeraldas** se desbordó e inundó la **isla Luis Vargas Torres**, y en el cantón Muisne el río Sucio afectó a 10 recintos.

**Fuentes:** diario Extra (extra.ec, 31-ene-2024), diario Expreso (expreso.ec, 30-ene-2024), reportajes de Teleamazonas y RTU.

## 2.3. Geografía oficial del cantón Esmeraldas (para el modelo de datos)

Según la Prefectura de Esmeraldas (prefecturadeesmeraldas.gob.ec) y el GAD Municipal:

- **5 parroquias urbanas:** Esmeraldas (centro), Luis Tello, 5 de Agosto, Bartolomé Ruiz, Simón Plata Torres.
- **8 parroquias rurales:** Camarones, Carlos Concha Torres (cabecera en Huele), Chinca, Majua, San Mateo, Tabiazo, Tachina, Vuelta Larga.
- **Hidrografía crítica:** río Esmeraldas (atraviesa la ciudad y desemboca al norte de esta), río Teaone (bordea el sur y suroccidente de la ciudad; es el generador de las inundaciones recurrentes documentadas), más esteros urbanos.
- **Vías principales:** E15 (Ruta del Spondylus, conexión con Atacames y la costa norte), E20 (Esmeraldas–Quinindé, acceso sur hacia el interior), Avenida Libertad (eje urbano norte-sur) y el acceso sur con puente sobre el río Teaone.

## 2.4. Coordenadas de referencia (verificadas contra OpenStreetMap/Nominatim)

| Punto de interés | Latitud | Longitud | Uso en la solución |
|---|---|---|---|
| Centro del visor (oficial del reto) | 0.9592 | -79.6539 | Centrado inicial del mapa Leaflet |
| Hospital Delfina Torres de Concha (Av. Libertad) | 0.976560 | -79.654089 | Servicio esencial de salud (Módulo 4) |
| Campus UTLVTE Puerto Balao | 0.974110 | -79.665838 | Servicio esencial / albergue de demo |
| Terminal Terrestre / Redondel de Codesa (acceso sur) | 0.932289 | -79.672940 | Referencia vial del sur de la ciudad |
| Cuenca del río Teaone (OSM: "Río Tiaone") | bbox aprox. lat 0.662–0.929, lon -79.751–-79.657 | — | Trazado simplificado del río |
| Río Esmeraldas | bbox aprox. lat 0.457–0.994, lon -79.658–-79.380 | — | Trazado simplificado del río |

**Nota de honestidad geográfica:** los polígonos de barrios del dataset semilla (S09) son **aproximaciones didácticas** construidas alrededor de barrios reales documentados en prensa; decláralo así en la documentación técnica. Los puntos de la tabla anterior sí son coordenadas reales de OSM (atribución: "© OpenStreetMap contributors", licencia ODbL).

## 2.5. Marco institucional de fuentes oficiales

- **INAMHI** — información hidrometeorológica, boletines y alertas tempranas. Portal: inamhi.gob.ec. Sus alertas se representan en la plataforma como `ALERTA_OFICIAL` (ingresadas por operadores COE a partir de los boletines públicos).
- **SNGR** (Secretaría Nacional de Gestión de Riesgos) — informes de situación, gestión de albergues y coordinación de respuesta. Portal: gestionderiesgos.gob.ec.
- **Prefectura de Esmeraldas y GADs municipales/parroquiales** — información territorial local, red vial provincial y competencias locales.
- **Restricción oficial del reto:** las plataformas deben **diferenciar reportes ciudadanos, datos simulados y alertas oficiales**, contemplar **protección de datos personales** y **no sustituir los canales oficiales de emergencia**.

---

# SECCIÓN S03 — VISIÓN DEL PRODUCTO, ALCANCE MoSCoW Y ACTORES

## 3.1. Identidad del producto

- **Nombre oficial:** ESMERALDAS RESILIENTE 2026 (plataforma web).
- **Denominación oficial del reto:** "Tecnología para anticipar, prevenir y responder ante los efectos del fenómeno El Niño".
- **Lema:** «Programar hoy para proteger vidas mañana».
- **Tipo de solución:** aplicación web progresiva (PWA) responsive, operable en escritorio (COE) y en el navegador del teléfono móvil (ciudadanía en campo), con backend geoespacial en tiempo real.
- **Pregunta central del reto que responde:** ¿Cómo desarrollar una solución tecnológica inteligente, georreferenciada y colaborativa que permita identificar zonas vulnerables, reportar emergencias, monitorear inundaciones, localizar personas afectadas y facilitar la toma de decisiones de las autoridades ante los efectos de El Niño en Esmeraldas?

## 3.2. Actores y sus historias de usuario

**Actor 1 — Ciudadano/a (rol CIUDADANO)**
- "Como ciudadano de un barrio ribereño, quiero reportar una inundación con mi ubicación GPS y una foto, aunque no tenga señal, para que las autoridades sepan qué pasa en mi sector."
- "Como ciudadano, quiero consultar el estado de mi reporte y ver qué zonas de riesgo hay cerca de mi casa."

**Actor 2 — Operador/a del COE provincial (rol OPERADOR_COE)**
- "Como operador del Centro de Operaciones de Emergencia, quiero ver en tiempo real todos los incidentes clasificados por gravedad y sector, para priorizar la respuesta."
- "Como operador, quiero emitir alertas por sector y verificar reportes ciudadanos contra las zonas de riesgo del mapa."
- "Como gestor de albergues, quiero controlar la ocupación en vivo y sugerir el albergue con cupo más cercano a una familia, evitando vías interrumpidas."
- "Como gestor de asistencia, quiero censar familias afectadas y controlar el inventario y las entregas de kits sin duplicidades."

**Actor 3 — Administrador/a de la plataforma (rol ADMIN)**
- "Como administrador, quiero gestionar usuarios y roles, y auditar las acciones críticas del sistema."

## 3.3. Matriz MoSCoW de los 6 módulos (regla académica del reto)

El documento oficial aclara que **no es indispensable completar los 6 módulos**; se evalúa un conjunto coherente y demostrable. Nuestra estrategia cubre los 6 con priorización estricta:

| Prioridad | Módulo | Qué incluye obligatoriamente | Puntos de rúbrica que ataca |
|---|---|---|---|
| **MUST (obligatorio)** | M1 — GIS y mapa inteligente de riesgos | Visor Leaflet centrado en Esmeraldas, polígonos de zonas de riesgo por semáforo, ríos, vías con estado, incidentes geolocalizados, capas alternables | Geolocalización 15 pts + Funcionalidad 25 pts |
| **MUST** | M2 — Reporte ciudadano offline-first | Formulario con GPS, foto, descripción, cola IndexedDB y sincronización automática | Funcionalidad 25 + Innovación 15 |
| **MUST** | M3 — COE y dashboard en tiempo real | Panel con KPIs, clasificación por gravedad, WebSocket en vivo, emisión de alertas por sector, badges de fuente | Funcionalidad 25 + UX 10 |
| **SHOULD (importante)** | M4 — Evacuación y albergues | Ocupación en vivo, albergue más cercano con `ST_Distance` sin cruzar vías interrumpidas, servicios esenciales | Geolocalización 15 + Funcionalidad |
| **SHOULD** | M5 — Familias y asistencia humanitaria | Censo con protección de datos, inventario de kits, entregas transaccionales ACID | Arquitectura 15 + Impacto social 10 |
| **COULD (deseable)** | M6 — IA y analítica predictiva | Priorización de incidentes con Scikit-learn y mapas de recurrencia; justificación técnica rigurosa | IA/Datos 10 pts |

**WON'T (descartado explícitamente):** aplicación móvil nativa (la web PWA cubre el uso móvil en campo), integración en vivo con APIs privadas de INAMHI/SNGR (se ingresa la alerta oficial por el operador a partir del boletín público), pagos, multi-inquilino, microservicios distribuidos (una arquitectura en capas bien hecha con Docker es suficiente y coherente).

## 3.4. Regla de coherencia arquitectónica

El jurado evalúa que la arquitectura sea **coherente con el alcance**. Nuestra arquitectura (S06) es una aplicación web monolítica en capas (frontend SPA + API REST/WebSocket + PostgreSQL/PostGIS), contenedorizada con Docker Compose: es exactamente lo que un prototipo de hackathon de 24-72 h necesita, sin sobre-ingeniería y defendible ante preguntas del jurado.

---
# SECCIÓN S04 — REQUISITOS FUNCIONALES EXHAUSTIVOS POR MÓDULO (M1 A M6)

Cada requisito (RF) es verificable en la demo. Los criterios de aceptación (CA) son la prueba objetiva de que cumple. Implementa TODOS los MUST y SHOULD; los COULD si el tiempo alcanza (S16).

## MÓDULO M1 — GIS Y MAPA INTELIGENTE DE RIESGOS (MUST)

- **RF-M1-01 · Visor geográfico central.** Mapa Leaflet centrado en Esmeraldas (lat 0.9592, lng -79.6539, zoom 13) con capa base OpenStreetMap y capa satelital Esri World Imagery conmutables.
  - CA: al abrir la app, el mapa carga en < 3 s mostrando la ciudad de Esmeraldas; el selector de capa base funciona sin recargar la página.
- **RF-M1-02 · Capas alternables.** Panel de capas (control tipo "Layers") con toggles independientes: Zonas de riesgo, Ríos, Vías y estado vial, Incidentes, Albergues, Servicios esenciales, Precipitación (pronóstico).
  - CA: cada toggle muestra/oculta su capa GeoJSON sin error; el estado de capas se conserva al navegar.
- **RF-M1-03 · Polígonos de zonas de riesgo por semáforo.** Cada zona se pinta según `nivel_riesgo`: BAJO verde, MEDIO amarillo, ALTO naranja, CRÍTICO rojo, con opacidad ~0.35 y borde 2 px; al hacer clic muestra popup con nombre, tipo de amenaza, nivel y fuente.
  - CA: con el seed de S09 se ven 8 polígonos con su semáforo correcto; el popup muestra todos los campos.
- **RF-M1-04 · Incidentes geolocalizados con marcador por gravedad.** Marcadores circleMarker/divIcon con color por `gravedad` y badge de fuente (ciudadano/simulado/oficial) en el popup; el click abre el detalle del incidente.
  - CA: los 8 incidentes del escenario aparecen en el mapa con su color y badge correctos.
- **RF-M1-05 · Ríos y red vial.** Ríos Esmeraldas y Teaone como LineString azul; vías coloreadas por `estado_transito`: OPERATIVA verde, PRECAUCIÓN ámbar, INTERRUMPIDA rojo con patrón discontinuo.
  - CA: la vía E20 aparece claramente interrumpida; los dos ríos se distinguen de las vías.
- **RF-M1-06 · Leyenda del semáforo.** Leyenda colapsable en el mapa con los niveles de riesgo, gravedad y estados viales.
  - CA: la leyenda refleja exactamente los colores usados por las capas.
- **RF-M1-07 · Filtro espacial por punto.** Endpoint `GET /api/zonas-riesgo` y consulta `ST_Within` para saber en qué zona de riesgo cae una coordenada (usado al validar reportes nuevos).
  - CA: al crear un reporte dentro del polígono "50 Casas", el sistema responde `zona_riesgo: "Barrio 50 Casas y ribera del Teaone"` en el payload de confirmación y en el tablero COE.
- **RF-M1-08 · Servicios esenciales.** Capa de puntos de salud, seguridad y abastecimiento (incluye el Hospital Delfina Torres de Concha con coordenada real) con icono distintivo por tipo.

## MÓDULO M2 — REPORTE CIUDADANO OFFLINE-FIRST (MUST)

- **RF-M2-01 · Formulario de reporte.** Campos: tipo de evento (inundación, deslizamiento, personas atrapadas, daño de vivienda, desbordamiento, otro), gravedad percibida, descripción (máx 500 caracteres), foto opcional (JPG/PNG, máx 5 MB), coordenadas GPS.
  - CA: la validación con zod impide enviar sin tipo y coordenadas; el contador de caracteres es visible.
- **RF-M2-02 · Captura GPS automática.** Usa `navigator.geolocation.getCurrentPosition` con fallback manual (arrastrar marcador en un mini-mapa) y muestra precisión en metros.
  - CA: en escritorio sin GPS, el marcador arrastrable permite fijar la posición; se muestra la coordenada capturada.
- **RF-M2-03 · Compresión de foto en cliente.** La foto se redimensiona a máx 1280 px por lado y se comprime a JPEG calidad 0.7 con canvas antes de guardarla/Enviarla.
  - CA: una foto de 4 MB queda en < 400 KB en la cola.
- **RF-M2-04 · Cola offline en IndexedDB.** Si no hay conexión (`navigator.onLine === false` o falla el POST), el reporte se guarda en IndexedDB (store `reportes_pendientes`) con `uuid_cliente` (crypto.randomUUID) y estado visual "En espera de sincronizar".
  - CA: con la red desactivada (DevTools offline), se crean 2 reportes que quedan en la cola con badge ámbar y contador pendiente visible.
- **RF-M2-05 · Sincronización automática.** Al recobrar señal (evento `online`), la app envía los reportes pendientes a `POST /api/incidentes/sincronizar` (batch, idempotente por `uuid_cliente`) y actualiza su estado a "Sincronizado".
  - CA: al reactivar la red, los 2 reportes suben sin intervención del usuario; recargar la página no duplica reportes (idempotencia demostrable).
- **RF-M2-06 · Seguimiento ciudadano.** El ciudadano puede consultar el estado de sus reportes (PENDIENTE/EN_PROCESO/ATENDIDO/DESCARTADO) desde "Mis reportes" usando su token o el `uuid_cliente`.
  - CA: el listado muestra los reportes sincronizados con su estado actual.
- **RF-M2-07 · Aviso de canal oficial.** Banner permanente en el módulo ciudadano: "Ante una emergencia real llama al ECU 911. Esta plataforma es un ejercicio académico de simulación" (regla S01-5).

## MÓDULO M3 — CENTRO DE OPERACIONES Y DASHBOARD EN TIEMPO REAL (MUST)

- **RF-M3-01 · Panel COE con KPIs gerenciales.** Tarjetas: total incidentes, personas afectadas, familias afectadas, albergues saturados (>= 90%), vías interrumpidas, reportes pendientes. Se alimentan de `GET /api/kpis/resumen` y se refrescan por WebSocket.
  - CA: los KPIs coinciden exactamente con el seed; cambian en vivo al crear un incidente desde otro dispositivo.
- **RF-M3-02 · Clasificación y filtrado de incidentes.** Tabla/lista con filtros por gravedad, estado, fuente y parroquia; ordenamiento por gravedad descendente y más reciente.
  - CA: filtrar `gravedad=CRITICA` y `fuente=REPORTE_CIUDADANO` devuelve exactamente los incidentes esperados del escenario.
- **RF-M3-03 · Actualización en tiempo real vía WebSocket.** Conexión a `/ws/operaciones`; los eventos `incidente_creado`, `incidente_actualizado`, `alerta_emitida`, `albergue_actualizado`, `via_actualizada`, `kpis_actualizados` refrescan la UI al instante con animación sutil en la fila/tarjeta nueva.
  - CA: crear un reporte desde el móvil (o segunda pestaña) hace aparecer el incidente en el dashboard en < 1 s sin recargar.
- **RF-M3-04 · Ciclo de vida del incidente.** El operador cambia el estado (PENDIENTE → EN_PROCESO → ATENDIDO / DESCARTADO), asigna atención y el cambio queda auditado (tabla `auditoria`).
  - CA: el cambio de estado se refleja en el mapa, la lista y los KPIs; la auditoría registra usuario, acción y fecha.
- **RF-M3-05 · Emisión de alertas por sector.** Formulario de alerta: título, mensaje, nivel (INFORMATIVA/PRECAUCION/ALERTA/EMERGENCIA), sector/parroquia y validez; al emitirse se notifica vía WebSocket y aparece en el mapa y en un banner del módulo ciudadano.
  - CA: emitir "Alerta por desbordamiento del río Teaone — sectores sur" la muestra en pantalla en vivo y queda persistida.
- **RF-M3-06 · Diferenciación visual de fuentes (requisito oficial).** Badge de origen en cada incidente/alerta: REPORTE_CIUDADANO (azul, icono usuario), DATO_SIMULADO (gris con borde punteado, icono beaker/flask), ALERTA_OFICIAL (verde, icono shield-check). Tooltip con la leyenda institucional.
- **RF-M3-07 · Cronología de eventos.** Feed cronológico lateral con los últimos eventos (incidentes y alertas) con marca de tiempo relativa ("hace 4 min").

## MÓDULO M4 — RUTAS DE EVACUACIÓN Y ALBERGUES (SHOULD)

- **RF-M4-01 · Inventario de albergues en el mapa.** Puntos de albergue con icono hogar; popup con capacidad, ocupación, cupos libres y barra de ocupación con umbral: < 70% verde, 70-89% ámbar, >= 90% rojo "CRÍTICO".
  - CA: el Coliseo Municipal (96.5% con seed) se muestra rojo.
- **RF-M4-02 · Actualización de ocupación en vivo.** `PATCH /api/albergues/{id}/ocupacion` con delta +/-, validación transaccional de capacidad y broadcast `albergue_actualizado`.
  - CA: intentar exceder la capacidad devuelve 409 y no altera el dato; una asignación válida actualiza el mapa y el KPI en vivo.
- **RF-M4-03 · Albergue seguro más cercano.** `GET /api/albergues/cercanos?lat=&lng=`: ordena por distancia geodésica (`ST_Distance` sobre `::geography`), descarta LLENO/SATURADO/CERRADO y calcula `ruta_bloqueada=true` si el trazado recto hacia el albergue cruza el buffer de 150 m de una vía INTERRUMPIDA (`ST_Intersects(ST_Buffer(linea::geography,150), ...)`).
  - CA: para una familia en el barrio Portal del Río, el sistema sugiere albergues con cupo y marca la advertencia de vía bloqueada hacia los que cruzan la E20 interrumpida.
- **RF-M4-04 · Rutas de evacuación en el mapa.** Al aceptar una sugerencia, se traza la línea hacia el albergue (dashed verde); opcional COULD: geometría real con OpenRouteService `directions` usando `avoid_polygons` sobre las vías interrumpidas (S11).
- **RF-M4-05 · Estado de vías gestionable.** El operador puede cambiar `estado_transito` de una vía (PRECAUCIÓN/INTERRUMPIDA/OPERATIVA) con broadcast `via_actualizada`; el mapa recolorea la línea al instante.
- **RF-M4-06 · Servicios esenciales cercanos.** Búsqueda de servicios por tipo alrededor de una coordenada (radio configurable, default 3 km) con `ST_DWithin`.

## MÓDULO M5 — FAMILIAS AFECTADAS Y ASISTENCIA HUMANITARIA (SHOULD)

- **RF-M5-01 · Censo de familias.** Registro de familia: jefe/a de hogar, número de integrantes, necesidades prioritarias (checkboxes: AGUA, ALIMENTOS, MEDICINAS, ABRIGO, ASEO, EVACUACION), ubicación (GPS o selección en mapa), albergue asignado (opcional).
  - CA: crear una familia desde el mapa la geolocaliza y la suma al KPI de familias.
- **RF-M5-02 · Protección de datos personales (requisito oficial).** Los nombres se almacenan completos pero la API los devuelve enmascarados (ej. "Ana T.") para rol CIUDADANO y solo completos para OPERADOR_COE/ADMIN; el teléfono de contacto se devuelve enmascarado (09XXXX789). Documentar la referencia a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP).
  - CA: un token de ciudadano que consulte `/api/familias` recibe 403; el operador ve los datos enmascarados según regla; en la UI se explica el tratamiento.
- **RF-M5-03 · Inventario de suministros.** Tipos de ítem (KIT_ALIMENTOS, AGUA_POTABLE, KIT_MEDICINAS, KIT_ASEO) con stock y stock_reservado; movimientos auditados.
- **RF-M5-04 · Entregas transaccionales ACID.** `POST /api/entregas` registra la entrega a una familia, decrementa stock dentro de una transacción con `SELECT ... FOR UPDATE`; si el stock es insuficiente devuelve 409 y no escribe nada.
  - CA: dos entregas simultáneas de un stock limitado nunca dejan stock negativo (probar con dos peticiones concurrentes); el inventario y el historial quedan consistentes.
- **RF-M5-05 · Necesidades pendientes.** Vista de necesidades insatisfechas: familias con necesidades aún sin entrega asociada, agrupadas por tipo y sector, para despachar recursos.
  - CA: el seed deja 3 necesidades pendientes visibles.

## MÓDULO M6 — IA Y ANALÍTICA PREDICTIVA (COULD, 10 pts)

- **RF-M6-01 · Priorización automática de incidentes.** Modelo Scikit-learn (RandomForestClassifier) que asigna `score_prioridad` 0-100 a cada incidente con features: tipo de evento, gravedad reportada, personas afectadas, precipitación de las últimas 24 h (Open-Meteo), sector/zona de riesgo, hora del día y recurrencia histórica del sector. Justificación técnica obligatoria en docs/ (S12).
  - CA: el incidente "Familias atrapadas en Portal del Río" puntúa por encima de "daño menor de vivienda" y el orden del tablero refleja el score.
- **RF-M6-02 · Mapa de recurrencia por sector.** Clustering (KMeans o DBSCAN) sobre incidentes históricos sintéticos (etiquetados DATO_SIMULADO) + eventos documentados 2023-2024, renderizado como capa de calor (heatmap) o polígonos con `score_riesgo`.
  - CA: la capa muestra concentración en los barrios ribereños del Teaone, coherente con S02.
- **RF-M6-03 · Disclaimer experimental obligatorio.** Toda salida de IA muestra: "Resultado experimental con fines académicos. No constituye pronóstico oficial. Consulte los boletines del INAMHI y de la SNGR." (requisito del documento oficial del reto).
- **RF-M6-04 · Endpoint analítico.** `GET /api/analitica/prediccion-sectores` devuelve GeoJSON con score por zona; `POST /api/analitica/priorizar` recalcula scores de incidentes abiertos.

---

# SECCIÓN S05 — REQUISITOS NO FUNCIONALES (RNF)

| ID | Categoría | Requisito |
|---|---|---|
| RNF-01 | Rendimiento | API responde p95 < 300 ms en consultas listadas; mapa inicial < 3 s; actualización WebSocket < 1 s extremo a extremo. |
| RNF-02 | Escalabilidad razonable | Pool de conexiones SQLAlchemy configurado (pool_size 10, max_overflow 20); el sistema debe manejar 50 usuarios concurrentes en demo sin degradarse. |
| RNF-03 | Disponibilidad de demo | `docker compose up -d` levanta todo el stack (db + backend + frontend) sin pasos manuales; healthchecks incluidos. |
| RNF-04 | Compatibilidad | Chrome/Edge/Firefox/Safari en sus 2 últimas versiones; responsive de 360 px (móvil en campo) a 1920 px (COE). |
| RNF-05 | Accesibilidad | WCAG 2.1 AA: contraste >= 4.5:1 en textos, foco visible, labels en formularios, aria-labels en iconos decorativos, navegación por teclado. |
| RNF-06 | Usabilidad bajo estrés | El formulario de reporte se completa en < 60 s; estados visibles de conexión (En línea/Sin conexión/Sincronizando); confirmaciones y errores claros, sin jerga técnica. |
| RNF-07 | i18n | Español (es-EC); fechas dd/mm/aaaa, hora 24 h, zona `America/Guayaquil`; separador decimal punto. |
| RNF-08 | Seguridad | Definida exhaustivamente en S14 (JWT, RBAC, OWASP Top 10, cabeceras, CORS, rate limiting, ACID, LOPDP). |
| RNF-09 | Mantenibilidad | Arquitectura en capas con patrón Repository; tipado estricto en TypeScript; linting (ruff/eslint); migraciones con Alembic. |
| RNF-10 | Observabilidad | Logs estructurados JSON en backend (level, msg, req_id); tabla `auditoria` para acciones de negocio; healthcheck `GET /api/health`. |
| RNF-11 | Portabilidad | Todo el stack corre en contenedores Docker; sin dependencias de servicios de pago; APIs externas gratuitas con fallback si fallan. |
| RNF-12 | PWA | Manifest instalable, service worker con caché del shell de la aplicación (vite-plugin-pwa), modo offline del módulo M2 funcional tras el primer arranque. |

---
# SECCIÓN S06 — ARQUITECTURA DE SOFTWARE (ENTREGABLE OFICIAL N.º 2)

## 6.1. Estilo arquitectónico

Aplicación web **monolítica en 4 capas, contenedorizada**, coherente con el alcance de un prototipo de hackathon (regla de coherencia S03.4). El documento oficial del reto propone exactamente esta segmentación:

```
Capa 1: Clientes + Cartografía interactiva + Soporte offline
Capa 2: Seguridad (JWT/roles) + Comunicación en tiempo real (WebSockets)
Capa 3: Servicios backend (API REST) + Motor analítico e IA (Python/Scikit-learn)
Capa 4: Persistencia geoespacial (PostgreSQL/PostGIS) + Contenedores (Docker) + Fuentes oficiales (INAMHI/SNGR)
```

## 6.2. Diagrama de componentes (genera este diagrama Mermaid en docs/arquitectura.md)

```mermaid
flowchart TB
    subgraph C1["CAPA 1 · CLIENTES"]
        UI["Frontend SPA React 18 + TS (PWA)"]
        MAP["Visor Leaflet + OSM/Esri"]
        OFF["Cola offline IndexedDB + Service Worker"]
    end
    subgraph C2["CAPA 2 · SEGURIDAD Y TIEMPO REAL"]
        JWT["Emisión/validación JWT + RBAC"]
        WS["WebSocket /ws/operaciones"]
    end
    subgraph C3["CAPA 3 · SERVICIOS"]
        API["FastAPI REST (routers + services + repositories)"]
        IA["Motor analítico Scikit-learn (joblib)"]
        PROXY["Proxy de APIs externas (Open-Meteo, Nominatim, ORS)"]
    end
    subgraph C4["CAPA 4 · PERSISTENCIA E INFRA"]
        PG[("PostgreSQL 16 + PostGIS 3.4")]
        DOCKER["Docker Compose (db, backend, frontend)"]
        EXT["Fuentes externas gratuitas"]
    end
    UI -->|HTTPS JSON/GeoJSON| JWT
    UI -->|WSS| WS
    OFF -->|batch sync idempotente| API
    JWT --> API
    API --> PG
    IA --> API
    PROXY --> EXT
    WS --> UI
    API -->|broadcast| WS
    DOCKER --- PG
    DOCKER --- API
    DOCKER --- UI
```

## 6.3. Organización interna del backend (patrón Repository + capas)

```
backend/app/
├── main.py                 # App FastAPI, middlewares, routers, eventos de arranque
├── core/                   # config (pydantic-settings), seguridad (JWT/bcrypt), conexión BD
├── models/                 # ORM SQLAlchemy 2.0 + GeoAlchemy2 (tablas de S08)
├── schemas/                # Pydantic v2 (request/response DTOs)
├── repositories/           # Acceso a datos exclusivo (SQL/PostGIS aquí)
├── services/               # Lógica de negocio (valida, orquesta, emite eventos WS)
├── routers/                # Endpoints REST (delgados: validan y delegan en services)
├── ws/                     # ConnectionManager y broadcast de eventos
├── ml/                     # Entrenamiento, carga de modelo y scoring (Módulo M6)
└── seed.py                 # Usuarios demo (idempotente al arranque)
```

**Regla de dependencia:** router → service → repository → models. El repository es el único que habla SQL/PostGIS; el service el único que decide eventos de negocio; el router no contiene lógica. Esto es directamente evaluable por el jurado (criterio "Calidad de la arquitectura", 15 pts).

## 6.4. Flujo de información de punta a punta (el que debes demostrar en vivo)

1. El ciudadano completa el reporte (con o sin señal).
2. El frontend hace `POST /api/incidentes` (o lo encola en IndexedDB y sincroniza luego con `uuid_cliente`).
3. La API valida el token JWT y el payload (Pydantic), el service consulta con `ST_Within` en qué zona de riesgo cae el punto y lo adjunta.
4. El repository persiste en PostgreSQL/PostGIS dentro de una transacción.
5. El service emite broadcast WebSocket `incidente_creado` con el payload completo.
6. El dashboard COE y el mapa de todos los clientes conectados se actualizan en < 1 s.
7. El operador cambia el estado del incidente → evento `incidente_actualizado` + registro en `auditoria`.
8. El módulo IA recalcula `score_prioridad` del tablero (si M6 activo).

## 6.5. Decisiones de arquitectura (ADR resumidos — inclúyelos en la documentación técnica)

| # | Decisión | Alternativa descartada | Justificación |
|---|---|---|---|
| ADR-1 | Monolito en capas con Docker Compose | Microservicios | Coherencia con alcance y tiempo (regla oficial del jurado); menos superficie de fallo en demo. |
| ADR-2 | FastAPI + SQLAlchemy async | NestJS/Express | Un solo lenguaje en backend e IA (Scikit-learn); WebSockets nativos; validación Pydantic; rendimiento. |
| ADR-3 | WebSocket nativo de FastAPI | Socket.IO/MQTT | Menos dependencias; el navegador lo soporta nativamente; suficiente para broadcast. |
| ADR-4 | IndexedDB + cola con uuid | Service Worker background sync puro | Compatibilidad amplia, control total del flujo y sincronización idempotente demostrable. |
| ADR-5 | PostGIS para toda la lógica espacial | Cálculo de distancias en el cliente | El reto recomienda expresamente PostGIS; permite ST_Within/ST_Distance/ST_Buffer server-side. |
| ADR-6 | Proxy backend para APIs externas | Llamadas directas desde el frontend | Evita CORS y filtrado de API keys en cliente; permite cachear y aplicar rate limit centralizado (S14-A10 SSRF). |

---

# SECCIÓN S07 — STACK TECNOLÓGICO FIJADO Y JUSTIFICADO (NO NEGOCIABLE)

## 7.1. Matriz de tecnologías con versiones objetivo

| Componente | Tecnología y versión | Rol en la solución |
|---|---|---|
| Contenedores | Docker Engine 24+ / Docker Compose v2 | Orquestación de db + backend + frontend |
| Base de datos | **PostgreSQL 16 + PostGIS 3.4** (imagen `postgis/postgis:16-3.4`) | Persistencia y motor geoespacial (SRID 4326) |
| Backend | **Python 3.11+ / FastAPI 0.115+ / Uvicorn[standard]** | API REST + WebSockets |
| ORM | **SQLAlchemy 2.0 (async, driver asyncpg) + GeoAlchemy2 + Alembic** | Mapeo objeto-relacional y migraciones (uso de ORM es obligatorio) |
| Validación | Pydantic v2 + pydantic-settings | DTOs, settings tipados |
| Seguridad | PyJWT + passlib[bcrypt] + slowapi | JWT, hash de contraseñas, rate limiting |
| Cliente HTTP | httpx | Proxy a APIs externas con caché |
| Frontend | **React 18 + Vite 5 + TypeScript 5 (strict)** | SPA de escritorio y móvil |
| Mapas | **Leaflet 1.9 + react-leaflet 4** + OpenStreetMap + Esri World Imagery | Visor geográfico interactivo |
| Estilos | TailwindCSS 3.4 (con CSS variables para tema) | Design system S13 |
| Iconos | **lucide-react** (SVG) | Iconografía exclusiva (S01-2) |
| Estado/datos | Zustand (estado UI) + TanStack Query v5 (servidor) | Gestión de estado y caché de datos |
| Formularios | react-hook-form + zod | Validación en cliente espejo de Pydantic |
| Offline | idb (IndexedDB) + vite-plugin-pwa | Cola de reportes + PWA instalable |
| Gráficas | recharts | KPIs y analítica |
| IA | scikit-learn 1.5+, pandas, joblib | Priorización y clustering (M6) |
| Pruebas | pytest (backend) + Vitest (frontend) | Smoke tests del escenario (S18) |

## 7.2. Justificación ante el jurado (párrafo listo para la documentación técnica)

> "Seleccionamos FastAPI por su rendimiento (asíncrono nativo), su validación estricta con Pydantic y porque unifica el lenguaje del backend con el módulo de IA en Scikit-learn, reduciendo la fricción de integración; React 18 con TypeScript estricto por su ecosistema y tipado seguro en un desarrollo de tiempo acotado; PostgreSQL con PostGIS porque el documento oficial del reto lo recomienda expresamente para consultas espaciales (`ST_Within`, `ST_Distance`, `ST_Buffer`) sobre geometrías WGS84; Leaflet con OpenStreetMap por ser ligero, gratuito y sin dependencias de API keys; Docker Compose para garantizar reproducibilidad del entorno en cualquier máquina del jurado; y WebSockets nativos para actualización en tiempo real del Centro de Operaciones. Todas las APIs externas consumidas son gratuitas (Open-Meteo, Nominatim, Overpass, OpenRouteService) y se proxyan desde el backend para no exponer credenciales en el cliente."

---
# SECCIÓN S08 — MODELO DE DATOS POSTGIS COMPLETO (ENTREGABLES OFICIALES N.º 3 Y N.º 4)

Implementa este esquema en `database/01_schema_postgis.sql`. Es una extensión del esquema didáctico oficial del reto: conserva sus tablas y restricciones base, y añade lo necesario para los 6 módulos (usuarios, servicios esenciales, inventario, entregas, alertas, auditoría, idempotencia offline).

## 8.1. DDL completo (ejecutable tal cual)

```sql
-- ============================================================
-- ESMERALDAS RESILIENTE 2026 · Esquema geoespacial (SRID 4326)
-- PostgreSQL 16 + PostGIS 3.4 · database/01_schema_postgis.sql
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------- SEGURIDAD Y USUARIOS ----------
CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20) NOT NULL CHECK (rol IN ('CIUDADANO','OPERADOR_COE','ADMIN')),
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- MÓDULO M1 · GIS Y RIESGOS ----------
CREATE TABLE zonas_riesgo (
    id             SERIAL PRIMARY KEY,
    nombre_sector  VARCHAR(150) NOT NULL,
    parroquia      VARCHAR(80),
    tipo_amenaza   VARCHAR(60) NOT NULL CHECK (tipo_amenaza IN ('INUNDACION','DESLIZAMIENTO','DESBORDAMIENTO_RIO')),
    nivel_riesgo   VARCHAR(30) NOT NULL CHECK (nivel_riesgo IN ('BAJO','MEDIO','ALTO','CRITICO')),
    descripcion    TEXT,
    fuente_dato    VARCHAR(120) DEFAULT 'DATO_SIMULADO',
    poligono_geom  GEOMETRY(Polygon, 4326) NOT NULL,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE infraestructura_vial (
    id              SERIAL PRIMARY KEY,
    nombre_via      VARCHAR(150) NOT NULL,
    categoria       VARCHAR(40) DEFAULT 'URBANA' CHECK (categoria IN ('TRONCAL','PROVINCIAL','URBANA','PASARELA')),
    estado_transito VARCHAR(30) NOT NULL CHECK (estado_transito IN ('OPERATIVA','PRECAUCION','INTERRUMPIDA')),
    detalle_estado  TEXT,
    linea_geom      GEOMETRY(LineString, 4326) NOT NULL
);

CREATE TABLE hidrografia (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    tipo        VARCHAR(30) NOT NULL CHECK (tipo IN ('RIO','ESTERO')),
    linea_geom  GEOMETRY(LineString, 4326) NOT NULL
);

CREATE TABLE servicios_esenciales (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(150) NOT NULL,
    tipo_servicio  VARCHAR(40) NOT NULL CHECK (tipo_servicio IN ('SALUD','SEGURIDAD','BOMBEROS','ABASTECIMIENTO','EDUCACION')),
    direccion      VARCHAR(200),
    telefono       VARCHAR(30),
    ubicacion_geom GEOMETRY(Point, 4326) NOT NULL
);

-- ---------- MÓDULO M3/M4 · INCIDENTES, ALERTAS Y ALBERGUES ----------
CREATE TABLE incidentes_emergencia (
    id                SERIAL PRIMARY KEY,
    uuid_cliente      UUID UNIQUE,                    -- idempotencia de sincronización offline (M2)
    fuente_origen     VARCHAR(40) NOT NULL CHECK (fuente_origen IN ('REPORTE_CIUDADANO','DATO_SIMULADO','ALERTA_OFICIAL')),
    tipo_evento       VARCHAR(80) NOT NULL,
    gravedad          VARCHAR(20) NOT NULL CHECK (gravedad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    estado            VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (estado IN ('PENDIENTE','EN_PROCESO','ATENDIDO','DESCARTADO')),
    personas_afectadas INT NOT NULL DEFAULT 0,
    descripcion       TEXT,
    foto_url          VARCHAR(500),
    zona_riesgo_id    INT REFERENCES zonas_riesgo(id),
    verificado        BOOLEAN NOT NULL DEFAULT FALSE,
    score_ia          NUMERIC(5,2),                   -- priorización Módulo M6
    reportado_por     INT REFERENCES usuarios(id),
    ubicacion_geom    GEOMETRY(Point, 4326) NOT NULL,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE albergues (
    id                SERIAL PRIMARY KEY,
    nombre_albergue   VARCHAR(150) NOT NULL,
    direccion         VARCHAR(200),
    responsable       VARCHAR(120),
    telefono          VARCHAR(30),
    capacidad_maxima  INT NOT NULL CHECK (capacidad_maxima > 0),
    ocupacion_actual  INT NOT NULL DEFAULT 0 CHECK (ocupacion_actual >= 0),
    estado            VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE'
                      CHECK (estado IN ('DISPONIBLE','CASI_LLENO','LLENO','CERRADO')),
    servicios         TEXT[] DEFAULT '{}',            -- ej. {AGUA,ELECTRICIDAD,LETRINAS}
    ubicacion_geom    GEOMETRY(Point, 4326) NOT NULL
);

CREATE TABLE alertas (
    id            SERIAL PRIMARY KEY,
    titulo        VARCHAR(180) NOT NULL,
    mensaje       TEXT NOT NULL,
    nivel         VARCHAR(20) NOT NULL CHECK (nivel IN ('INFORMATIVA','PRECAUCION','ALERTA','EMERGENCIA')),
    sector        VARCHAR(120),
    fuente        VARCHAR(60) NOT NULL DEFAULT 'OPERADOR_COE',
    activa        BOOLEAN NOT NULL DEFAULT TRUE,
    emitida_por   INT REFERENCES usuarios(id),
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- MÓDULO M5 · FAMILIAS Y ASISTENCIA ----------
CREATE TABLE familias_afectadas (
    id                   SERIAL PRIMARY KEY,
    jefe_hogar           VARCHAR(150) NOT NULL,        -- se enmascara en la API (LOPDP)
    telefono_contacto    VARCHAR(30),
    numero_integrantes   INT NOT NULL CHECK (numero_integrantes > 0),
    necesidades_prioritarias TEXT[] DEFAULT '{}',      -- {AGUA,ALIMENTOS,MEDICINAS,ABRIGO,ASEO,EVACUACION}
    albergue_asignado_id INT REFERENCES albergues(id),
    estado               VARCHAR(30) NOT NULL DEFAULT 'REGISTRADA'
                         CHECK (estado IN ('REGISTRADA','EVACUADA','ALBERGADA','ATENDIDA')),
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ubicacion_geom       GEOMETRY(Point, 4326) NOT NULL
);

CREATE TABLE inventario_suministros (
    id              SERIAL PRIMARY KEY,
    tipo_item       VARCHAR(40) NOT NULL UNIQUE CHECK (tipo_item IN ('KIT_ALIMENTOS','AGUA_POTABLE','KIT_MEDICINAS','KIT_ASEO')),
    descripcion     VARCHAR(200),
    stock           INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_reservado INT NOT NULL DEFAULT 0 CHECK (stock_reservado >= 0)
);

CREATE TABLE entregas_asistencia (
    id            SERIAL PRIMARY KEY,
    familia_id    INT NOT NULL REFERENCES familias_afectadas(id),
    inventario_id INT NOT NULL REFERENCES inventario_suministros(id),
    cantidad      INT NOT NULL CHECK (cantidad > 0),
    estado        VARCHAR(20) NOT NULL DEFAULT 'ENTREGADA'
                  CHECK (estado IN ('ENTREGADA','EN_TRANSITO','CANCELADA')),
    entregado_por INT REFERENCES usuarios(id),
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- AUDITORÍA (S14) ----------
CREATE TABLE auditoria (
    id           BIGSERIAL PRIMARY KEY,
    usuario_id   INT REFERENCES usuarios(id),
    accion       VARCHAR(60) NOT NULL,      -- INCIDENTE_ESTADO_CAMBIADO, ALBERGUE_OCUPACION, ENTREGA_REGISTRADA...
    entidad      VARCHAR(60) NOT NULL,
    entidad_id   INT,
    detalle      JSONB,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- ÍNDICES (rendimiento y búsquedas espaciales) ----------
CREATE INDEX idx_zonas_riesgo_geom      ON zonas_riesgo USING GIST (poligono_geom);
CREATE INDEX idx_hidrografia_geom       ON hidrografia USING GIST (linea_geom);
CREATE INDEX idx_vias_geom              ON infraestructura_vial USING GIST (linea_geom);
CREATE INDEX idx_servicios_geom         ON servicios_esenciales USING GIST (ubicacion_geom);
CREATE INDEX idx_incidentes_geom        ON incidentes_emergencia USING GIST (ubicacion_geom);
CREATE INDEX idx_albergues_geom         ON albergues USING GIST (ubicacion_geom);
CREATE INDEX idx_familias_geom          ON familias_afectadas USING GIST (ubicacion_geom);
CREATE INDEX idx_incidentes_estado      ON incidentes_emergencia (estado, gravedad);
CREATE INDEX idx_incidentes_creado      ON incidentes_emergencia (creado_en DESC);
CREATE INDEX idx_alertas_activa         ON alertas (activa, creado_en DESC);

-- ---------- VISTA ÚTIL: resumen de ocupación de albergues ----------
CREATE OR REPLACE VIEW vw_albergues_ocupacion AS
SELECT a.id, a.nombre_albergue, a.capacidad_maxima, a.ocupacion_actual,
       (a.capacidad_maxima - a.ocupacion_actual) AS cupos_libres,
       ROUND(100.0 * a.ocupacion_actual / NULLIF(a.capacidad_maxima,0), 1) AS porcentaje_ocupacion,
       CASE
         WHEN 100.0 * a.ocupacion_actual / NULLIF(a.capacidad_maxima,0) >= 90 THEN 'CRITICO'
         WHEN 100.0 * a.ocupacion_actual / NULLIF(a.capacidad_maxima,0) >= 70 THEN 'ALTO'
         ELSE 'NORMAL'
       END AS semaforo
FROM albergues a;
```

## 8.2. Diagrama Entidad-Relación (entregable N.º 3 — genera también la imagen desde pgAdmin/DBeaver)

```mermaid
erDiagram
    usuarios ||--o{ incidentes_emergencia : reporta
    usuarios ||--o{ alertas : emite
    usuarios ||--o{ entregas_asistencia : registra
    usuarios ||--o{ auditoria : genera
    zonas_riesgo ||--o{ incidentes_emergencia : "contiene (ST_Within)"
    albergues ||--o{ familias_afectadas : aloja
    albergues ||--o{ incidentes_emergencia : "ubica (referencia lógica)"
    familias_afectadas ||--o{ entregas_asistencia : recibe
    inventario_suministros ||--o{ entregas_asistencia : "descuenta stock (ACID)"
    usuarios {
        int id PK
        varchar email UK
        varchar rol "CIUDADANO | OPERADOR_COE | ADMIN"
        varchar password_hash
    }
    zonas_riesgo {
        int id PK
        varchar nombre_sector
        varchar tipo_amenaza
        varchar nivel_riesgo
        geometry poligono_geom "Polygon 4326"
    }
    infraestructura_vial {
        int id PK
        varchar nombre_via
        varchar estado_transito
        geometry linea_geom "LineString 4326"
    }
    incidentes_emergencia {
        int id PK
        uuid uuid_cliente UK "idempotencia offline"
        varchar fuente_origen
        varchar tipo_evento
        varchar gravedad
        varchar estado
        int personas_afectadas
        numeric score_ia
        geometry ubicacion_geom "Point 4326"
    }
    albergues {
        int id PK
        varchar nombre_albergue
        int capacidad_maxima
        int ocupacion_actual
        geometry ubicacion_geom "Point 4326"
    }
    familias_afectadas {
        int id PK
        varchar jefe_hogar "enmascarado por LOPDP"
        int numero_integrantes
        text necesidades
        geometry ubicacion_geom "Point 4326"
    }
    inventario_suministros {
        int id PK
        varchar tipo_item UK
        int stock
    }
    entregas_asistencia {
        int id PK
        int familia_id FK
        int inventario_id FK
        int cantidad
    }
    alertas {
        int id PK
        varchar titulo
        varchar nivel
        boolean activa
    }
    auditoria {
        bigserial id PK
        varchar accion
        jsonb detalle
    }
```

## 8.3. Diccionario de datos esencial (inclúyelo en la documentación técnica)

| Tabla | Propósito | Campos geográficos | Módulo |
|---|---|---|---|
| `usuarios` | Autenticación y roles RBAC | — | Transversal (S14) |
| `zonas_riesgo` | Polígonos de vulnerabilidad por semáforo | `poligono_geom GEOMETRY(Polygon,4326)` | M1 |
| `hidrografia` | Ríos y esteros (Esmeraldas, Teaone) | `linea_geom GEOMETRY(LineString,4326)` | M1 |
| `infraestructura_vial` | Vías y estado de tránsito | `linea_geom GEOMETRY(LineString,4326)` | M1/M4 |
| `servicios_esenciales` | Salud, seguridad, abastecimiento | `ubicacion_geom GEOMETRY(Point,4326)` | M1/M4 |
| `incidentes_emergencia` | Eventos de emergencia con trazabilidad de fuente y idempotencia offline | `ubicacion_geom GEOMETRY(Point,4326)` | M2/M3/M6 |
| `albergues` | Capacidad y ocupación en vivo | `ubicacion_geom GEOMETRY(Point,4326)` | M4 |
| `alertas` | Alertas oficiales/sectoriales | — | M3 |
| `familias_afectadas` | Censo familiar con datos protegidos | `ubicacion_geom GEOMETRY(Point,4326)` | M5 |
| `inventario_suministros` | Stock de kits y suministros | — | M5 |
| `entregas_asistencia` | Entregas transaccionales con auditoría | — | M5 |
| `auditoria` | Pista de auditoría de acciones críticas | — | Seguridad |

**Nota de diseño:** `uuid_cliente` garantiza que la sincronización offline sea idempotente (un mismo reporte nunca se duplica aunque el cliente reintenté); `score_ia` es calculado por el módulo M6; la vista `vw_albergues_ocupacion` alimenta los KPIs del COE.

---
# SECCIÓN S09 — DATOS SEMILLA GEORREFERENCIADOS (ESCENARIO COMPLETO LISTO PARA DEMO)

Implementa este archivo en `database/02_seed_escenario_06am.sql`. Debe poder ejecutarse N veces sin duplicar (usa `ON CONFLICT`/truncate controlado). Contexto de los datos: **jueves 5 de noviembre de 2026, 06:00** (la madrugada del escenario oficial, horas antes del inicio del hackathon), con la alerta roja nacional por El Niño vigente (S02).

**Notas de honestidad de los datos (decláralas en docs/):** los barrios, ríos, parroquias y cifras de contexto son reales (S02). Los polígonos son aproximaciones didácticas alrededor de barrios reales documentados en prensa; las coordenadas del Hospital Delfina Torres, del campus UTLVTE y de la terminal terrestre son reales de OpenStreetMap (atribución: © OpenStreetMap contributors). Los nombres de las familias del censo son **ficticios** y su `fuente_origen` correspondiente es `DATO_SIMULADO`.

```sql
-- ============================================================
-- ESMERALDAS RESILIENTE 2026 · Datos semilla del escenario
-- "Jueves, 06:00 AM" · database/02_seed_escenario_06am.sql
-- Ejecutar DESPUÉS de 01_schema_postgis.sql
-- ============================================================

TRUNCATE TABLE auditoria, entregas_asistencia, inventario_suministros,
  familias_afectadas, alertas, incidentes_emergencia, albergues,
  servicios_esenciales, hidrografia, infraestructura_vial, zonas_riesgo
RESTART IDENTITY CASCADE;

-- ---------- HIDROGRAFÍA (trazados simplificados de referencia) ----------
INSERT INTO hidrografia (nombre, tipo, linea_geom) VALUES
('Río Esmeraldas', 'RIO',
 ST_GeomFromText('LINESTRING(-79.6420 0.9300, -79.6330 0.9600, -79.6180 0.9850, -79.6000 0.9990)', 4326)),
('Río Teaone', 'RIO',
 ST_GeomFromText('LINESTRING(-79.7350 0.8700, -79.7150 0.9050, -79.6900 0.9200, -79.6680 0.9280, -79.6500 0.9400)', 4326));

-- ---------- ZONAS DE RIESGO (polígonos aproximados sobre barrios reales) ----------
INSERT INTO zonas_riesgo (nombre_sector, parroquia, tipo_amenaza, nivel_riesgo, descripcion, fuente_dato, poligono_geom) VALUES
('Barrio 50 Casas y ribera del Teaone', 'Luis Tello', 'DESBORDAMIENTO_RIO', 'CRITICO',
 'Sector ribereño del sur, inundado de forma recurrente por el Teaone (jun-2023 y ene-2024).',
 'PRENSA_VERIFICADA',
 ST_GeomFromText('POLYGON((-79.6740 0.9370, -79.6740 0.9490, -79.6620 0.9490, -79.6620 0.9370, -79.6740 0.9370))', 4326)),
('Barrio 24 de Mayo', 'Luis Tello', 'INUNDACION', 'ALTO',
 'Barrio del suroccidente de la ciudad, entre los afectados por el desborde del Teaone de enero de 2024.',
 'PRENSA_VERIFICADA',
 ST_GeomFromText('POLYGON((-79.6690 0.9440, -79.6690 0.9530, -79.6590 0.9530, -79.6590 0.9440, -79.6690 0.9440))', 4326)),
('Barrio Los Mangos', 'Luis Tello', 'INUNDACION', 'ALTO',
 'Zona baja contigua a 24 de Mayo, con antecedentes de inundación urbana.',
 'PRENSA_VERIFICADA',
 ST_GeomFromText('POLYGON((-79.6745 0.9440, -79.6745 0.9510, -79.6670 0.9510, -79.6670 0.9440, -79.6745 0.9440))', 4326)),
('Barrio La Propicia', 'Luis Tello', 'INUNDACION', 'ALTO',
 'Sector occidental con evacuaciones preventivas documentadas ante crecidas del Teaone.',
 'PRENSA_VERIFICADA',
 ST_GeomFromText('POLYGON((-79.6770 0.9490, -79.6770 0.9580, -79.6680 0.9580, -79.6680 0.9490, -79.6770 0.9490))', 4326)),
('Barrio Portal del Río (acceso sur)', 'Luis Tello', 'DESBORDAMIENTO_RIO', 'ALTO',
 'Barrio de la vía de acceso sur, junto al puente sobre el Teaone; familias evacuadas en 2024.',
 'PRENSA_VERIFICADA',
 ST_GeomFromText('POLYGON((-79.6810 0.9340, -79.6810 0.9420, -79.6720 0.9420, -79.6720 0.9340, -79.6810 0.9340))', 4326)),
('Isla Luis Vargas Torres', 'Esmeraldas', 'DESBORDAMIENTO_RIO', 'ALTO',
 'Isla del río Esmeraldas, inundada en los eventos de crecida documentados.',
 'PRENSA_VERIFICADA',
 ST_GeomFromText('POLYGON((-79.6330 0.9750, -79.6330 0.9890, -79.6170 0.9890, -79.6170 0.9750, -79.6330 0.9750))', 4326)),
('Sector Las Palmas', 'Simón Plata Torres', 'INUNDACION', 'MEDIO',
 'Sector al norte del río Esmeraldas, expuesto a crecidas y lluvias intensas.',
 'DATO_SIMULADO',
 ST_GeomFromText('POLYGON((-79.6530 0.9770, -79.6530 0.9910, -79.6390 0.9910, -79.6390 0.9770, -79.6530 0.9770))', 4326)),
('Centro y Malecón (parroquia Esmeraldas)', 'Esmeraldas', 'INUNDACION', 'MEDIO',
 'Zona baja del centro histórico junto al malecón del río Esmeraldas.',
 'DATO_SIMULADO',
 ST_GeomFromText('POLYGON((-79.6580 0.9590, -79.6580 0.9710, -79.6460 0.9710, -79.6460 0.9590, -79.6580 0.9590))', 4326)),
('Laderas vía E20 (parroquia Vuelta Larga)', 'Vuelta Larga', 'DESLIZAMIENTO', 'ALTO',
 'Tramo de ladera susceptible a deslizamientos que interrumpen la vía a Quinindé.',
 'DATO_SIMULADO',
 ST_GeomFromText('POLYGON((-79.6990 0.9140, -79.6990 0.9260, -79.6830 0.9260, -79.6830 0.9140, -79.6990 0.9140))', 4326));

-- ---------- INFRAESTRUCTURA VIAL ----------
INSERT INTO infraestructura_vial (nombre_via, categoria, estado_transito, detalle_estado, linea_geom) VALUES
('Vía E20 Esmeraldas - Quinindé (tramo Vuelta Larga)', 'TRONCAL', 'INTERRUMPIDA',
 'Deslizamiento de tierra en la madrugada del jueves bloquea ambos carriles; equipo de maquinaria en camino.',
 ST_GeomFromText('LINESTRING(-79.6729 0.9323, -79.6900 0.9250, -79.7100 0.9150)', 4326)),
('Vía E15 Ruta del Spondylus (Esmeraldas - Atacames)', 'TRONCAL', 'PRECAUCION',
 'Lluvia persistente y visibilidad reducida; tránsito con precaución.',
 ST_GeomFromText('LINESTRING(-79.6540 0.9765, -79.6620 0.9950, -79.6850 1.0200)', 4326)),
('Avenida Libertad (eje urbano)', 'URBANA', 'OPERATIVA',
 'Eje principal norte-sur operativo con acumulación de agua en cunetas.',
 ST_GeomFromText('LINESTRING(-79.6729 0.9323, -79.6630 0.9530, -79.6541 0.9765)', 4326)),
('Acceso sur y puente sobre el río Teaone', 'PROVINCIAL', 'PRECAUCION',
 'Caudal crecido del Teaone; tránsito restringido a vehículos livianos.',
 ST_GeomFromText('LINESTRING(-79.6710 0.9380, -79.6660 0.9430)', 4326)),
('Vía Esmeraldas - San Mateo', 'PROVINCIAL', 'OPERATIVA',
 'Vía rural operativa, uso como ruta alterna hacia el suroccidente.',
 ST_GeomFromText('LINESTRING(-79.6600 0.9400, -79.6450 0.9150, -79.6300 0.8900)', 4326));

-- ---------- ALBERGUES TEMPORALES ----------
INSERT INTO albergues (nombre_albergue, direccion, responsable, telefono, capacidad_maxima, ocupacion_actual, estado, servicios, ubicacion_geom) VALUES
('Coliseo Municipal de Esmeraldas', 'Centro, parroquia Esmeraldas', 'GAD Municipal de Esmeraldas', '0990000001', 400, 386, 'CASI_LLENO',
 ARRAY['AGUA','ELECTRICIDAD','LETRINAS','AREA_INFANTIL'],
 ST_SetSRID(ST_MakePoint(-79.6550, 0.9650), 4326)),
('Unidad Educativa 5 de Agosto', 'Parroquia 5 de Agosto', 'GAD Municipal de Esmeraldas', '0990000002', 300, 145, 'DISPONIBLE',
 ARRAY['AGUA','ELECTRICIDAD','LETRINAS'],
 ST_SetSRID(ST_MakePoint(-79.6630, 0.9600), 4326)),
('Escuela Bartolomé Ruiz', 'Parroquia Bartolomé Ruiz', 'GAD Municipal de Esmeraldas', '0990000003', 250, 80, 'DISPONIBLE',
 ARRAY['AGUA','ELECTRICIDAD'],
 ST_SetSRID(ST_MakePoint(-79.6600, 0.9705), 4326)),
('Aula Magna UTLVTE (Campus Puerto Balao)', 'Campus UTLVTE Puerto Balao', 'UTLVTE', '0990000004', 600, 210, 'DISPONIBLE',
 ARRAY['AGUA','ELECTRICIDAD','LETRINAS','COMEDOR'],
 ST_SetSRID(ST_MakePoint(-79.665838, 0.974110), 4326)),
('Centro Comunitario de San Mateo', 'Parroquia rural San Mateo', 'Junta Parroquial de San Mateo', '0990000005', 150, 12, 'DISPONIBLE',
 ARRAY['AGUA'],
 ST_SetSRID(ST_MakePoint(-79.6400, 0.9050), 4326));

-- ---------- SERVICIOS ESENCIALES ----------
INSERT INTO servicios_esenciales (nombre, tipo_servicio, direccion, telefono, ubicacion_geom) VALUES
('Hospital Delfina Torres de Concha', 'SALUD', 'Avenida Libertad', '0990000010',
 ST_SetSRID(ST_MakePoint(-79.654089, 0.976560), 4326)),
('Cuerpo de Bomberos de Esmeraldas', 'BOMBEROS', 'Avenida Libertad, centro', '0990000011',
 ST_SetSRID(ST_MakePoint(-79.6570, 0.9630), 4326)),
('Unidad de Policía Comunitaria del Centro', 'SEGURIDAD', 'Centro, parroquia Esmeraldas', '0990000012',
 ST_SetSRID(ST_MakePoint(-79.6530, 0.9660), 4326)),
('Mercado Municipal Central', 'ABASTECIMIENTO', 'Centro, parroquia Esmeraldas', '0990000013',
 ST_SetSRID(ST_MakePoint(-79.6560, 0.9640), 4326)),
('Campus UTLVTE Puerto Balao', 'EDUCACION', 'Vía Puerto Balao', '0990000014',
 ST_SetSRID(ST_MakePoint(-79.665838, 0.974110), 4326));

-- ---------- INCIDENTES DEL ESCENARIO "JUEVES 06:00 AM" ----------
INSERT INTO incidentes_emergencia
(uuid_cliente, fuente_origen, tipo_evento, gravedad, estado, personas_afectadas, descripcion, ubicacion_geom, creado_en) VALUES
(GEN_RANDOM_UUID(), 'ALERTA_OFICIAL', 'AVISO_METEOROLOGICO', 'ALTA', 'EN_PROCESO', 0,
 'INAMHI, Advertencia Meteorologica No. 86: lluvias fuertes, tormentas electricas y posibles desbordamientos en la provincia de Esmeraldas. Vigencia regional.',
 ST_SetSRID(ST_MakePoint(-79.6539, 0.9592), 4326), '2026-11-05 06:00:00-05'),
(GEN_RANDOM_UUID(), 'REPORTE_CIUDADANO', 'INUNDACION_URBANA', 'CRITICA', 'PENDIENTE', 85,
 'El agua ingreso a las viviendas del barrio 50 Casas despues de la crecida del rio Teaone. Se reporta nivel cercano a un metro en las calles.',
 ST_SetSRID(ST_MakePoint(-79.6680, 0.9430), 4326), '2026-11-05 06:05:00-05'),
(GEN_RANDOM_UUID(), 'REPORTE_CIUDADANO', 'DESLIZAMIENTO_TIERRA', 'ALTA', 'PENDIENTE', 0,
 'Deslizamiento de tierra bloquea la via a Quinde en el tramo Vuelta Larga. Material sobre la calzada en al menos 40 metros.',
 ST_SetSRID(ST_MakePoint(-79.6905, 0.9200), 4326), '2026-11-05 06:10:00-05'),
(GEN_RANDOM_UUID(), 'DATO_SIMULADO', 'DESBORDAMIENTO_RIO', 'CRITICA', 'EN_PROCESO', 120,
 'Desborde del rio Teaone afecta a comunidades de la parroquia rural Vuelta Larga; conectividad de telefonía móvil intermitente.',
 ST_SetSRID(ST_MakePoint(-79.7000, 0.9120), 4326), '2026-11-05 06:12:00-05'),
(GEN_RANDOM_UUID(), 'REPORTE_CIUDADANO', 'PERSONAS_ATRAPADAS', 'CRITICA', 'PENDIENTE', 23,
 'Familias atrapadas en el sector Portal del Rio piden evacuacion inmediata; el agua rodea las viviendas.',
 ST_SetSRID(ST_MakePoint(-79.6760, 0.9380), 4326), '2026-11-05 06:15:00-05'),
(GEN_RANDOM_UUID(), 'DATO_SIMULADO', 'ALBERGUE_SATURACION', 'ALTA', 'EN_PROCESO', 386,
 'El Coliseo Municipal, albergue temporal, alcanza el 96.5 por ciento de su capacidad (386 de 400). Se requiere redireccionar nuevos evacuados.',
 ST_SetSRID(ST_MakePoint(-79.6550, 0.9650), 4326), '2026-11-05 06:20:00-05'),
(GEN_RANDOM_UUID(), 'REPORTE_CIUDADANO', 'SOLICITUD_SUMINISTROS', 'ALTA', 'PENDIENTE', 386,
 'Solicitud urgente de agua potable, alimentos y medicinas para los albergados del Coliseo Municipal.',
 ST_SetSRID(ST_MakePoint(-79.6550, 0.9650), 4326), '2026-11-05 06:25:00-05'),
(GEN_RANDOM_UUID(), 'REPORTE_CIUDADANO', 'INUNDACION_URBANA', 'MEDIA', 'ATENDIDO', 12,
 'Anegamiento moderado en calles del barrio Los Mangos; agua acumulada en cunetas y patios.',
 ST_SetSRID(ST_MakePoint(-79.6700, 0.9470), 4326), '2026-11-05 06:30:00-05');

-- Actualiza la zona de riesgo asociada por contención espacial (ST_Within)
UPDATE incidentes_emergencia i
SET zona_riesgo_id = z.id
FROM zonas_riesgo z
WHERE ST_Within(i.ubicacion_geom, z.poligono_geom);

-- ---------- FAMILIAS AFECTADAS (nombres ficticios · datos simulados) ----------
INSERT INTO familias_afectadas (jefe_hogar, telefono_contacto, numero_integrantes, necesidades_prioritarias, albergue_asignado_id, estado, ubicacion_geom) VALUES
('Ana Torres', '0991112223', 5, ARRAY['AGUA','ALIMENTOS'], 1, 'ALBERGADA',
 ST_SetSRID(ST_MakePoint(-79.6762, 0.9382), 4326)),
('Pedro Saltos', '0991112224', 4, ARRAY['EVACUACION','AGUA'], NULL, 'REGISTRADA',
 ST_SetSRID(ST_MakePoint(-79.6678, 0.9432), 4326)),
('Lucía Quiñónez', '0991112225', 6, ARRAY['MEDICINAS','AGUA'], NULL, 'REGISTRADA',
 ST_SetSRID(ST_MakePoint(-79.6638, 0.9492), 4326)),
('Jorge Valdez', '0991112226', 3, ARRAY['ALIMENTOS'], 2, 'ALBERGADA',
 ST_SetSRID(ST_MakePoint(-79.6718, 0.9532), 4326)),
('Rosa Cabezas', '0991112227', 7, ARRAY['AGUA','ALIMENTOS','MEDICINAS'], NULL, 'EVACUADA',
 ST_SetSRID(ST_MakePoint(-79.6990, 0.9130), 4326)),
('Marcos Angulo', '0991112228', 4, ARRAY['ABRIGO'], 4, 'ALBERGADA',
 ST_SetSRID(ST_MakePoint(-79.6702, 0.9472), 4326));

-- ---------- INVENTARIO Y ENTREGAS ----------
INSERT INTO inventario_suministros (tipo_item, descripcion, stock, stock_reservado) VALUES
('KIT_ALIMENTOS', 'Kit de alimentos secos para familia (5 dias)', 320, 0),
('AGUA_POTABLE', 'Bidones de agua potable 20 litros', 480, 0),
('KIT_MEDICINAS', 'Kit de primeros auxilios y medicinas basicas', 150, 0),
('KIT_ASEO', 'Kit de higiene y aseo personal familiar', 200, 0);

INSERT INTO entregas_asistencia (familia_id, inventario_id, cantidad, estado, creado_en) VALUES
(1, 2, 2, 'ENTREGADA', '2026-11-05 06:40:00-05'),
(1, 1, 1, 'ENTREGADA', '2026-11-05 06:42:00-05');
UPDATE inventario_suministros SET stock = stock - 2 WHERE tipo_item = 'AGUA_POTABLE';
UPDATE inventario_suministros SET stock = stock - 1 WHERE tipo_item = 'KIT_ALIMENTOS';

-- ---------- ALERTAS VIGENTES ----------
INSERT INTO alertas (titulo, mensaje, nivel, sector, fuente) VALUES
('Desbordamiento del río Teaone: sectores sur y suroccidente',
 'Ante el desborde del río Teaone se activa evacuación preventiva en los barrios ribereños: 50 Casas, 24 de Mayo, Los Mangos, La Propicia y Portal del Río. Diríjase a los albergues habilitados.',
 'EMERGENCIA', 'Sur de la ciudad de Esmeraldas', 'OPERADOR_COE'),
('Capacidad crítica del albergue Coliseo Municipal',
 'El albergue Coliseo Municipal alcanzó el 96.5% de su capacidad. Los operadores deben redireccionar a los evacuados hacia los albergues con cupo disponible.',
 'ALERTA', 'Centro de Esmeraldas', 'OPERADOR_COE');
```

## 9.1. Usuarios de demostración (NO en SQL: se crean desde el backend)

Crea `backend/app/seed.py` idempotente que se ejecute al arranque y genere con passlib/bcrypt:

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Administrador de Sistema | admin@esmeraldas.gob.demo | Esmeraldas2026! | ADMIN |
| Operadora COE | operador.coe@esmeraldas.gob.demo | Esmeraldas2026! | OPERADOR_COE |
| Ciudadano Demo | ciudadano@esmeraldas.gob.demo | Esmeraldas2026! | CIUDADANO |

## 9.2. Consultas de verificación PostGIS (guárdalas en `database/03_verificacion.sql` y ejecútalas en la demo; son oro para el jurado)

```sql
-- 1. ¿En qué zona de riesgo cae el incidente? (validación de reportes, flujo M1/M2)
SELECT i.id, i.tipo_evento, z.nombre_sector, z.nivel_riesgo
FROM incidentes_emergencia i
JOIN zonas_riesgo z ON ST_Within(i.ubicacion_geom, z.poligono_geom)
ORDER BY i.id;

-- 2. Albergues con cupo más cercanos a las familias atrapadas en Portal del Río,
--    excluyendo saturados y marcando si el trazado cruza el buffer de una vía INTERRUMPIDA
WITH origen AS (SELECT ST_SetSRID(ST_MakePoint(-79.6760, 0.9380), 4326)::geography AS g),
bloqueos AS (SELECT ST_Buffer(linea_geom::geography, 150) AS b
             FROM infraestructura_vial WHERE estado_transito = 'INTERRUMPIDA')
SELECT a.id, a.nombre_albergue,
       (a.capacidad_maxima - a.ocupacion_actual) AS cupos,
       ROUND((ST_Distance(a.ubicacion_geom::geography, origen.g))::numeric, 0) AS distancia_m,
       EXISTS (SELECT 1 FROM bloqueos bl
               WHERE ST_Intersects(ST_MakeLine(a.ubicacion_geom::geometry,
                     ST_SetSRID(ST_MakePoint(-79.6760, 0.9380), 4326))::geography, bl.b)) AS ruta_bloqueada
FROM albergues a CROSS JOIN origen
WHERE a.estado NOT IN ('LLENO','CERRADO')
ORDER BY ST_Distance(a.ubicacion_geom::geography, origen.g)
LIMIT 3;

-- 3. KPIs del COE (alimentan el dashboard)
SELECT
  (SELECT COUNT(*) FROM incidentes_emergencia WHERE estado = 'PENDIENTE') AS reportes_pendientes,
  (SELECT COALESCE(SUM(personas_afectadas),0) FROM incidentes_emergencia) AS personas_afectadas,
  (SELECT COUNT(*) FROM vw_albergues_ocupacion WHERE semaforo = 'CRITICO') AS albergues_criticos,
  (SELECT COUNT(*) FROM infraestructura_vial WHERE estado_transito = 'INTERRUMPIDA') AS vias_interrumpidas,
  (SELECT COUNT(*) FROM familias_afectadas) AS familias_afectadas;
```

---
# SECCIÓN S10 — CONTRATO DE APIS: REST + WEBSOCKETS (ENTREGABLE OFICIAL N.º 6)

Formato general: JSON UTF-8; respuestas geográficas en **GeoJSON FeatureCollection** (RFC 7946); autenticación `Authorization: Bearer <access_token>`; errores FastAPI estándar `{ "detail": "..." }` con códigos 400/401/403/404/409/422/429. Prefijo global: `/api`.

## 10.1. Autenticación y usuarios

| Método | Ruta | Rol mínimo | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registra CIUDADANO. Body: `{nombre, email, password}` (password >= 8). |
| POST | `/api/auth/login` | Público | Devuelve par de tokens. Body: `{email, password}`. |
| POST | `/api/auth/refresh` | Público (refresh) | Renueva access token. Body: `{refresh_token}`. |
| GET | `/api/auth/me` | Autenticado | Perfil del usuario autenticado. |
| GET | `/api/usuarios` | ADMIN | Listado paginado. |
| PATCH | `/api/usuarios/{id}/estado` | ADMIN | Activa/desactiva usuario. |

**Ejemplo `POST /api/auth/login` (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900,
  "usuario": { "id": 2, "nombre": "Operadora COE", "email": "operador.coe@esmeraldas.gob.demo", "rol": "OPERADOR_COE" }
}
```

## 10.2. Capas geográficas (M1)

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/zonas-riesgo` | Público | GeoJSON de zonas con propiedades {id, nombre_sector, parroquia, tipo_amenaza, nivel_riesgo}. Soporta `?nivel=CRITICO`. |
| GET | `/api/hidrografia` | Público | GeoJSON de ríos y esteros. |
| GET | `/api/vias` | Público | GeoJSON de vías con estado_transito. |
| GET | `/api/servicios-esenciales?tipo=SALUD` | Público | GeoJSON de servicios. |
| GET | `/api/albergues` | Autenticado | GeoJSON de albergues con cupos y porcentaje. |

**Ejemplo de feature (`GET /api/zonas-riesgo`):**

```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "id": 1,
    "geometry": { "type": "Polygon", "coordinates": [[[-79.674,0.937],[-79.674,0.949],[-79.662,0.949],[-79.662,0.937],[-79.674,0.937]]] },
    "properties": { "nombre_sector": "Barrio 50 Casas y ribera del Teaone", "parroquia": "Luis Tello", "tipo_amenaza": "DESBORDAMIENTO_RIO", "nivel_riesgo": "CRITICO" }
  }]
}
```

## 10.3. Incidentes (M2/M3)

| Método | Ruta | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/incidentes` | Autenticado | Filtros: `gravedad`, `estado`, `fuente`, `tipo`, `zona_id`, `bbox=minLng,minLat,maxLng,maxLat`, `page=1&page_size=20`. Devuelve `{items, total, page}`. |
| GET | `/api/incidentes/{id}` | Autenticado | Detalle con zona de riesgo asociada. |
| POST | `/api/incidentes` | CIUDADANO | Crea reporte. Body JSON `{tipo_evento, gravedad, descripcion?, lat, lng, uuid_cliente, personas_afectadas?}` o multipart con `foto`. El backend resuelve `zona_riesgo_id` con ST_Within. |
| POST | `/api/incidentes/sincronizar` | CIUDADANO | Batch offline: `{reportes: [...]}` idempotente por `uuid_cliente`; devuelve por cada uno `{uuid_cliente, estado: "CREADO"|"DUPLICADO", id}`. |
| PATCH | `/api/incidentes/{id}/estado` | OPERADOR_COE | Body `{estado, nota?}`; audita y emite `incidente_actualizado`. |
| PATCH | `/api/incidentes/{id}/verificar` | OPERADOR_COE | Marca `verificado=true`; audita. |

**Ejemplo `POST /api/incidentes` (201):**

```json
{
  "id": 9,
  "uuid_cliente": "7f9c24e5-1b3a-4c8d-9e2f-6a1d8b7c4e20",
  "fuente_origen": "REPORTE_CIUDADANO",
  "tipo_evento": "INUNDACION_URBANA",
  "gravedad": "CRITICA",
  "estado": "PENDIENTE",
  "personas_afectadas": 5,
  "zona_riesgo": { "id": 1, "nombre_sector": "Barrio 50 Casas y ribera del Teaone", "nivel_riesgo": "CRITICO" },
  "creado_en": "2026-11-05T06:44:12-05:00"
}
```

## 10.4. Alertas, albergues y rutas (M3/M4)

| Método | Ruta | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/alertas?activa=true` | Público | Alertas vigentes. |
| POST | `/api/alertas` | OPERADOR_COE | `{titulo, mensaje, nivel, sector}`; emite `alerta_emitida`. |
| PATCH | `/api/alertas/{id}` | OPERADOR_COE | Desactivar/editar. |
| GET | `/api/albergues/cercanos?lat=0.938&lng=-79.676&limit=3` | Autenticado | Ranking por `ST_Distance` (metros), con `cupos`, `porcentaje_ocupacion`, `ruta_bloqueada` (cruce con buffer 150 m de vías INTERRUMPIDAS). Implementa la consulta 2 de S09.2. |
| PATCH | `/api/albergues/{id}/ocupacion` | OPERADOR_COE | Body `{delta: +12}` o `{asignar_familia: familiaId}`; transaccional, 409 si excede capacidad; emite `albergue_actualizado`. |
| PATCH | `/api/vias/{id}/estado` | OPERADOR_COE | `{estado_transito, detalle_estado?}`; emite `via_actualizada`. |

**Ejemplo `GET /api/albergues/cercanos` (200):**

```json
{
  "origen": { "lat": 0.938, "lng": -79.676 },
  "resultados": [
    { "id": 2, "nombre_albergue": "Unidad Educativa 5 de Agosto", "distancia_m": 3150, "cupos": 155, "porcentaje_ocupacion": 48.3, "ruta_bloqueada": false },
    { "id": 1, "nombre_albergue": "Coliseo Municipal de Esmeraldas", "distancia_m": 4130, "cupos": 14, "porcentaje_ocupacion": 96.5, "ruta_bloqueada": false },
    { "id": 5, "nombre_albergue": "Centro Comunitario de San Mateo", "distancia_m": 5420, "cupos": 138, "porcentaje_ocupacion": 8.0, "ruta_bloqueada": false }
  ],
  "advertencia": "Albergue 1 al 96.5% de capacidad. Considere redireccionar evacuados."
}
```

## 10.5. Familias, inventario y entregas (M5)

| Método | Ruta | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/familias` | OPERADOR_COE | Listado con nombres enmascarados (LOPDP), filtros por estado/parroquia/necesidad. |
| POST | `/api/familias` | OPERADOR_COE | Censo: `{jefe_hogar, telefono?, numero_integrantes, necesidades[], lat, lng, albergue_id?}`. |
| PATCH | `/api/familias/{id}` | OPERADOR_COE | Actualiza estado/asignación. |
| GET | `/api/necesidades-pendientes` | OPERADOR_COE | Necesidades sin entrega, agrupadas por tipo y zona. |
| GET | `/api/inventario` | OPERADOR_COE | Stock por ítem. |
| POST | `/api/entregas` | OPERADOR_COE | `{familia_id, inventario_id, cantidad}`; **transacción ACID con `SELECT ... FOR UPDATE`**, 409 si stock insuficiente; audita. |
| GET | `/api/entregas?familia_id=` | OPERADOR_COE | Historial de entregas. |

## 10.6. KPIs, meteorología y analítica (M3/M6)

| Método | Ruta | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/kpis/resumen` | OPERADOR_COE | KPIs del dashboard (consulta 3 de S09.2) + series por gravedad y por fuente. |
| GET | `/api/meteorologia/pronostico?lat&lng` | Autenticado | Proxy con caché 10 min a Open-Meteo (S11.1). |
| GET | `/api/analitica/prediccion-sectores` | OPERADOR_COE | GeoJSON de zonas con `score_riesgo_ia` (M6). |
| POST | `/api/analitica/priorizar` | OPERADOR_COE | Recalcula `score_ia` de incidentes abiertos. |
| GET | `/api/health` | Público | `{"status":"ok","db":"ok","postgis":"ok"}`. |

## 10.7. WebSocket de operaciones en tiempo real

Endpoint: `ws(s)://<host>/ws/operaciones` (con token JWT como query param `?token=` o primer mensaje de autenticación).

**Catálogo de eventos (payload ejemplo de `incidente_creado`):**

```json
{
  "evento": "incidente_creado",
  "creado_en": "2026-11-05T06:44:12-05:00",
  "datos": {
    "id": 9, "tipo_evento": "INUNDACION_URBANA", "gravedad": "CRITICA",
    "fuente_origen": "REPORTE_CIUDADANO", "personas_afectadas": 5,
    "lat": 0.9430, "lng": -79.6680,
    "zona_riesgo": "Barrio 50 Casas y ribera del Teaone"
  }
}
```

Otros eventos: `incidente_actualizado`, `alerta_emitida`, `alerta_desactivada`, `albergue_actualizado` (con nuevo porcentaje), `via_actualizada`, `kpis_actualizados` (payload reducido). El `ConnectionManager` del backend mantiene el registro de conexiones, hace broadcast a todos y cierra limpio en desconexión. El cliente React implementa reconexión automática con backoff (1s, 2s, 4s, máx 30s) e indicador visual de estado de conexión.

---

# SECCIÓN S11 — APIs EXTERNAS GRATUITAS INTEGRADAS (SIN COSTO, SIN TARJETA)

**Regla S06-ADR-6:** todas se consumen desde el **backend** (proxy con caché vía httpx), nunca desde el frontend, para no exponer keys, controlar rate limits y aplicar timeouts + fallbacks.

## 11.1. Open-Meteo (meteorología; gratuita, sin API key, uso no comercial)

- **Pronóstico (banda de precipitación del Módulo M1 y aviso al COE):**

```text
GET https://api.open-meteo.com/v1/forecast
    ?latitude=0.9592&longitude=-79.6539
    &hourly=precipitation,precipitation_probability,weather_code
    &current_weather=true&timezone=America/Guayaquil&forecast_days=2
```

- **Archivo histórico (dataset del Módulo M6/IA: precipitación diaria de Esmeraldas):**

```text
GET https://archive-api.open-meteo.com/v1/archive
    ?latitude=0.9592&longitude=-79.6539
    &start_date=2020-01-01&end_date=2026-10-31
    &daily=precipitation_sum&timezone=America/Guayaquil
```

## 11.2. Nominatim / OpenStreetMap (geocodificación y búsqueda de lugares)

```text
GET https://nominatim.openstreetmap.org/search?q=albergue+Esmeraldas+Ecuador&format=json&limit=5
Header obligatorio: User-Agent: EsmeraldasResiliente2026/1.0 (contacto del equipo)
```

**Política:** máximo 1 solicitud/segundo, uso ligero; incluir User-Agent propio. Úsala para autocompletar direcciones en el censo de familias.

## 11.3. Overpass API (datos vectoriales de OSM: colegios, hospitales, ríos)

Ejemplo: unidades educativas en el área urbana de Esmeraldas (bbox sur,oeste,norte,este):

```text
POST https://overpass-api.de/api/interpreter
[out:json][timeout:25];
(
  node["amenity"="school"](-79.72,0.90,1.02,-79.58);
  way["amenity"="school"](-79.72,0.90,1.02,-79.58);
);
out center tags;
```

Úsala en la fase de datos para enriquecer `servicios_esenciales` y como demostración de interoperabilidad (documentada, con atribución "© OpenStreetMap contributors").

## 11.4. OpenRouteService (rutas de evacuación reales; capa gratuita con API key: 2.000 direcciones/día)

```text
GET https://api.openrouteservice.org/v2/directions/driving-car
    ?api_key=TU_KEY&start=-79.676,0.938&end=-79.663,0.960
```

**Función estrella para el Módulo M4:** el parámetro `options.avoid_polygons` acepta polígonos GeoJSON; construye los polígonos a partir del buffer de 150 m de las vías `INTERRUMPIDA` (S09.2) para que la ruta de evacuación sugerida **evite realmente el tramo bloqueado**. Registra la clave en `.env` como `ORS_API_KEY` (obtención gratuita en openrouteservice.org/dev). Si no hay clave o se agota la cuota, fallback a la línea recta con la advertencia `ruta_bloqueada` calculada con PostGIS.

## 11.5. Teselas de mapas (capas base del visor)

- OpenStreetMap estándar: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (atribución obligatoria "© OpenStreetMap contributors").
- Esri World Imagery (satélite, uso con atribución): `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`.

## 11.6. Fuentes oficiales de referencia (consulta humana, no API pública)

INAMHI (inamhi.gob.ec) y SNGR (gestionderiesgos.gob.ec) publican boletines e informes de situación; los datos de `ALERTA_OFICIAL` los ingresa el operador COE a partir de esos boletines públicos, respetando sus condiciones de uso (regla del reto S02.5). Documenta este flujo en la documentación técnica: demuestra madurez institucional ante el jurado.

---
# SECCIÓN S12 — MÓDULO IA: ANALÍTICA PREDICTIVA CON SCIKIT-LEARN (10 PTS DE LA RÚBRICA)

## 12.1. Justificación técnica (la exige el jurado: "la IA debe responder a una necesidad concreta")

**Problema real:** durante una emergencia, el COE recibe decenas de reportes simultáneos y debe decidir el orden de atención. La gravedad autoreportada por el ciudadano es subjetiva y no considera contexto (precipitación vigente, historial del sector, número de personas). **Necesidad concreta:** ordenar la cola de incidentes con un score objetivo y reproducible.

**Propuesta:** dos modelos ligeros entrenados localmente, sin servicios de pago:

1. **Priorizador de incidentes** — `RandomForestClassifier` de scikit-learn que aprende de incidentes históricos etiquetados y predice un `score_prioridad` 0-100 por incidente abierto.
2. **Mapa de recurrencia** — clustering `KMeans` (o `DBSCAN`) sobre coordenadas de incidentes históricos + precipitación acumulada, que agrupa "focos de recurrencia" para priorizar sectores preventivamente.

**Por qué RandomForest:** interpretabilidad razonable (importancia de features expuesta en `/api/analitica`), robustez con pocas decenas de muestras y datos mixtos (one-hot + numéricos), entrenamiento en < 1 s en laptop. **Por qué no una red neuronal:** no hay volumen de datos que lo justifique; el sobre-dimensionamiento restaría puntos de coherencia arquitectónica.

## 12.2. Features del priorizador

| Feature | Origen | Tipo |
|---|---|---|
| `tipo_evento` | incidente | one-hot |
| `gravedad_reportada` | incidente | ordinal 0-3 |
| `personas_afectadas` | incidente | numérica (log1p) |
| `precipitacion_24h` | Open-Meteo archivo (S11.1) para la fecha | numérica |
| `nivel_riesgo_zona` | zona de riesgo (ST_Within) | ordinal 0-3 |
| `recurrencia_sector` | conteo histórico de incidentes en la zona (90 días) | numérica |
| `hora_dia` / `es_madrugada` | `creado_en` | numérica / binaria |

**Etiqueta de entrenamiento:** `prioridad_alta` (1/0), definida en los datos históricos sintéticos como "requirió intervención inmediata" (gravedad CRITICA/ALTA + personas afectadas > 10 + zona ALTO/CRITICO). Genera 400-600 registros históricos sintéticos etiquetados `DATO_SIMULADO` en `backend/ml/datos_entrenamiento.csv` con semilla fija (`random_state=42`) para reproducibilidad.

## 12.3. Implementación (estructura)

```
backend/ml/
├── entrenar.py          # Entrena, evalúa (train/test split + classification_report) y guarda modelo.joblib
├── datos_entrenamiento.csv   # Histórico sintético reproducible (seed 42)
├── modelo.joblib         # Artefacto cargado al arranque del backend
└── servicio_ia.py        # score(incidente) -> {score_prioridad, top_3_factores}
```

- `POST /api/analitica/priorizar` recalcula scores de incidentes abiertos y los persiste en `incidentes_emergencia.score_ia`; ordena el tablero del COE por score descendente.
- `GET /api/analitica/prediccion-sectores` devuelve GeoJSON de zonas con `score_riesgo_ia` (media de scores + recurrencia normalizada), renderizado como capa de calor.
- El entrenamiento corre en el arranque del contenedor si `modelo.joblib` no existe (o con `make train`); dura < 5 s.

## 12.4. Métricas y transparencia (mínimo exigible)

- Reporta en `docs/` y en la UI de analítica: accuracy, precision, recall y F1 del modelo sobre el set de prueba, más la **importancia de features** (gráfico de barras recharts).
- **Disclaimer obligatorio en toda salida de IA (regla del reto):** "Resultado experimental con fines académicos. No constituye pronóstico oficial. Consulte los boletines del INAMHI y de la SNGR." Con icono `FlaskConical` de Lucide, visible sin hacer scroll en la vista de analítica.

---

# SECCIÓN S13 — DESIGN SYSTEM UI/UX (CRITERIO "USABILIDAD Y EXPERIENCIA DE USUARIO", 10 PTS)

## 13.1. Identidad visual

- **Nombre de marca en UI:** "Esmeraldas Resiliente" con sufijo "2026" en el badge de la barra superior.
- **Personalidad:** institucional-operativa, sobria, alta densidad de información para el COE; amable y minimalista para el ciudadano.
- **Tipografía (Google Fonts):** títulos **Space Grotesk 600/700**; cuerpo **Inter 400/500/600**; cifras y horas **JetBrains Mono 500** (tabular). Tamaños base 16 px; escala 12/14/16/18/22/28/36/48.
- **Títulos con texto en gradiente (identidad solicitada por el equipo):** los títulos principales de cada vista usan el efecto "letras con degradado interno":

```css
.titulo-gradiente {
  background: linear-gradient(100deg, #38bdf8 0%, #10b981 55%, #f59e0b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}
```

Úsalo en el H1 de cada página/módulo (una vez por vista, no en cada texto) y en el logo del sidebar. El resto de textos usa color sólido.

## 13.2. Tokens de color (claro/oscuro, CSS variables + Tailwind)

| Token | Modo claro | Modo oscuro | Uso |
|---|---|---|---|
| `--fondo` | #f8fafc | #0b1120 | Fondo general |
| `--superficie` | #ffffff | #131c2e | Tarjetas, paneles |
| `--borde` | #e2e8f0 | #1e293b | Bordes 1 px |
| `--texto` | #0f172a | #e2e8f0 | Texto principal |
| `--texto-suave` | #64748b | #94a3b8 | Secundarios |
| `--primario` | #075985 | #38bdf8 | Acciones, enlaces, foco |
| `--acento` | #059669 | #34d399 | Confirmaciones, "oficial" |
| `--peligro` | #dc2626 | #f87171 | CRÍTICO, errores |
| `--alerta` | #ea580c | #fb923c | ALTO |
| `--precaucion` | #ca8a04 | #facc15 | MEDIO |

**Semáforo de riesgo/gravedad (constante en toda la app):** BAJO `#22c55e` · MEDIO `#eab308` · ALTO `#f97316` · CRÍTICO `#dc2626`. Estados viales: OPERATIVA verde, PRECAUCION ámbar, INTERRUMPIDA rojo discontinuo. El toggle claro/oscuro persiste en `localStorage` y responde a `prefers-color-scheme` en la primera visita.

## 13.3. Iconografía (regla S01-1 y S01-2)

Exclusivamente **lucide-react**. Mapa base de conceptos (coherencia semántica en toda la app):

| Concepto | Icono | Concepto | Icono |
|---|---|---|---|
| Incidentes / emergencia | `Siren` | Reporte ciudadano | `Megaphone` |
| Personas afectadas | `Users` | Familias | `Home` |
| Albergues | `BedDouble` | Inventario / kits | `Package` |
| Vías / rutas | `Route` | Deslizamiento | `MountainSnow` |
| Inundación / lluvia | `CloudRainWind` / `Droplets` | Ríos | `Waves` |
| Alerta oficial | `ShieldCheck` | Dato simulado | `FlaskConical` |
| Mapa / capas | `Map` / `Layers` | COE / operaciones | `MonitorDot` |
| IA / analítica | `BrainCircuit` | Conexión | `Wifi` / `WifiOff` |
| Sincronización | `RefreshCw` | Reloj | `Clock` |
| Usuario / roles | `UserRound` / `ShieldUser` | Evacuación | `DoorOpen` |

## 13.4. Layout y navegación

- **Escritorio:** barra lateral fija de 240 px (logo + navegación por módulos con iconos: Mapa de Riesgos, Reportar, COE, Albergues y Rutas, Familias y Ayuda, Analítica IA; footer con usuario y rol). Barra superior con: título de vista, **reloj en vivo** (JetBrains Mono, `America/Guayaquil`), **indicador de conexión** (En línea verde / Sin conexión rojo con icono `WifiOff` / Sincronizando ámbar con `RefreshCw` girando), toggle tema (icono `Sun`/`Moon`) y menú de usuario.
- **Móvil (ciudadano en campo):** la barra lateral se convierte en navegación inferior de 5 destinos; el formulario de reporte es una sola columna con botones grandes (mínimo 48 px de alto), el mapa a pantalla completa con botón flotante "Reportar" (`Plus`).
- **Estados:** esqueletos de carga (shimmer), estados vacíos con icono + texto guía (ej. "Aún no hay incidentes que coincidan con el filtro"), toasts de éxito/error (arriba a la derecha, autodescartables 4 s), confirmaciones destructivas en modal.

## 13.5. Badges institucionales de fuente (requisito oficial del reto)

| Fuente | Estilo | Icono |
|---|---|---|
| REPORTE_CIUDADANO | fondo azul suave, borde azul | `Megaphone` |
| DATO_SIMULADO | fondo gris, borde punteado | `FlaskConical` |
| ALERTA_OFICIAL | fondo verde suave, borde verde | `ShieldCheck` |

Leyenda accesible en el mapa y en el dashboard: "La plataforma diferencia reportes ciudadanos, datos simulados de ejercicios académicos y alertas emitidas por organismos oficiales."

## 13.6. Pantallas (wireframes de referencia)

1. **Login** — tarjeta centrada sobre gradiente de fondo azul-esmeralda; logo con título en gradiente; formulario email/contraseña; enlaces "Registrarme" (ciudadano).
2. **Mapa Inteligente de Riesgos (pública tras login)** — mapa a pantalla completa; panel de capas plegable a la derecha; leyenda abajo-izquierda; tarjetas flotantes con KPIs mínimos; popup de zona/incidente con acciones según rol.
3. **Reportar emergencia (M2)** — asistente de 1 pantalla: tipo (chips con icono), gravedad (segmentado 4 niveles), descripción con contador, foto (input con preview y peso comprimido), ubicación (GPS automático + mini-mapa arrastrable + precisión), botón primario grande "Enviar reporte"; banner de cola pendiente cuando hay reportes sin sincronizar.
4. **Panel COE (M3)** — grid de 6 KPIs arriba (cards con icono, cifra grande JetBrains Mono y delta de la última hora); centro: mapa sincronizado; derecha: lista priorizada de incidentes (orden por score IA si M6 activo, si no por gravedad+hora) con badges de fuente y acciones de estado; abajo: feed cronológico y gráfica de incidentes por hora (recharts).
5. **Albergues y rutas (M4)** — mapa con albergues (icono `BedDouble` con color de semáforo de ocupación); panel lateral: albergues ordenados por ocupación con barra de capacidad; buscador "ubicación de la familia" → resultados con distancia, cupos y advertencia de vía bloqueada; botón "Trazar ruta".
6. **Familias y asistencia (M5)** — tabla censal con datos enmascarados y chip de necesidades; detalle lateral con historial de entregas; formulario de entrega con validación de stock en vivo; sección "Necesidades pendientes" agrupada.
7. **Analítica IA (M6)** — mapa de calor de recurrencia + panel de métricas del modelo (accuracy, F1, importancia de features) + top de incidentes priorizados con sus top-3 factores; disclaimer experimental visible.

## 13.7. Accesibilidad y responsive (RNF-05/RNF-06)

- Contraste AA en ambos temas (verifica los tokens de la tabla 13.2).
- Focus visible (outline 2 px `--primario`), navegación por teclado en tablas y modales, `aria-label` en botones de solo icono.
- Puntos de corte: 360/768/1024/1440 px. El COE se usa desde 1280 px; el módulo ciudadano optimiza desde 360 px.
- Animaciones discretas (150-250 ms), respetando `prefers-reduced-motion`.

---
# SECCIÓN S14 — CIBERSEGURIDAD: JWT, RBAC Y OWASP TOP 10 (RESPUESTA LISTA PARA EL JURADO)

## 14.1. Modelo de autenticación (JWT + refresh)

- **Login** (`POST /api/auth/login`): valida credenciales contra `password_hash` (bcrypt, cost 10) y emite:
  - **Access token JWT** (HS256, expiración 15 min): claims `{sub, rol, nombre, exp, iat, jti}`.
  - **Refresh token JWT** (expiración 7 días, solo para `/api/auth/refresh`, con rotación: cada refresco emite refresh nuevo).
- Los secretos (`JWT_SECRET`, `JWT_REFRESH_SECRET`, mín. 32 caracteres aleatorios) viven en `.env` (nunca en el repositorio; entrega `.env.example`).
- `GET /api/auth/me` y el WebSocket validan el token en cada uso. Cierre de sesión en frontend descarta tokens (y opcionalmente blacklist por `jti` con TTL).
- **Registro público** solo crea rol CIUDADANO. Los roles superiores los crea el ADMIN desde la consola.

## 14.2. Matriz RBAC (rol mínimo por operación)

| Operación | CIUDADANO | OPERADOR_COE | ADMIN |
|---|---|---|---|
| Ver mapa, zonas, ríos, vías, alertas activas | Si | Si | Si |
| Crear reporte / sincronizar batch offline | Si | Si | Si |
| Ver "Mis reportes" y su estado | Si | Si | Si |
| Ver listado completo de incidentes con filtros | Solo propios | Si | Si |
| Cambiar estado / verificar incidente | No | Si | Si |
| Emitir / desactivar alertas | No | Si | Si |
| Actualizar ocupación de albergues | No | Si | Si |
| Cambiar estado de vías | No | Si | Si |
| Censo de familias (datos enmascarados) | No | Si | Si |
| Inventario y entregas | No | Si | Si |
| KPIs, meteorología, analítica IA | No | Si | Si |
| Gestión de usuarios y auditoría | No | No | Si |

Implementación: dependencia FastAPI `require_role(*roles)` que decodifica el JWT, resuelve el usuario activo y lanza **403** si el rol es insuficiente (y **401** si el token falta/expiró). Aplícala en cada router; no dejes ningún endpoint de escritura sin ella.

## 14.3. OWASP Top 10 (2021) — mapa amenaza → mitigación → implementación concreta

| # | Riesgo | Mitigación en este proyecto |
|---|---|---|
| A01 | Broken Access Control | RBAC con `require_role` por endpoint (14.2); el ciudadano solo accede a sus propios reportes; los datos de familias jamás se exponen a CIUDADANO. |
| A02 | Cryptographic Failures | Contraseñas con bcrypt; tokens firmados HS256 con secretos de 32+ chars en `.env`; tráfico HTTPS/WSS en el túnel de demo (S20); sin datos sensibles en localStorage (tokens en memoria + sessionStorage con expiración manejada). |
| A03 | Injection | SQLAlchemy parametrizado en el 100% de las consultas (sin SQL concatenado, jamás f-strings sobre SQL); validación estricta Pydantic/zod en ambos extremos; React escapa por defecto (sin `dangerouslySetInnerHTML`); consultas PostGIS construidas con `bindparams`. |
| A04 | Insecure Design | Matriz RBAC aprobada por diseño; límites de tamaño de payload (foto <= 5 MB); idempotencia offline por `uuid_cliente`; validación de capacidad de albergues del lado del servidor. |
| A05 | Security Misconfiguration | CORS con whitelist explícita de orígenes (frontend local y dominio del túnel); `DEBUG=False` en producción; cabeceras de seguridad (14.4); errores sin stack traces hacia el cliente; contenedores con imágenes fijas por tag. |
| A06 | Vulnerable Components | Dependencias fijadas por versión en `requirements.txt`/`package.json`; ejecutar y documentar `pip-audit` y `npm audit --omit=dev` (S18); imágenes Docker oficiales. |
| A07 | Identification & Authentication Failures | Rate limiting en `/api/auth/login` (5 intentos/min por IP con slowapi); contraseñas mínimo 8 caracteres con complejidad básica; mensajes de error genéricos ("Credenciales inválidas") sin revelar si el email existe; tokens de vida corta. |
| A08 | Software & Data Integrity Failures | Migraciones versionadas con Alembic; seed idempotente; modelo IA con `random_state` fijo y artefacto versionado; imágenes Docker por digest/tag, no `latest` en producción. |
| A09 | Logging & Monitoring Failures | Tabla `auditoria` (quién, qué, cuándo, detalle JSONB) en acciones de negocio: cambio de estado de incidente, emisión de alerta, ocupación de albergue, entrega de asistencia, gestión de usuarios; logs estructurados con `req_id`; healthcheck monitoreable. |
| A10 | SSRF | El backend es el único que llama APIs externas (whitelist fija: Open-Meteo, Nominatim, Overpass, ORS); ninguna API del proyecto acepta URLs arbitrarias del cliente; httpx con timeout de 8 s y caché. |

## 14.4. Cabeceras de seguridad HTTP (middleware del backend o del proxy)

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org https://server.arcgisonline.com; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' wss: https://api.open-meteo.com
Strict-Transport-Security: max-age=31536000; includeSubDomains   (activa tras servir por HTTPS/WSS con el túnel)
```

Nota: geolocation=(self) es necesario porque el reporte ciudadano usa la API de geolocalización del navegador (solo en la propia página, nunca en iframes de terceros).

## 14.5. Integridad transaccional (ACID) — operaciones críticas

1. **Ocupación de albergues:** `UPDATE albergues SET ocupacion_actual = ocupacion_actual + :delta WHERE id = :id AND ocupacion_actual + :delta <= capacidad_maxima` dentro de transacción; si 0 filas afectadas → 409 "El albergue excede su capacidad".
2. **Entregas de asistencia:** transacción con `SELECT ... FOR UPDATE` sobre `inventario_suministros` (bloqueo de fila), verificación de stock, decremento, inserción de `entregas_asistencia` y registro en `auditoria`; rollback completo si cualquier paso falla. Nunca stock negativo.
3. **Sincronización offline:** inserción con `ON CONFLICT (uuid_cliente) DO NOTHING` → idempotencia garantizada aunque el cliente reintenté.

## 14.6. Protección de datos personales (LOPDP — Ecuador)

- **Principio de minimización:** solo se piden los datos necesarios (nombre jefe/a de hogar, teléfono, integrantes, ubicación aproximada).
- **Seudonimización en exposición:** la API enmascara nombres ("Ana T.") y teléfonos ("09···223") para cualquier consumidor; el acceso completo es solo para roles autorizados, y queda en `auditoria`.
- **Finalidad y aviso:** la UI muestra aviso de tratamiento "Datos recogidos únicamente para la gestión humanitaria del ejercicio académico, conforme a la Ley Orgánica de Protección de Datos Personales".
- **Conservación:** base de datos de demostración; los dumps incluyen solo datos ficticios etiquetados `DATO_SIMULADO`.

## 14.7. Respuesta lista si el jurado pregunta "¿qué seguridad aplicaron?"

> "Aplicamos autenticación con tokens JWT de vida corta con refresh y rotación, autorización por roles (ciudadano, operador COE y administrador) verificada en cada endpoint, cifrado de contraseñas con bcrypt, validación estricta de entradas con Pydantic en el servidor y zod en el cliente, acceso a datos 100% por ORM parametrizado (sin SQL dinámico), rate limiting en autenticación, cabeceras de seguridad HTTP, CORS restringido, transacciones ACID con bloqueo pesimista en inventario y capacidad de albergues, auditoría de acciones críticas, protección de datos personales conforme a la LOPDP con seudonimización, y consumimos las APIs externas únicamente desde el backend para evitar exposición de credenciales y SSRF. Todo el tráfico de la demo viaja por HTTPS/WSS a través del túnel."

---
# SECCIÓN S15 — ESCENARIO OFICIAL "JUEVES, 06:00 AM" (LA DEMO QUE VALE 40 PUNTOS COMBINADOS)

Condición inicial: precipitaciones intensas durante la madrugada en la provincia de Esmeraldas, bajo alerta roja nacional vigente por El Niño (contexto real S02). Los datos exactos ya están sembrados en S09.

## 15.1. Los 6 eventos oficiales y cómo los resuelve la plataforma

| # | Evento oficial | Dato semilla (S09) | Módulos que interactúan | Evidencia en pantalla |
|---|---|---|---|---|
| 1 | Inundaciones en sectores urbanos | Incidentes 2 (50 Casas, CRITICA) y 8 (Los Mangos, ATENDIDO); polígonos CRITICO/ALTO del sur | M1, M2, M3 | Polígonos rojos/naranjas; marcadores; KPI personas afectadas |
| 2 | Desbordamiento de río en zona rural | Incidente 4 (Vuelta Larga, CRITICA, 120 personas); polígono de laderas vía E20 | M1, M2, M3 | Marcador en parroquia rural; badge DATO_SIMULADO; feed |
| 3 | Deslizamiento que interrumpe carretera | Vía E20 INTERRUMPIDA + incidente 3 (DESLIZAMIENTO_TIERRA) | M1, M4 | Línea roja discontinua; al sugerir rutas se advierte el bloqueo |
| 4 | Familias que requieren evacuación | Incidente 5 (PERSONAS_ATRAPADAS, 23 personas); familias 2 y 3 REGISTRADAS sin albergue | M2, M4, M5 | Reporte CRITICO; sugerencia de albergue cercano con cupo |
| 5 | Albergue próximo al límite | Coliseo Municipal 386/400 (96.5%); incidente 6 y alerta 2 | M3, M4 | Barra roja 96.5%; advertencia automática; redirección a UE 5 de Agosto |
| 6 | Solicitudes urgentes de suministros | Incidente 7 (SOLICITUD_SUMINISTROS); familias con necesidades; inventario | M5 | Necesidades pendientes; entrega ACID con decremento de stock |

## 15.2. Las 8 preguntas oficiales y dónde las responde el sistema (memoriza esta tabla para el Q&A)

| Pregunta oficial | Respuesta del sistema | Pantalla / endpoint |
|---|---|---|
| 1. ¿Qué está sucediendo en el territorio? | Feed cronológico + mapa con 8 incidentes clasificados por tipo, gravedad y fuente; aviso INAMHI N.º 86 activo | Panel COE / `GET /api/incidentes` |
| 2. ¿Dónde se producen las emergencias? | Geolocalización exacta por incidente y agregación por zona de riesgo (ST_Within) | Mapa + popup / `GET /api/zonas-riesgo` |
| 3. ¿Cuántas personas y familias están afectadas? | KPI personas afectadas (1012 en incidentes, según SUM de la consulta 3 de S09.2) + 6 familias censadas con 29 integrantes | KPI cards / `GET /api/kpis/resumen` |
| 4. ¿Qué sectores requieren atención prioritaria? | Ranking por score IA o semáforo de zonas; 50 Casas y Vuelta Largas arriba | Lista priorizada + capa de recurrencia |
| 5. ¿Qué vías se encuentran interrumpidas? | Vía E20 tramo Vuelta Larga INTERRUMPIDA; E15 y puente Teaone en PRECAUCION | Capa vial / `GET /api/vias` |
| 6. ¿Dónde existen albergues disponibles? | 4 albergues con cupo (UE 5 de Agosto 155, Bartolomé Ruiz 170, UTLVTE 390, San Mateo 138); Coliseo crítico | Panel albergues / `GET /api/albergues/cercanos` |
| 7. ¿Qué recursos deben movilizarse? | Necesidades pendientes por tipo y sector; inventario disponible (kits, agua, medicinas) | M5 / `GET /api/necesidades-pendientes` |
| 8. ¿Cómo coordinar la atención de incidentes? | Flujo de estados PENDIENTE→EN_PROCESO→ATENDIDO con auditoría y WebSocket; alertas sectoriales | Panel COE + auditoría |

## 15.3. Guion de demostración en vivo (6-7 minutos, ensáyalo 3 veces)

1. **(0:00) Contexto en una frase:** "Esmeraldas bajo alerta roja real por El Niño; nuestra plataforma responde al escenario oficial Jueves 06:00." Mostrar login con roles.
2. **(0:30) Mapa inteligente:** encender capas una a una: zonas de riesgo (semáforo), ríos, vías (E20 roja discontinua), servicios esenciales. Resaltar el polígono CRITICO de 50 Casas.
3. **(1:15) Reporte ciudadano offline:** en el móvil (o segunda pestaña con DevTools offline), crear reporte con GPS y foto; mostrar la cola IndexedDB "En espera"; recuperar red y ver "Sincronizado" — el incidente aparece en el mapa y en el dashboard COE **en vivo** (WebSocket).
4. **(2:15) Validación espacial:** abrir el incidente nuevo: el sistema lo vinculó automáticamente a la zona "Barrio 50 Casas y ribera del Teaone" (ST_Within). Ejecutar en pgAdmin la consulta 1 de S09.2 como prueba técnica.
5. **(2:45) COE en acción:** KPIs en vivo; filtrar CRITICA; cambiar el incidente de "familias atrapadas" a EN_PROCESO (queda auditado); emitir la alerta sectorial del Teaone (banner en vivo).
6. **(3:30) Albergues y evacuación:** mostrar Coliseo al 96.5% (barra roja); desde Portal del Río pedir albergue cercano → sugerencia ordenada por distancia con cupo, excluyendo saturados, con advertencia de vía bloqueada; trazar ruta (ORS con avoid_polygons si hay clave; si no, línea con advertencia PostGIS).
7. **(4:30) Ayuda humanitaria ACID:** registrar una familia evacuada; asignarla a la UE 5 de Agosto (la ocupación sube en el mapa); registrar entrega de 2 kits de agua con decremento de stock; intentar una entrega mayor al stock → **409, rollback limpio** (el jurado valora ver el error controlado).
8. **(5:15) IA:** capa de recurrencia (concentración en barrios ribereños del Teaone, coherente con los eventos reales 2023-2024); score de priorización y métricas del modelo; leer el disclaimer experimental.
9. **(5:45) Cierre:** responder las 8 preguntas en 30 segundos apoyándose en la tabla 15.2 (una pantalla por pregunta) y terminar con el lema: "Programar hoy para proteger vidas mañana".

**Contingencia:** si algo falla, ten el video de respaldo (S18.4) y el dump `demo_06am.sql` para re-sembrar en 20 segundos.

---

# SECCIÓN S16 — PLAN DE EJECUCIÓN DEL EQUIPO (24 A 72 HORAS)

## 16.1. Los 6 roles oficiales del documento del reto (adaptar a 3-5 integrantes; una persona puede asumir 2 roles afines)

| Rol | Responsabilidad | Entregable principal |
|---|---|---|
| Analista/Diseño y Pitch | Historias de usuario, flujo de datos, presentación | Pitch + docs/ |
| Frontend & UX | React, Tailwind, Leaflet, offline-first | SPA completa |
| Backend & APIs | FastAPI, JWT, WebSockets, proxies | API completa |
| Base de Datos | DER, PostGIS, seed del escenario | database/ |
| Especialista GIS | Consultas espaciales, capas, rutas | Consultas S09.2 + mapa pulido |
| IA & Datos | Scikit-learn, features, métricas | backend/ml/ |

## 16.2. Cronograma maestro 72 h (alineado a las 6 etapas oficiales del reto)

| Bloque | Horas | Objetivo (criterio de salida) |
|---|---|---|
| Etapa 1-2: Arranque | 0-3 h | Repo + Docker Compose "hola mundo" de los 3 servicios levantado; MoSCoW confirmado; roles asignados; wireframes de las 3 pantallas clave bocetados |
| Etapa 3: Datos | 3-6 h | `01_schema` + `02_seed` ejecutándose en PostGIS; DER exportado; consultas de verificación S09.2 funcionando en pgAdmin |
| Etapa 4-A: Backend | 6-18 h | Auth JWT + RBAC; CRUD de incidentes con ST_Within; WebSocket broadcast; albergues cercanos; KPIs; proxy Open-Meteo |
| Etapa 4-B: Frontend | 10-24 h | Layout + tema; mapa con capas; formulario con GPS/foto/offline; panel COE en vivo; albergues y rutas; familias/entregas |
| Etapa 4-C: IA | 18-30 h | dataset sintético + RandomForest + endpoint analítica + panel de métricas |
| Etapa 5: Pruebas | 30-40 h | Checklist S18 completo sobre el escenario; corrección de defectos bloqueantes; ensayo de demo #1 |
| Etapa 6: Cierre | 40-46 h | Documentación técnica; video de respaldo; túnel público; ensayo final cronometrado; CODE FREEZE |

## 16.3. Modo crisis 24 h (si el tiempo se acorta)

Prioridad estricta en este orden: (1) docker compose levanta db+backend+frontend; (2) mapa con capas y seed del escenario; (3) reporte ciudadano online + dashboard con WebSocket; (4) albergues cercanos con ST_Distance; (5) ocupación de albergues + entregas simplificadas; (6) IA con el modelo mínimo y métricas. **Descarta sin remordimiento:** PWA instalable, modo oscuro (queda solo claro), ORS (usa PostGIS puro), clustering (muestra solo el ranking). El jurado premia conjunto coherente funcional.

## 16.4. Puntos de control con mentores (días 1 y 2)

Lleva a cada mentoría: la matriz de la S17 con lo cumplido, el mapa corriendo y las 3 dudas técnicas más costosas. Aprovecha la validación temprana de que cumples la rúbrica antes del último día.

---

# SECCIÓN S17 — MAPEO RÚBRICA OFICIAL → FUNCIONALIDADES (100 PUNTOS)

| Criterio oficial | Pts | Funcionalidades que lo cubren | Evidencia para el jurado |
|---|---|---|---|
| Funcionalidad del prototipo desarrollado | **25** | Todos los RF MUST/SHOULD de S04; demo en vivo del escenario S15 sin errores | Guion S15.3 ejecutado completo; cero pantallas "en construcción" |
| Innovación y creatividad | **15** | Offline-first con cola IndexedDB idempotente; diferenciación de fuentes; score IA explicable; rutas que evitan vías bloqueadas; túnel público accesible desde el móvil del jurado | Demo del reporte sin internet; sección "Innovación" del pitch S22 |
| Calidad de la arquitectura | **15** | 4 capas + Repository; Docker Compose reproducible; ADRs documentados; migraciones Alembic; auditoría | Diagrama S06 + carpeta docs/ + `docker compose up` en vivo |
| Integración de geolocalización y mapas | **15** | PostGIS ST_Within/ST_Distance/ST_Buffer; GeoJSON end-to-end; Leaflet multicapa; semáforo de riesgo; albergue más cercano sin cruzar bloqueos | Consultas S09.2 ejecutadas en pgAdmin durante la demo |
| IA o análisis de datos | **10** | RandomForest priorizador + clustering de recurrencia; métricas y features visibles; justificación S12; disclaimer | Panel de analítica + parrafo de justificación técnica |
| Usabilidad y experiencia de usuario | **10** | Design system S13 completo; estados de conexión; móvil de campo; accesibilidad AA; feedback constante | Recorrido ciudadano y COE en dos ventanas |
| Impacto social y viabilidad | **10** | Contexto real 2026 (S02); LOPDP; interoperabilidad con fuentes oficiales; continuidad post-hackathon (S20/S21) | Cierre del pitch con hoja de ruta |

**Las 7 consideraciones oficiales del jurado y cómo las atiende el proyecto:** (1) código en vivo → todo es demostrable, nada "propuesto"; (2) coherencia arquitectónica → monolito en capas justificado (ADR-1); (3) valor geoespacial real → las consultas espaciales deciden operaciones (zonificación, rutas, albergues); (4) pertinencia de la IA → necesidad concreta (cola de atención) con justificación y métricas; (5) UX clara bajo estrés → flujos de 60 s, estados visibles, semáforos; (6) proyección territorial → datos y fuentes reales de Esmeraldas + hoja de ruta de continuidad; (7) la IA no es obligatoria → nuestro conjunto funciona completo sin ella, y con ella suma 10 puntos.

---
# SECCIÓN S18 — PROTOCOLO DE PRUEBAS Y CONTROL DE CALIDAD (ETAPA 5 OFICIAL)

## 18.1. Checklist funcional por módulo (marcar antes de la demo)

**Infraestructura**
- [ ] `docker compose up -d` levanta db + backend + frontend desde cero en < 3 min, sin pasos manuales.
- [ ] `GET /api/health` responde `{"status":"ok","db":"ok","postgis":"ok"}`.
- [ ] Migraciones/seed idempotentes: re-ejecutar no duplica datos.

**M1 GIS**
- [ ] Mapa centrado en Esmeraldas (0.9592, -79.6539) con OSM y satélite Esri.
- [ ] 9 zonas de riesgo con semáforo correcto; 2 ríos; 5 vías (E20 interrumpida); 5 servicios esenciales; 5 albergues.
- [ ] Toggles de capas funcionan; leyenda coincide con colores.

**M2 Reporte offline**
- [ ] Reporte online llega al mapa y al COE en < 1 s (WebSocket).
- [ ] Con DevTools offline: reporte se encola (badge ámbar + contador); al volver la red se sincroniza solo.
- [ ] Recargar la página tras sincronizar NO duplica el reporte (idempotencia uuid_cliente).
- [ ] Foto > 5 MB rechazada con mensaje claro; foto válida comprimida y visible.

**M3 COE**
- [ ] KPIs coinciden con el seed: 1012 personas afectadas, 1 vía interrumpida, 1 albergue crítico, 4 incidentes pendientes, 6 familias.
- [ ] Cambio de estado auditable; alerta emitida aparece en vivo en otra pestaña.
- [ ] Filtros combinados gravedad+fuente funcionan.

**M4 Albergues/rutas**
- [ ] Consulta de cercanos desde Portal del Río devuelve orden por distancia, excluye LLENO, marca `ruta_bloqueada` cuando cruza la E20.
- [ ] Ocupación con delta funciona; exceder capacidad devuelve 409 sin cambios.

**M5 Asistencia**
- [ ] Crear familia la geolocaliza; datos enmascarados en la API (verificar en la pestaña Network).
- [ ] Entrega decrementa stock; entrega mayor al stock devuelve 409 (probar 2 peticiones concurrentes: nunca stock negativo).

**M6 IA**
- [ ] Modelo entrena al arranque (< 5 s); `/api/analitica/prediccion-sectores` devuelve GeoJSON con scores.
- [ ] El ranking del COE ordena por score; disclaimer visible.

**Seguridad (pruebas rápidas)**
- [ ] Sin token: `GET /api/incidentes` → 401. Con token de ciudadano: `PATCH /api/incidentes/1/estado` → 403.
- [ ] Login con 6 intentos fallidos → 429 (rate limit).
- [ ] Payload `<script>` en descripción se guarda inerte y se renderiza como texto (sin ejecución).
- [ ] `npm audit --omit=dev` y `pip-audit` sin vulnerabilidades críticas (o documentadas).

## 18.2. Pruebas automatizadas mínimas (pytest + Vitest)

- Backend: login correcto/incorrecto; creación de incidente con vinculación de zona; cercanos excluye LLENO; entrega sin stock → 409; RBAC 403 ciudadano.
- Frontend: formulario valida campos obligatorios; cola offline encola con uuid; render de badges de fuente.

## 18.3. Prueba de estrés de demo

Con 2 dispositivos (laptop COE + móvil ciudadano) y una tercera pestaña como ciudadano 2, ejecutar el guion S15.3 completo cronometrado. Repetir 3 veces. Toda falla intermitente se trata como bloqueante.

## 18.4. Plan de contingencia de la Demo Day (no negociable)

1. **Video de respaldo** de 4 minutos grabado con la demo completa funcionando (guárdalo local y en la nube, sin depender del wifi del recinto).
2. **Dump de la demo:** `demo_06am.sql` (pg_dump tras el seed) para restaurar el estado exacto en < 30 s.
3. **Capturas de pantallas** de todos los flujos para el peor escenario.
4. **Túnel probado el día anterior** desde una red diferente + URL corta con QR impreso.
5. Si el jurado permite: laptop como pantalla principal y el móvil conectado a datos móviles para el reporte offline.

---

# SECCIÓN S19 — ESTRUCTURA COMPLETA DEL REPOSITORIO

```
esmeraldas-resiliente-mvp/
├── docker-compose.yml              # Orquestación: db (postgis), backend, frontend
├── .env.example                    # Variables: BD, JWT, ORS_API_KEY, CORS_ORIGINS
├── Makefile                        # atajo: make up / seed / test / train / demo-reset
├── README.md                       # Instalación en 5 comandos + capturas
├── database/
│   ├── 01_schema_postgis.sql       # DDL completo (S08)
│   ├── 02_seed_escenario_06am.sql  # Escenario Jueves 06:00 (S09)
│   ├── 03_verificacion.sql         # Consultas de demo (S09.2)
│   └── demo_06am.sql               # pg_dump de respaldo de demo
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt            # versiones fijadas
│   ├── alembic/                    # migraciones (env.py + versions/)
│   ├── app/
│   │   ├── main.py                 # app, middlewares (seguridad, CORS, rate limit), routers
│   │   ├── core/                   # config.py (pydantic-settings), seguridad.py (JWT/bcrypt), bd.py (engine async)
│   │   ├── models/                 # ORM + GeoAlchemy2 (S08)
│   │   ├── schemas/                # Pydantic DTOs (S10)
│   │   ├── repositories/           # acceso a datos (SQL/PostGIS)
│   │   ├── services/               # lógica de negocio + emisión de eventos WS
│   │   ├── routers/                # auth, incidentes, zonas, albergues, vias, familias,
│   │   │                           # inventario, alertas, kpis, meteorologia, analitica, health
│   │   ├── ws/                     # connection_manager.py
│   │   ├── ml/                     # entrenar.py, servicio_ia.py, datos_entrenamiento.csv, modelo.joblib
│   │   └── seed.py                 # usuarios demo idempotentes
│   └── tests/                      # pytest (S18.2)
├── frontend/
│   ├── Dockerfile                  # build multi-stage: node -> nginx
│   ├── nginx.conf                  # serve SPA + proxy /api y /ws al backend
│   ├── package.json / tsconfig.json / vite.config.ts (PWA)
│   ├── public/                     # manifest.webmanifest, iconos, robots
│   └── src/
│       ├── main.tsx / App.tsx      # rutas protegidas por rol (react-router)
│       ├── styles/                 # tokens.css (variables S13) + tailwind.config
│       ├── lib/                    # api.ts (axios/fetch con interceptor JWT), ws.ts (reconexión), geo.ts, offline.ts (IndexedDB)
│       ├── stores/                 # Zustand: sesión, conexión, tema, capas
│       ├── components/             # ui/ (botones, badges, tarjetas) + map/ (capas, leyenda, popups) + layout/ (sidebar, topbar, reló)
│       ├── pages/                  # Login, MapaRiesgos, Reportar, PanelCOE, AlberguesRutas, FamiliasAyuda, AnaliticaIA, MisReportes
│       └── hooks/                  # useGeoLocation, useOnlineStatus, useWebSocket, useKpis
├── docs/
│   ├── arquitectura.md             # diagrama Mermaid S06 + ADRs + diagrama de componentes (entregable 2)
│   ├── modelo-datos.md             # DER + diccionario (entregable 3)
│   ├── api.md                      # contrato S10 (entregable 6)
│   ├── manual-usuario.md           # guía con capturas por rol (entregable 7)
│   ├── despliegue.md               # S20 (entregable 7)
│   └── seguridad.md                # S14 resumido (entregable 7)
└── scripts/
    ├── demo_reset.sh               # re-siembra el escenario en 20 s
    └── tunel_demo.sh               # levanta Cloudflare Tunnel con URL estable
```

---

# SECCIÓN S20 — DESPLIEGUE: DOCKER COMPOSE + TÚNEL PARA LA DEMO (Y VPS OPCIONAL)

## 20.1. docker-compose.yml de referencia

```yaml
services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: esmeraldas
      POSTGRES_USER: resiliente
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d   # ejecuta 01 y 02 al primer arranque
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U resiliente -d esmeraldas"]
      interval: 5s
      timeout: 5s
      retries: 10
    ports: ["5432:5432"]

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://resiliente:${DB_PASSWORD}@db:5432/esmeraldas
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      ORS_API_KEY: ${ORS_API_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      db: { condition: service_healthy }
    command: sh -c "python app/seed.py && alembic upgrade head || true; uvicorn app.main:app --host 0.0.0.0 --port 8000"
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request;urllib.request.urlopen('http://localhost:8000/api/health')"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports: ["8000:8000"]

  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["8080:80"]

volumes:
  pgdata:
```

`.env.example`: `DB_PASSWORD=`, `JWT_SECRET=` (32+ chars), `JWT_REFRESH_SECRET=`, `ORS_API_KEY=` (opcional), `CORS_ORIGINS=http://localhost:8080,https://TU-TUNEL.trycloudflare.com`.

## 20.2. Túnel público para la Demo Day (URL real desde cualquier red)

Opción A — **Cloudflare Tunnel rápido (sin cuenta):**

```bash
cloudflared tunnel --url http://localhost:8080
# imprime https://XXXX.trycloudflare.com → agrégalo a CORS_ORIGINS y reinicia backend
```

Opción B — **ngrok:** `ngrok http 8080 --host-header="localhost:8080"`.
Opción C — **Túnel estable con cuenta Cloudflare gratuita** (recomendada para no depender de URL aleatoria): crear tunnel nombrado, `cloudflared tunnel login`, DNS `demo.esmeraldasresiliente.com` apuntando al túnel, config.yml con `service: http://localhost:8080`.

Con el túnel activo el tráfico es HTTPS/WSS de extremo a extremo (las cabeceras HSTS de S14.4 se activan aquí) y el jurado puede abrir la plataforma desde su propio teléfono mediante el QR.

## 20.3. VPS opcional (post-hackathon / continuidad)

Cualquier VPS con Docker (DigitalOcean, Hetzner, Contabo) o una VM institucional de la UTLVTE: `git clone` + `cp .env.example .env` (llenar secretos) + `docker compose up -d --build` + túnel o DNS con proxy inverso nginx y Let's Encrypt. Documenta esta ruta en `docs/despliegue.md` como evidencia de viabilidad y proyección territorial.

## 20.4. Protocolo de cierre y code freeze

1. Tag `v1.0-demo` en git el día antes de la presentación (con `git tag -a v1.0-demo -m "Demo Day"`).
2. Ejecutar `scripts/demo_reset.sh` (re-siembra el escenario) y `make test` completo.
3. Grabar video de respaldo (S18.4) y verificar el dump.
4. Congelar cambios: a partir de ahí solo fixes bloqueantes documentados en el commit.

---
# SECCIÓN S21 — CHECKLIST DE LOS 8 ENTREGABLES OFICIALES

| N.º | Entregable | Estándar de calidad exigido | Dónde vive |
|---|---|---|---|
| 1 | **Prototipo funcional** | App web operativa con los 6 módulos (MoSCoW S03.3), demo en vivo del escenario sin errores | `docker compose up -d` + URL del túnel |
| 2 | **Arquitectura de software** | Diagrama de componentes + flujo de información de las 4 capas + ADRs | `docs/arquitectura.md` (S06) |
| 3 | **Modelo de datos** | DER geoespacial con tablas operativas y geometrías, actualizado al esquema real | `docs/modelo-datos.md` (S08) |
| 4 | **Base de datos** | PostgreSQL+PostGIS poblada con el escenario completo; consultas de verificación ejecutables | `database/` (S08-S09) |
| 5 | **Componente geográfico** | Mapa interactivo con incidentes, zonas de riesgo, semáforo, ríos, vías y albergues | Módulo M1/M4 en la app |
| 6 | **Servicios de integración** | APIs REST documentadas + WebSocket en tiempo real, con seguridad JWT/RBAC | `docs/api.md` (S10) |
| 7 | **Documentación técnica** | Descripción, justificación del stack, guía de despliegue y manual de usuario con capturas reales | `docs/` completo |
| 8 | **Presentación demostrativa** | Pitch de 5 minutos + demo en vivo del escenario "Jueves 06:00" respondiendo las 8 preguntas | Guion S22 |

**Regla de oro del cierre:** cada entregable debe poder abrirse/verse en 30 segundos por un miembro del equipo que no lo construyó (prueba cruzada antes del code freeze).

---

# SECCIÓN S22 — PITCH DE DEMO DAY (5 MINUTOS CRONOMETRADOS) + Q&A ANTICIPADO

## 22.1. Estructura oficial sugerida por el reto (síguela exacta)

**0:00-0:45 — Problema y alcance.** "El Niño mantiene a Esmeraldas en alerta roja real: 5.882 personas afectadas solo en el cantón Esmeraldas según el informe SNGR N.º 42 de octubre. En enero de 2024 el Teaone inundó 26 barrios en una sola noche. La pregunta del reto es cómo identificar zonas vulnerables, reportar emergencias y coordinar la respuesta. Nuestra respuesta: Esmeraldas Resiliente, con los 6 módulos funcionando hoy."

**0:45-1:30 — Arquitectura y datos.** Diagrama de 4 capas en una diapositiva: React + Leaflet → FastAPI con JWT y WebSockets → PostgreSQL/PostGIS, todo en Docker. Frase clave: "toda la lógica espacial vive en PostGIS: ST_Within para zonificar, ST_Distance para evacuar, y las consultas las ejecutamos en vivo ante el jurado". Mencionar el uso de APIs gratuitas (Open-Meteo, OSM) y de fuentes oficiales (INAMHI/SNGR).

**1:30-4:15 — Demo en vivo (40 puntos combinados).** Ejecutar el guion S15.3 completo. Reglas: dos dispositivos preparados, cuenta atrás visible, si algo se demora 10 segundos, narrar y saltar.

**4:15-5:00 — Cierre e impacto.** Las 8 preguntas respondidas en 20 segundos (tabla 15.2 proyectada); hoja de ruta de continuidad (S20.3: VPS institucional, datos oficiales, investigación aplicada UTLVTE); terminar con: **«Programar hoy para proteger vidas mañana»**.

## 22.2. Preguntas probables del jurado (respuestas preparadas de 20 segundos)

| Pregunta | Respuesta base |
|---|---|
| ¿Qué seguridad aplicaron? | Usar la respuesta S14.7 textual. |
| ¿Por qué PostGIS y no calcular en el navegador? | El documento oficial del reto recomienda PostGIS; centralizar la lógica espacial garantiza integridad, escala y auditoría; demostrar ST_Within en vivo. |
| ¿Cómo evitan duplicar reportes sincronizados offline? | uuid_cliente único por reporte con ON CONFLICT DO NOTHING: idempotencia real (demostrarlo recargando). |
| ¿La IA reemplaza el criterio de las autoridades? | No: ordena una cola con un score explicable y con métricas visibles; incluye disclaimer experimental; la decisión sigue siendo humana (requisito del reto). |
| ¿De dónde salen los datos? | Contexto real con fuentes citadas (SNGR, INAMHI, prensa local); el operativo de demostración está etiquetado DATO_SIMULADO; los servicios oficiales se integran mediante boletines públicos respetando sus condiciones. |
| ¿Qué pasa si se cae la conexión en plena emergencia? | El módulo ciudadano funciona offline-first con IndexedDB y sincroniza solo; el COE tiene fallback por polling si el WebSocket cae (reconexión con backoff). |
| ¿Cómo protegerían los datos de las familias? | LOPDP: minimización, seudonimización en exposición, acceso por roles, auditoría de accesos (S14.6). |
| ¿Puede seguir creciendo el proyecto? | Sí: despliegue en VPS institucional, incorporación de capas oficiales del GAD/SNGR, integración de sensores hidrométricos INAMHI y validación en campo (etapa post-hackathon del reto). |
| ¿Por qué web y no app nativa? | El reto exige aplicativo accesible en campo: una PWA instalable funciona en cualquier teléfono sin tiendas de apps ni permisos de instalación, y unifica el esfuerzo del equipo. |
| ¿Cuánto soporta el sistema? | Diseñado para la escala de un COE provincial: pool de conexiones, índices GiST espaciales y paginación; documentado en RNF-02. |

---

# SECCIÓN S23 — PROHIBICIONES, ANTI-PATRONES Y DEFINITION OF DONE

## 23.1. Prohibiciones absolutas (violaciones = rechazo del entregable)

1. **Emojis en cualquier capa del producto** (UI, código, comentarios, commits, docs) — regla S01-1.
2. **Datos inventados presentados como reales.** Todo dato contextual no listado en S02 debe etiquetarse `DATO_SIMULADO`.
3. **Credenciales o secretos en el código o el repositorio** (`.env` fuera de `.gitignore`, keys en el frontend).
4. **Placeholders de cualquier tipo:** `TODO`, `FIXME`, "aquí va", `lorem ipsum`, secciones vacías, botones muertos sin estado.
5. **Librerías o servicios de pago**, con tarjeta o con licencia restrictiva.
6. **Presentarse como canal oficial de emergencia** o sustituir al ECU 911/SNGR (S01-5).
7. **SQL concatenado con f-strings** o cualquier construcción inyectable (S14-A03).
8. **Endpoint de escritura sin autenticación** o sin control de rol (S14.2).
9. **"Funciona en mi máquina" sin Docker**: todo debe correr con `docker compose up -d`.
10. **Presentar la IA como pronóstico oficial** (requisito del documento del reto).

## 23.2. Anti-patrones de código a auditar antes del freeze

- Lógica de negocio dentro de routers (debe vivir en services) o SQL fuera de repositories.
- Componentes React de más de 250 líneas sin extraer subcomponentes; props sin tipar; `any` en TypeScript.
- `useEffect` con dependencias faltantes; llamadas HTTP sin manejo de error ni estado de carga.
- Estados de UI sin feedback (clic sin respuesta): todo botón tiene loading/éxito/error.
- Nombres en español/inglés mezclados sin criterio (identificadores técnicos en inglés, semántica de negocio en español).
- Peticiones en cascada cuando pueden ir en paralelo; re-render de capas Leaflet innecesario.

## 23.3. Definition of Done global (el checklist final antes de la Demo Day)

**Infraestructura**
- [ ] `docker compose up -d` desde cero funciona en una máquina limpia en < 5 min.
- [ ] `.env.example` completo y README con 5 comandos de arranque.

**Funcional**
- [ ] Checklist S18.1 al 100% (incluidas las pruebas de seguridad).
- [ ] Guion de demo S15.3 ensayado 3 veces sin fallas.
- [ ] Las 8 preguntas oficiales respondibles en vivo desde la app (tabla 15.2).

**Calidad**
- [ ] Cero placeholders (buscar `TODO|FIXME|XXX|lorem` en todo el repo).
- [ ] Cero emojis (auditar con búsqueda regex de rangos Unicode de emoji).
- [ ] `npm audit` / `pip-audit` sin críticas; linting limpio.
- [ ] Pruebas pytest/Vitest de S18.2 en verde.

**Entregables**
- [ ] Los 8 entregables de S21 verificables en 30 segundos cada uno.
- [ ] docs/ completa: arquitectura, modelo de datos, API, seguridad, despliegue y manual con capturas.
- [ ] Tag v1.0-demo + dump + video de respaldo + QR del túnel impresos.

**Presentación**
- [ ] Pitch de 5 minutos cronometrado (menos es más).
- [ ] Q&A de S22.2 ensayado por todo el equipo (cualquiera debe poder responder).
- [ ] Cierre con el lema institucional.

---

**FIN DEL PROMPT MAESTRO — Construye con rigor, prueba con crueldad, presenta con orgullo. Esmeraldas te necesita.**
