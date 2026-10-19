# BÓVEDA DE CONOCIMIENTO Y ARQUITECTURA // PORTAFOLIO BRYAN BAÑO
> *Sistema Central de Documentación, Arquitectura Limpia, Infraestructura Cloud, Forgejo DevOps Hub y Hoja de Ruta de Ingeniería.*

---

## 1. Visión y Propósito del Proyecto

Este proyecto no es una simple página web estática ni una plantilla comercial genérica ("AI Slop"). Es una **plataforma de software integral, de grado de producción y alta ambición técnica**, concebida para:

1. **Demostrar Maestría Técnica Real**: Reflejar un dominio profundo de **Clean Architecture (.NET 8/9 y Angular)**, patrones de diseño enterprise (CQRS, Inversión de Dependencias, Ports & Adapters) y código optimizado para 60 FPS en la Web Platform.
2. **Experiencia de Usuario Inolvidable (Cyber-Zen & Retro Elegance)**: Una fusión armónica entre el minimalismo y serenidad del **Zen Japonés (Wabi-Sabi, Ma, Kanso, Kintsugi)**, el misterio del **Dark High-Contrast** y la nostalgia táctil del **Retro Computing** (estaciones de trabajo Unix, PC-98, terminal Linux interactiva, sistema operativo vintage ZenOS).
3. **Plataforma Fullstack e Infraestructura Auto-alojada**: Integración de un backend en C#/.NET 9 con persistencia en MySQL, agentes de IA orquestados con **n8n + Gemini**, y administración del código en un servidor propio **Forgejo** (`https://git.bryan-bano.com/`) alojado en **Oracle Cloud (Rocky Linux)** expuesto mediante **Cloudflare Zero Trust** y orquestación con contenedores livianos.
4. **Bóveda Viva de Conocimiento y Aprendizaje**: Un repositorio vivo donde se documenta lo construido, las decisiones arquitectónicas (ADRs), y que servirá de base para incorporar continuamente nuevas tecnologías y conocimientos que Bryan vaya dominando.

---

## 2. Mapa de Contenidos de la Bóveda (MOC - Map of Content)

La bóveda está estructurada en módulos independientes y altamente detallados para facilitar la navegación y la expansión futura:

```
vault/
├── README.md                                    <- Este documento (Índice Maestro)
│
├── 01-arquitectura/                             <- Fundamentos y directrices de ingeniería
│   ├── 01-vision-general.md                     <- Filosofía Cyber-Zen, Clean Arch y Ponytail
│   ├── 02-frontend-angular.md                   <- Angular 20, Signals reactivos, Puertos y Adaptadores
│   ├── 03-backend-dotnet.md                     <- Especificación Clean Architecture .NET 9, CQRS, EF Core
│   ├── 04-ui-ux-design-system.md                <- Sistema de diseño, Sumi-e, Kintsugi, Canvas 2D, Web Audio
│   └── 05-gitflow-empresarial-forgejo.md        <- Estándar GitFlow empresarial, ramas protegidas y PRs en Forgejo
│
├── 02-estado-actual/                            <- Diagnóstico e inventario del código existente
│   ├── 01-inventario-frontend.md                <- Análisis exhaustivo módulo por módulo del cliente web
│   ├── 02-base-de-datos-mysql.md                <- Esquema relacional 3NF, tablas, relaciones y seeds
│   ├── 03-automatizacion-ia-n8n.md              <- Agente de IA, flujos n8n, Gemini y Cloudflare Tunnels
│   └── 04-diagnostico-backend.md                <- Estado actual de src/backend y brechas a cubrir
│
├── 03-infraestructura-oracle-cloud/             <- Estrategia Cloud, Forgejo y Despliegue
│   ├── 01-oracle-cloud-always-free.md           <- Servidor real Rocky Linux (132.145.165.230), devops/ y services/
│   ├── 02-red-seguridad-cloudflare.md           <- Túneles Zero Trust, SSL, WAF y subdominios
│   ├── 03-ci-cd-despliegue.md                   <- Automatización de integración y entrega continua (CI/CD)
│   ├── 04-forgejo-devops-hub.md                 <- Forgejo como Hub DevOps (app.ini, act_runner, registry)
│   └── 05-orquestacion-k3s-despliegue.md        <- Contenedores livianos con k3s (Kubernetes) vs Docker Compose
│
├── 04-conocimientos-y-proyectos/                <- Trayectoria profesional y casos de estudio
│   ├── 01-perfil-bryan.md                       <- Perfil profesional, formación EPN, certificaciones
│   ├── 02-proyectos-reales.md                   <- Análisis técnico: Ammi, Vacaciones RRHH, Titulación, SIPLECE
│   └── 03-competencias-tecnicas.md              <- Matriz de habilidades y tecnologías dominadas
│
├── 05-roadmap-y-futuro/                         <- Plan de crecimiento y nuevas implementaciones
│   ├── 01-roadmap-ambicioso.md                  <- Fases de desarrollo para convertirlo en proyecto flagship
│   ├── 02-ideas-potenciadoras.md                <- Módulos innovadores (telemetría en vivo, diagramas interactivos)
│   └── 03-nuevas-tecnologias.md                 <- Marco de trabajo para documentar nuevos aprendizajes
│
└── 06-bitacora-adr/                             <- Registro de decisiones arquitectónicas
    └── 01-registro-decisiones-tecnicas.md       <- ADRs: Signals vs RxJS, Canvas vs Libs, n8n vs Custom Backend
```

---

## 3. Resumen Rápido del Ecosistema Tecnológico

| Capa / Dominio | Tecnología Principal | Propósito y Características |
|---|---|---|
| **Hub Git & DevOps** | [Forgejo](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/04-forgejo-devops-hub.md) (`https://git.bryan-bano.com/`) | Servidor Git empresarial auto-alojado en el VPS de Oracle Cloud con runners de CI/CD (`act_runner`), Container Registry y gestión de Pull Requests con GitFlow. |
| **Frontend Web** | [Angular 20.3.0](file:///home/bryan/Projects/PORTFOLIO/src/frontend/package.json) | Standalone Components, Angular Signals nativos, `ChangeDetectionStrategy.OnPush`, Control Flow moderno (`@if`, `@for`). Cero librerías pesadas. |
| **Gráficos & Sonido** | HTML5 Canvas 2D + Web Audio API | Secuencia Thinkpad 240 frames con lerp, Buscaminas retro, Lluvia digital matrix y efectos mecánicos sintetizados a 0 KB. |
| **Backend API** | [.NET 8/9 (C#)](file:///home/bryan/Projects/PORTFOLIO/vault/01-arquitectura/03-backend-dotnet.md) | Clean Architecture estricta, CQRS con MediatR, FluentValidation, ProblemDetails RFC 7807, Rate Limiting nativo. |
| **Persistencia** | [MySQL 8.0 / InnoDB](file:///home/bryan/Projects/PORTFOLIO/database/schema.sql) | Esquema relacional en 3FN, índices optimizados, RBAC para Bryan y tablas para proyectos, habilidades, firmas y contactos. |
| **Agente de IA** | [n8n](file:///home/bryan/Projects/PORTFOLIO/automation/n8n/docker-compose.yml) (`https://n8n.bryan-bano.com/`) | Orquestador de flujos en el servidor Rocky Linux (`~/services/n8n`), sanitización de entradas, sesión y base de conocimiento de Bryan. |
| **Servidor Host** | [Oracle Cloud VPS (Rocky Linux)](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/01-oracle-cloud-always-free.md) | Instancia Compute en `us-ashburn-1` (`rocky@132.145.165.230`), administrando `~/devops/` y `~/services/`. |
| **Orquestación** | [k3s (Kubernetes liviano)](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/05-orquestacion-k3s-despliegue.md) o Docker Compose | Despliegue de microservicios con aislamiento por namespaces (`dev` y `prod`), rolling updates y consumo mínimo de RAM. |
| **Red & Seguridad** | [Cloudflare Zero Trust (Tunnels)](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/02-red-seguridad-cloudflare.md) | Ingress HTTPS seguro para `git`, `n8n` y `api` sin abrir puertos entrantes en el firewall de Oracle Cloud, protección anti-DDoS y WAF. |
| **Filosofía** | [Ponytail](file:///home/bryan/Projects/PORTFOLIO/.agents/skills/ponytail-review/SKILL.md) | Soluciones más limpias y directas, estándar antes de dependencias, YAGNI, KISS, rendimiento extremo. |

---

## 4. Cómo Navegar y Utilizar esta Bóveda

1. Para consultar el **estándar GitFlow y reglas de Pull Request para Forgejo**: revisa [`01-arquitectura/05-gitflow-empresarial-forgejo.md`](file:///home/bryan/Projects/PORTFOLIO/vault/01-arquitectura/05-gitflow-empresarial-forgejo.md).
2. Para conocer la **infraestructura real en el servidor Rocky Linux**: revisa [`03-infraestructura-oracle-cloud/01-oracle-cloud-always-free.md`](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/01-oracle-cloud-always-free.md).
3. Para configurar **Forgejo Actions, act_runner y Container Registry**: revisa [`03-infraestructura-oracle-cloud/04-forgejo-devops-hub.md`](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/04-forgejo-devops-hub.md).
4. Para la arquitectura de **contenedores livianos k3s**: revisa [`03-infraestructura-oracle-cloud/05-orquestacion-k3s-despliegue.md`](file:///home/bryan/Projects/PORTFOLIO/vault/03-infraestructura-oracle-cloud/05-orquestacion-k3s-despliegue.md).
