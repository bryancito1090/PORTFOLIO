# 01 // REGISTRO DE DECISIONES ARQUITECTÓNICAS (ADRs)
> *Architecture Decision Records: Justificación de las Elecciones Fundamentales del Proyecto.*

---

## ADR-001: Adopción de Angular Signals como Único Gestor de Estado

- **Fecha**: 2026-08-20
- **Estado**: Aceptado
- **Contexto**:
  Se requería un mecanismo de administración de estado reactivo para coordinar múltiples vistas interactivas (Hero 3D, Terminal, Buscaminas, Chatbot). Las alternativas tradicionales en Angular incluían NgRx Store, Akita o RxJS manual con `BehaviorSubject`.
- **Decisión**:
  Utilizar exclusivamente **Angular Signals nativos** (`signal`, `computed`, `effect`) organizados en Application Stores inyectables.
- **Consecuencias**:
  - *Positivas*: Eliminación de cientos de líneas de boilerplate de acciones/reducers, cero dependencias pesadas en `package.json`, detección de cambios granular ultrarrápida a 60 FPS, curva de aprendizaje directa.
  - *Negativas*: Requiere rigor del equipo para no mutar señales directamente fuera de los métodos del store.

---

## ADR-002: Uso de HTML5 Canvas 2D Nativo para Minijuegos y Secuencias

- **Fecha**: 2026-08-22
- **Estado**: Aceptado
- **Contexto**:
  El diseño incluye un minijuego retro (Buscaminas), lluvia digital Matrix y una secuencia de fotogramas de la laptop Thinkpad. Se evaluó utilizar motores como Phaser, Pixi.js o Three.js para la totalidad de estos efectos.
- **Decisión**:
  Implementar estas características mediante la **API nativa Canvas 2D** (`CanvasRenderingContext2D`) y `requestAnimationFrame`.
- **Consecuencias**:
  - *Positivas*: Ahorro de más de 800 KB en el bundle JavaScript final, control total del ciclo de renderizado, limpieza estricta de memoria en `ngOnDestroy()` sin retención de texturas externas.
  - *Negativas*: Mayor esfuerzo inicial para escribir la lógica matemática del juego e interpolación de frames desde cero.

---

## ADR-003: Síntesis de Efectos Acústicos con Web Audio API

- **Fecha**: 2026-08-25
- **Estado**: Aceptado
- **Contexto**:
  La terminal interactiva y el sistema operativo retro requerían respuesta háptica/sonora (tecleo mecánico y confirmación de comandos). Cargar archivos `.mp3` o `.wav` generaba peticiones de red adicionales y posibles problemas de latencia de reproducción.
- **Decisión**:
  Crear [`RetroAudioService`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/application/services/retro-audio.service.ts) utilizando la **Web Audio API** nativa (`AudioContext`, osciladores senoidales y triangulares).
- **Consecuencias**:
  - *Positivas*: Cero bytes transferidos por red (0 KB de activos de audio), latencia de reproducción prácticamente nula (menos de 5ms), control paramétrico del tono y duración.
  - *Negativas*: El sonido debe activarse tras el primer gesto o interacción del usuario debido a las políticas de autoplay de los navegadores modernos.

---

## ADR-004: Clean Architecture con Vertical Slice en .NET 9

- **Fecha**: 2026-08-27
- **Estado**: Aceptado
- **Contexto**:
  Para el backend se requería una estructura escalable que permitiera añadir recursos y características sin convertir el proyecto en un monolito inmanejable ni caer en el antipatrón de repositorios genéricos artificiales.
- **Decisión**:
  Implementar **Clean Architecture** dividida en 4 proyectos (`Domain`, `Application`, `Infrastructure`, `WebApi`), organizando la capa de aplicación internamente en *Vertical Slices* por característica mediante **CQRS con MediatR**.
- **Consecuencias**:
  - *Positivas*: Principio de responsabilidad única estricto (*One Handler per File*), independencia absoluta de la base de datos MySQL, facilidad total para pruebas unitarias sin levantar infraestructura.
  - *Negativas*: Mayor número de archivos pequeños en comparación con un controlador monolítico tradicional.

---

## ADR-005: Orquestación de IA con n8n y Cloudflare Tunnels

- **Fecha**: 2026-09-02
- **Estado**: Aceptado
- **Contexto**:
  Se requería un agente conversacional inteligente capaz de responder preguntas sobre la experiencia de Bryan y un simulador de ciberdefensa. Las alternativas incluían programar un backend personalizado con LangChain/Semantic Kernel o utilizar un orquestador visual.
- **Decisión**:
  Desplegar **n8n en Docker** junto con el modelo **Google Gemini Flash (API gratuita)** en el VPS de Oracle Cloud, exponiendo los webhooks a través de **Cloudflare Tunnel (`cloudflared`)**.
- **Consecuencias**:
  - *Positivas*: Costo mensual $0, cero puertos abiertos en el firewall del servidor, interfaz visual para ajustar prompts y lógica de sanitización sin tocar código ni redesplegar, soporte nativo de Cloudflare WAF y protección anti-DDoS.
  - *Negativas*: n8n consume aproximadamente 250-400 MB de memoria RAM en el servidor Docker.

---

## ADR-006: Utilización del VPS Oracle Cloud Always Free como Núcleo de Infraestructura

- **Fecha**: 2026-09-05
- **Estado**: Aceptado
- **Contexto**:
  Para servir el backend .NET, la base de datos relacional y las automatizaciones de IA se necesitaba un servidor 24/7 sin incurrir en costos recurrentes mensuales de proveedores como AWS o Azure.
- **Decisión**:
  Aprovechar la instancia VPS de **Oracle Cloud Infrastructure (OCI) Always Free** ejecutando Docker Compose para todos los servicios internos.
- **Consecuencias**:
  - *Positivas*: Costo operativo cero, recursos de cómputo dedicados y generosos, control total sobre el entorno Linux, portabilidad mediante contenedores Docker.
  - *Negativas*: Requiere mantenimiento autónomo del sistema operativo (actualizaciones de seguridad de Ubuntu y copias de seguridad de volúmenes).
