# Puesta en marcha local

## Requisitos

- Node.js 20.19+ (Node 22.12+ recomendado) y npm.
- Python 3.12+ y pip para ejecutar FastAPI localmente.
- PostgreSQL con PostGIS instalado, o Docker Desktop con Docker Compose.

En este equipo PostgreSQL 18 escucha en `5432`. Compose publica PostGIS en `5433`; son dos modos de ejecución alternativos.

## Configuración

Desde PowerShell, en la raíz del repositorio:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y reemplaza los marcadores. Configura correos y contraseñas diferentes para `ADMIN` y `COE`; cada contraseña debe tener entre 12 y 72 bytes. Genera secretos JWT diferentes:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

No compartas ni subas `.env`; está excluido de Git.

Para una exposición controlada en laboratorio, activa `DEMO_MODE_ENABLED=true` en `.env`; en Compose usa la misma variable antes de levantar servicios. El valor predeterminado es `false`. El frontend muestra la opción de simulación solo con autorización del backend y el servidor vuelve a validar cada envío. No habilites DEMO en producción.

## Opción A: PostgreSQL instalado en Windows

Instala PostGIS para tu versión de PostgreSQL si todavía no aparece entre las extensiones disponibles (puedes usar Stack Builder). Luego, desde PowerShell en la raíz del proyecto:

```powershell
python -m pip install -r backend\requirements.txt
.\scripts\setup-local-postgres.ps1
```

El script solicita el usuario y la contraseña administrativa de PostgreSQL en una entrada oculta; no los guarda. Crea/actualiza la cuenta de aplicación, prepara la base y aplica el esquema PostGIS y sus datos iniciales. También ajusta la URL local de base de datos en `.env` a `127.0.0.1:5432`.

Abre dos terminales:

```powershell
# Terminal 1: FastAPI en 127.0.0.1:8000
.\scripts\start-backend.ps1

# Terminal 2: frontend
npm run dev
```

Comprueba el backend antes de iniciar sesión:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Debe responder con estado `ok`, base de datos `ok` y PostGIS `ok`. Si no lo hace, revisa el error de arranque de FastAPI. Al iniciar, FastAPI crea o actualiza las dos cuentas institucionales desde `.env`.

Los SOS públicos no requieren iniciar sesión. Requieren permiso del navegador para obtener GPS; al hacer clic, el teléfono o navegador muestra su diálogo normal de autorización. Una ubicación GPS informa la posición aproximada del dispositivo y la precisión indicada por su sensor, pero no verifica que la emergencia esté ocurriendo.

## Opción B: Docker Compose

Abre Docker Desktop, espera a que el motor esté activo y ejecuta:

```powershell
docker compose up --build
```

Compose levanta PostgreSQL 16/PostGIS 3.4, FastAPI y el frontend. La base está disponible en `localhost:5433`, la aplicación en `http://localhost:3000`, el API en `http://localhost:8000` y su documentación en `http://localhost:8000/docs`. La inicialización SQL de Docker solo se ejecuta al crear un volumen vacío; no borres volúmenes sin respaldo. Si ya tenías una base local, vuelve a ejecutar `.\scripts\setup-local-postgres.ps1`. Para un volumen Compose existente, aplica el esquema idempotente (no elimina datos) con `docker compose exec -T db psql -U esmeraldas_app -d esmeraldas_resiliente -v ON_ERROR_STOP=1 -f /migrations/01_schema_postgis.sql`; sustituye usuario/base si los personalizaste.

## pgAdmin

Para el modo local, registra un servidor con host `localhost`, puerto `5432` y las credenciales de aplicación definidas en `.env`. Para Compose, usa el puerto `5433`.

## Accesos

El backend crea únicamente las cuentas institucionales configuradas en `.env`:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `COE_EMAIL` / `COE_PASSWORD`

También se aceptan los alias `admin_sistema` y `operador_coe`. El portal ciudadano es público y no requiere una cuenta. Tras cinco intentos fallidos, el identificador queda bloqueado durante cinco minutos; además, el API limita solicitudes por IP.

Las credenciales institucionales están configuradas únicamente en el `.env` local, excluido de Git. Como fueron compartidas en esta conversación, considéralas expuestas y cámbialas antes de desplegar o usar información real.

### Acceso temporal para exposición local

Al ejecutar `npm run dev`, el frontend permite por defecto un acceso de demostración sin llamar al endpoint de login de FastAPI. En el selector de entidad COE, cualquier usuario y contraseña no vacíos permiten entrar; la sesión queda guardada solo en `sessionStorage` de esa pestaña y no se guarda la contraseña. Para desactivarlo en desarrollo, define `VITE_DEMO_AUTH_ENABLED=false`; para builds, solo se activa si se establece explícitamente `VITE_DEMO_AUTH_ENABLED=true`. Esta sesión es únicamente visual: no autoriza solicitudes protegidas del backend ni debe habilitarse en producción o en una URL pública.

### Entidades del COE

El acceso COE permite clasificar la sesión por entidad: SNGR, GAD Municipal y Provincial, Policía Nacional, Fuerzas Armadas, Bomberos, ECU 911, MSP, MIES y MTOP. El selector usa colores para distinguirlas; todas comparten las credenciales COE configuradas, como se solicitó. La selección organiza el perfil de la interfaz, pero no verifica la afiliación real del operador ni crea cuentas individuales.

La lista toma como referencia el [Manual del Comité de Operaciones de Emergencia de la Secretaría Nacional de Gestión de Riesgos](https://www.gestionderiesgos.gob.ec/manual-del-comite-de-operaciones-de-emergencia/). La composición efectiva depende del nivel del COE, el evento y las disposiciones vigentes; confirmar la nómina local con el COE de Esmeraldas antes de usarlo institucionalmente.

## Estado de integración

El inicio de sesión institucional se valida en FastAPI y el frontend mantiene el token solo en memoria; al recargar la página se vuelve al Portal Ciudadano. La interfaz limita módulos por rol y el API protege sus endpoints. Sin embargo, varios módulos siguen trabajando con datos locales del escenario y todavía no sincronizan todas sus operaciones con el backend; no interpretes esos datos como información operativa ni alertas oficiales.

### S.O.S. ciudadano, privacidad y funcionamiento offline

- El botón SOS obtiene coordenadas con la Geolocation API y pide autorización al sistema operativo/navegador en escritorio y móvil. Desplegar sobre HTTPS; `localhost` es válido para desarrollo. Si el GPS falla, no se sustituye por coordenadas de ejemplo.
- Con internet, FastAPI guarda el aviso de forma idempotente y lo publica para los dispositivos conectados. El portal actualiza el mapa cada 20 segundos. Los ciudadanos reciben coordenadas aproximadas (redondeadas); las coordenadas exactas se limitan a sesiones autenticadas COE/ADMIN.
- El aviso siempre se inicia como no verificado. Estar dentro de una zona GIS puede indicar intersección con el polígono catalogado, pero no comprueba que un evento real esté ocurriendo. La aplicación no determina perímetros o cuadras afectadas; la interfaz lo indica como “no determinado”. No reemplaza ECU 911 ni confirma despacho.
- La API limita el envío por IP y acepta UUID idempotente. Eso reduce duplicados y abuso básico, pero no prueba la identidad del ciudadano ni evita todos los reportes falsos; hace falta validación humana/operativa y protección adicional antes de una operación pública real.
- Sin internet, el SOS se conserva en `localStorage` del dispositivo y se muestra en su mapa como **pendiente local**; ninguna otra persona puede verlo hasta que haya conexión con el servidor y se sincronice. Es una limitación física de la falta de red. La app shell y recursos visitados se cachean con service worker para reabrir la interfaz; el GPS depende del dispositivo y permisos. Los mapas base de terceros no se cachean de manera exhaustiva.
- El pronóstico del portal es consultado por FastAPI a Open-Meteo y presenta modelo/proveedor, probabilidad de precipitación y hora de actualización. No se etiqueta como modelo Scikit-learn propio: no hay dataset meteorológico histórico local validado para entrenarlo y evaluarlo. La app no inventa probabilidad de tormenta ni la presenta como pronóstico oficial.
- Para mostrar la simulación en la exposición, habilita `DEMO_MODE_ENABLED=true` en `.env`, reinicia FastAPI y recarga el portal con conexión. Los avisos se guardan marcados como simulación y no deben confundirse con un incidente verdadero. Vuelve a `false` al terminar la demostración.
