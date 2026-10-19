# 01 // ROADMAP AMBICIOSO — EVOLUCIÓN A PROYECTO FLAGSHIP
> *Plan Estratégico por Fases para Convertir el Portafolio en una Referencia de la Industria.*

---

## 1. Visión Estratégica

Para que este proyecto alcance el estatus de **Portafolio Flagship de Nivel Principal**, debe trascender el concepto tradicional de "sitio web personal". Debe operar como un **laboratorio de ingeniería de software en vivo**, demostrando en tiempo real capacidades de arquitectura, seguridad, observabilidad y cloud computing.

```
       [ FASE 1: NÚCLEO BACKEND .NET ]
                      │
                      ▼
       [ FASE 2: INTEGRACIÓN FULLSTACK REAL ]
                      │
                      ▼
       [ FASE 3: DESPLIEGUE EN ORACLE CLOUD + CLOUDFLARE ]
                      │
                      ▼
       [ FASE 4: PANEL DE ADMINISTRACIÓN RBAC ]
                      │
                      ▼
       [ FASE 5: OBSERVABILIDAD Y TELEMETRÍA EN VIVO ]
                      │
                      ▼
       [ FASE 6: LABS AVANZADOS DE SEGURIDAD & IA ]
```

---

## 2. Desglose Detallado de Fases

### Fase 1: Inicialización del Núcleo Backend .NET 9 Clean Architecture
- [ ] Crear solución `Portfolio.sln` con las cuatro capas (`Domain`, `Application`, `Infrastructure`, `WebApi`).
- [ ] Implementar entidades de dominio C# puro basadas en [`database/schema.sql`](file:///home/bryan/Projects/PORTFOLIO/database/schema.sql).
- [ ] Configurar `PortfolioDbContext` con Pomelo MySQL y Fluent API.
- [ ] Implementar CQRS con MediatR para `Projects`, `Skills`, `Interactive` y `Inquiries`.
- [ ] Configurar `ValidationBehavior` con FluentValidation y middleware global RFC 7807 (`ProblemDetails`).
- [ ] Implementar Rate Limiter nativo (`AddRateLimiter`) con política de 30 req/min por IP.

### Fase 2: Integración Fullstack y Desacoplamiento de Mocks
- [ ] Conectar el componente de proyectos en Angular con el puerto `HttpProjectRepository`.
- [ ] Conectar el comando `guestbook sign` de la terminal para persistir mensajes reales en la tabla `interactive_messages` de MySQL.
- [ ] Conectar el formulario de la sección de contacto con `POST /api/v1/inquiries` para registrar leads comerciales.
- [ ] Implementar el endpoint `GET /api/v1/interactive/telemetry` en el backend para reportar versión de .NET, tiempo de actividad y latencia real a la terminal.

### Fase 3: Despliegue en el Servidor Oracle Cloud + Cloudflare Zero Trust
- [ ] Crear el `Dockerfile` multi-stage optimizado para `Portfolio.WebApi`.
- [ ] Armar el archivo maestro `docker-compose.prod.yml` que integre MySQL, Backend .NET, n8n y Cloudflared.
- [ ] Desplegar los contenedores en el servidor VPS de Oracle Cloud.
- [ ] Configurar el túnel Zero Trust en Cloudflare apuntando a `api.bryan-bano.com` y `n8n.bryan-bano.com`.
- [ ] Configurar Cloudflare Pages para el despliegue automático del frontend desde GitHub Actions.

### Fase 4: Panel de Administración RBAC (Backoffice Zen)
- [ ] Implementar flujo de autenticación JWT con rotación de Refresh Tokens en `AuthController`.
- [ ] Crear interfaz de backoffice minimalista protegida por guardias (`auth.guard.ts`):
  - Gestión CRUD completa de proyectos (añadir fotos, descripciones, tags).
  - Gestión de habilidades técnicas (porcentajes de dominio, categorías).
  - Bandeja de entrada privada para gestionar y responder a las consultas de contacto (`contact_inquiries`).
  - Moderación de firmas en el libro de visitas (`is_approved`).

### Fase 5: Observabilidad, Telemetría y Métricas en Tiempo Real
- [ ] Exponer métricas de salud con `Microsoft.Extensions.Diagnostics.HealthChecks`.
- [ ] Integrar **Server-Sent Events (SSE)** o WebSockets ligeros para transmitir telemetría del servidor en tiempo real (uso de CPU, consumo de memoria del VPS de Oracle, peticiones atendidas por minuto).
- [ ] Renderizar un gráfico interactivo estilo monitor de sistema Unix en la terminal o en el panel retro ZenOS.

### Fase 6: Expansión de Agentes de IA & Seguridad Proactiva
- [ ] Mejorar el agente conversacional en n8n integrando capacidades RAG (Retrieval-Augmented Generation) sobre los repositorios de GitHub de Bryan.
- [ ] Ampliar el simulador de incidentes con escenarios de análisis forense real: análisis de cabeceras HTTP en vivo, validación de certificados SSL de dominios ingresados por el usuario y comprobación de registros DNS (SPF, DKIM, DMARC).
