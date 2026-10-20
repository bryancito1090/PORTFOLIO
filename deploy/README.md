# Guía de Despliegue en Producción: Backend .NET, MySQL & Cloudflare Tunnel

Este directorio contiene la orquestación completa para desplegar el backend (.NET 8/9 Clean Architecture) y la base de datos MySQL 8.0 en tu servidor VPS de Oracle Cloud (`srv-personal-core`), exponiéndola de forma segura a través de **Cloudflare Zero Trust Tunnel** sin abrir puertos directos en el firewall.

---

## 1. Arquitectura de Despliegue

```
                 [Internet / Visitantes]
                           │
                           ▼
          [Cloudflare Edge Network & WAF]
                           │  (Túnel cifrado WireGuard / QUIC)
                           ▼
             [cloudflared (Tunnel Daemon)]
                           │  (Red interna de Docker: portfolio-network)
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [portfolio_api]             [portfolio_n8n]
    (.NET 8 Kestrel :8080)       (n8n Engine :5678)
             │
             ▼
    [portfolio_mysql]
    (MySQL 8.0 :3306)
```

---

## 2. Preparación en el VPS (Oracle Cloud)

### Paso 2.1: Navegar al directorio del proyecto
Conéctate por SSH a tu VPS y clona o actualiza el repositorio:

```bash
# Si es la primera vez:
cd /opt  # o tu directorio preferido, e.g. ~/portfolio
git clone https://git.bryan-bano.com/Bryan.bano/PORTFOLIO.git
cd PORTFOLIO

# Si ya tienes el repositorio, actualiza la rama develop:
git checkout develop
git pull origin develop
```

### Paso 2.2: Configurar Variables de Entorno (`.env`)
Copia la plantilla de entorno:

```bash
cd deploy
cp .env.example .env
```

Edita `.env` con tu editor preferido (`nano .env` o `vim .env`):
- **`DB_ROOT_PASSWORD`**: Genera una contraseña segura para el usuario root de MySQL.
- **`DB_PASSWORD`**: Genera una contraseña para el usuario `portfolio_user`.
- **`JWT_SECRET_KEY`**: Genera una clave criptográfica de al menos 32 caracteres ejecutando:
  ```bash
  openssl rand -base64 48
  ```
- **`CLOUDFLARE_TUNNEL_TOKEN`**: Pega aquí el token de tu túnel de Cloudflare (obtenido en el Paso 3).

---

## 3. Configuración en el Panel de Cloudflare Zero Trust

Para que `https://api.bryan-bano.com` enrute automáticamente al backend en tu VPS:

1. Ingresa a **[Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)**.
2. Ve a **Networks** -> **Tunnels**.
3. Selecciona tu túnel activo (por ejemplo el que ya usas para `git.bryan-bano.com` o `n8n.bryan-bano.com`), o haz clic en **Create a Tunnel** si prefieres uno independiente.
4. En la pestaña **Public Hostnames**, haz clic en **Add a public hostname**:
   - **Subdomain:** `api`
   - **Domain:** `bryan-bano.com`
   - **Path:** (dejar vacío)
   - **Type:** `HTTP`
   - **URL:** 
     - Si usas el contenedor `portfolio_tunnel` de este compose: `portfolio-api:8080`
     - Si ya tienes `cloudflared` corriendo como servicio en el host o en otro contenedor compartido: `localhost:8080` (o `127.0.0.1:8080`)
5. Haz clic en **Save hostname**.

---

## 4. Iniciar los Servicios con Docker Compose

Desde la carpeta `deploy/` del VPS, ejecuta:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### ¿Qué hace este comando automáticamente?
1. **Compila la API .NET en Release:** Usa el `Dockerfile` multi-stage, compila con el SDK de .NET y genera el contenedor ligero en `aspnet:8.0`.
2. **Inicia MySQL 8.0:** Crea el volumen persistente `portfolio_mysql_data` y ejecuta el script `init-db.sql` con los esquemas y datos iniciales (proyectos, habilidades y récords).
3. **Sincroniza el Esquema de EF Core:** Al arrancar, el backend ejecuta `EnsureCreated()` para verificar y garantizar que todas las tablas y relaciones estén en sincronía.
4. **Levanta el Cloudflare Tunnel:** Conecta la API a la red perimetral de Cloudflare con HTTPS y SSL automáticos.

---

## 5. Verificación y Pruebas en Vivo

Una vez iniciado el contenedor, ejecuta las siguientes comprobaciones:

### 5.1 Verificar estado de los contenedores
```bash
docker compose -f docker-compose.prod.yml ps
```
Deberías ver `portfolio_api`, `portfolio_mysql` (healthy) y `portfolio_tunnel` (opcional) en estado `Up`.

### 5.2 Probar la API localmente en el VPS
```bash
curl http://localhost:8080/
# Respuesta esperada:
# {"service":"Portfolio Backend API","status":"Online","version":"1.0.0","docs":"/swagger"}
```

### 5.3 Probar la API pública con SSL
```bash
curl https://api.bryan-bano.com/
curl https://api.bryan-bano.com/api/v1/telemetry
```

### 5.4 Documentación Swagger en Producción
Abre en tu navegador:
```
https://api.bryan-bano.com/swagger
```

---

## 6. Mantenimiento y Comandos Útiles

- **Ver logs de la API en tiempo real:**
  ```bash
  docker logs -f portfolio_api
  ```
- **Ver logs de la base de datos:**
  ```bash
  docker logs -f portfolio_mysql
  ```
- **Reiniciar la API tras una actualización de código:**
  ```bash
  git pull origin develop
  docker compose -f docker-compose.prod.yml up -d --build portfolio-api
  ```
- **Realizar backup de la base de datos MySQL:**
  ```bash
  docker exec portfolio_mysql mysqldump -u portfolio_user -p portfolio_db > backup_$(date +%F).sql
  ```
