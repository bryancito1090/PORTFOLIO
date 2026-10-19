# 02 // RED & SEGURIDAD PERIMETRAL — CLOUDFLARE ZERO TRUST
> *Túneles Seguros (cloudflared), Enrutamiento Edge, Certificados SSL Automáticos y Protección WAF.*

---

## 1. La Estrategia Cloudflare Zero Trust

Exponer servidores domésticos o instancias cloud abriendo puertos (como 80, 443 o 22) en firewalls o listas de seguridad (Security Lists en Oracle Cloud) acarrea riesgos significativos de escaneo de vulnerabilidades, ataques de fuerza bruta y ataques DDoS.

El portafolio implementa la arquitectura **Cloudflare Tunnel (`cloudflared`)**, que revoluciona el modelo de conectividad:
1. **Conexión Exclusivamente Saliente**: El demonio `cloudflared` dentro de Docker en Oracle Cloud inicia una conexión HTTPS/gRPC cifrada hacia los servidores Edge de Cloudflare más cercanos.
2. **Cero Puertos Entrantes Abiertos**: El firewall del VPS de Oracle y las Security Lists de OCI pueden permanecer con **0 puertos de entrada (Inbound Rules vacías)**, eliminando por completo la superficie de ataque perimetral.
3. **Terminación SSL en el Edge**: Cloudflare gestiona los certificados TLS/SSL de forma automática y transparente con renovación continua.

---

## 2. Mapa de Enrutamiento de Subdominios

A través de un único túnel de Cloudflare (`portfolio_tunnel`), se enrutan las distintas partes del ecosistema mediante subdominios limpios:

```
                          [ Internet / Visitantes ]
                                      │
                                      ▼
                        [ Cloudflare Edge Network ]
                       (WAF, DDoS Shield, SSL Edge)
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       │                              │                              │
       ▼                              ▼                              ▼
https://bryan-bano.com      https://api.bryan-bano.com      https://n8n.bryan-bano.com
(Cloudflare Pages / SPA)     (Backend .NET WebApi)           (Panel & Webhooks n8n)
                                      │                              │
                                      └──────────────┬───────────────┘
                                                     │
                                            [ Cloudflare Tunnel ]
                                            (Conexión Cifrada)
                                                     │
                                                     ▼
                                          [ Servidor Oracle Cloud ]
                                          ├── backend:5000 (.NET)
                                          └── n8n:5678 (n8n Node)
```

| Subdominio | Destino Interno en Docker | Propósito |
|---|---|---|
| `bryan-bano.com` | Cloudflare Pages | Hospedaje global estático del frontend Angular compilado con CDN Edge ultrarrápido. |
| `api.bryan-bano.com` | `http://backend:5000` | Endpoints REST públicos e interactivos de .NET (.NET WebApi). |
| `n8n.bryan-bano.com` | `http://n8n:5678` | Webhooks de chat y panel administrativo de automatizaciones de IA. |

---

## 3. Configuración del Túnel en Cloudflare Zero Trust

Pasos documentados para la configuración en el panel de Cloudflare:

1. Ingresar en **Cloudflare Zero Trust** -> **Networks** -> **Tunnels**.
2. Crear un túnel con nombre `portfolio-prod`.
3. Seleccionar tipo de conector **Docker** y copiar el `TUNNEL_TOKEN`.
4. Asignar las rutas públicas (**Public Hostnames**):
   - **Hostname 1**:
     - Subdomain: `api` | Domain: `bryan-bano.com`
     - Service: `HTTP` -> `backend:5000`
   - **Hostname 2**:
     - Subdomain: `n8n` | Domain: `bryan-bano.com`
     - Service: `HTTP` -> `n8n:5678`
     - Additional Application Settings: Habilitar WebSockets si se requiere para la interfaz de n8n.

---

## 4. Políticas de Seguridad WAF y Rate Limiting en Cloudflare

Para proteger las cuotas gratuitas de Oracle Cloud y Google Gemini:
1. **Cloudflare Bot Fight Mode**: Bloqueo automático de bots maliciosos y scrapers automatizados.
2. **Rate Limiting Rule**:
   - Bloquear o desafiar con CAPTCHA si una misma dirección IP ejecuta más de 60 peticiones en 1 minuto sobre rutas `/webhook/*` o `/api/v1/interactive/*`.
3. **Regla de Países / Geobloqueo Selectivo**: Opcional, para mitigar vectores de ataque procedentes de redes con alto índice de actividad maliciosa conocida.
