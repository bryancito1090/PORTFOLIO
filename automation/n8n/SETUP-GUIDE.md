# Guía de Despliegue y Puesta en Producción: n8n + Gemini Gratuito + Cloudflare

Esta guía contiene los pasos exactos para tener tu agente conversacional funcionando en producción 100% gratis.

---

## Paso 1: Obtener la API Key Gratuita de Google Gemini
1. Ingresa en [Google AI Studio](https://aistudio.google.com/).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en **"Get API key"** -> **"Create API key in new project"**.
4. Copia tu API key generada.
   - *Nota*: La capa gratuita de Gemini 2.0 Flash / 1.5 Flash incluye **15 RPM (peticiones por minuto)** y **1,500 peticiones diarias gratis**, con 1,000,000 de tokens de contexto, lo cual cubre de sobra el tráfico de tu portafolio.

---

## Paso 2: Despliegue de n8n en Oracle Cloud Always Free (o Localmente)

### Opción A: En tu VPS Gratuito de Oracle Cloud (Recomendado 24/7)
1. Inicia sesión en tu consola de Oracle Cloud (Always Free).
2. Crea una instancia Compute gratuita (ej. Ubuntu 24.04 ARM Ampere o AMD x86 micro).
3. Instala Docker y Docker Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```
4. Clona o copia la carpeta `automation/n8n/` en tu servidor.
5. Inicia el contenedor:
   ```bash
   cd automation/n8n
   docker compose up -d
   ```
6. n8n estará corriendo en el puerto interno `5678`.

### Opción B: Probar primero en tu máquina local
1. En tu terminal (Arch Linux):
   ```bash
   cd /home/bryan/Projects/PORTFOLIO/automation/n8n
   docker compose up -d
   ```
2. Abre tu navegador en `http://localhost:5678`.

---

## Paso 3: Conectar Cloudflare Tunnel (SSL Gratuito y Sin Puertos Abiertos)
Dado que tu dominio y frontend ya están en Cloudflare:
1. Ve a [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/) -> **Networks** -> **Tunnels**.
2. Haz clic en **"Create a Tunnel"** (nombre: `portfolio-n8n`).
3. Selecciona **Docker** y copia el token provisto (`eyJh...`).
4. En el archivo `automation/n8n/.env` (o directamente en tu servidor):
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJh...tu_token_aqui...
   N8N_PUBLIC_WEBHOOK_URL=https://chat-api.tudominio.com/
   ```
5. En la pestaña **Public Hostname** del túnel en Cloudflare:
   - **Subdomain**: `chat-api` (o `n8n`)
   - **Domain**: Tu dominio gestionado en Cloudflare (ej. `bryanbano.com`)
   - **Service**: `HTTP` -> `n8n:5678` (o `localhost:5678` si ejecutas cloudflared como servicio).
6. ¡Listo! Tu n8n tendrá URL pública segura `https://chat-api.tudominio.com` con HTTPS y protección anti-DDoS sin tocar puertos de router.

---

## Paso 4: Importar el Flujo de Trabajo en n8n
1. Abre tu panel de n8n (`http://localhost:5678` o tu subdominio de Cloudflare).
2. Crea tu cuenta de administrador de n8n en el primer inicio.
3. En el menú de la izquierda, haz clic en **"Workflows"** -> botón de **"..."** (arriba a la derecha) -> **"Import from File"**.
4. Selecciona el archivo `portfolio-chat-workflow.json`.
5. En el nodo **"Google Gemini Chat Model"**:
   - Haz clic en **Credentials** -> **Create New**.
   - Pega tu API Key obtenida en el Paso 1.
6. Haz clic en **Save** y enciende el interruptor **"Active"** (arriba a la derecha).
7. La URL de tu webhook será:
   `https://chat-api.tudominio.com/webhook/portfolio-chat` (o `http://localhost:5678/webhook/portfolio-chat` en local).

---

## Paso 5: Probar el Webhook desde la Terminal
Puedes verificar que n8n responde correctamente antes de probar el frontend ejecutando:
```bash
curl -X POST http://localhost:5678/webhook/portfolio-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es tu stack principal Bryan?", "sessionId": "test-123"}'
```
Respuesta esperada:
```json
{
  "reply": "Hola. Mi stack principal es .NET 8/9 con Clean Architecture y CQRS en backend, y Angular con Signals en frontend...",
  "sessionId": "test-123"
}
```
