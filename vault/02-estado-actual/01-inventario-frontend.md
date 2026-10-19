# 01 // INVENTARIO DEL ESTADO ACTUAL — FRONTEND ANGULAR
> *Auditoría Detallada de Todos los Componentes, Servicios, Stores y Web APIs Implementadas.*

---

## 1. Resumen Ejecutivo del Frontend

El cliente web ubicado en [`src/frontend`](file:///home/bryan/Projects/PORTFOLIO/src/frontend) es una aplicación de una sola página (SPA) altamente optimizada, estructurada en Clean Architecture y con cero uso de librerías CSS o UI infladas (como Bootstrap o Angular Material).

- **Framework**: Angular 20.3.0 (Standalone).
- **Control de Estado**: Angular Signals nativos.
- **Detección de Cambios**: `ChangeDetectionStrategy.OnPush` en el 100% de los componentes.
- **Rendimiento**: 60 FPS garantizados mediante desvinculación de NgZone en eventos de scroll (`NgZone.runOutsideAngular`) y desconexión con `IntersectionObserver`.

---

## 2. Módulos y Componentes de Presentación

A continuación se detalla la función, ubicación y características de cada módulo en [`src/app/presentation/features/`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features):

### 2.1 Hero 3D (`hero-3d/`)
- **Archivos**: [`hero-3d.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/hero-3d/hero-3d.component.ts), `.html`, `.css`.
- **Mecanismo**: Controla una secuencia fotorrealista de **240 fotogramas** de una laptop Thinkpad desarmable (*exploded view*), precargada en caché (`SHARED_IMAGE_CACHE`) y dibujada en un elemento `<canvas>` HTML5 nativo.
- **Interpolación LERP**: Factor `0.09` para suavizado de transición al hacer scroll.
- **Optimización**: Utiliza `IntersectionObserver` para apagar el bucle de render cuando la sección no está en pantalla.
- **Accesibilidad**: Detección automática de `prefers-reduced-motion` y modo estático optimizado para pantallas móviles (`< 900px`).

### 2.2 Sistema Operativo Retro ZenOS (`retro-os/`)
- **Archivos**: [`retro-os.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/retro-os/retro-os.component.ts), `.html`, `.css` y subcomponentes en `components/`.
- **Características**:
  - **Secuencia de Boot**: Pantalla de arranque retro con animación de comprobación de memoria y POST (`retro-power-screen`).
  - **Ventanas Arrastrables (Draggable Window Manager)**: [`retro-window.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/retro-os/components/retro-window/retro-window.component.ts) con soporte para minimizar, maximizar, mover por coordenadas relativas y orden de apilamiento en Z (`zIndex`).
  - **Menú de Inicio & Barra de Tareas**: [`retro-start-menu`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/retro-os/components/retro-start-menu/retro-start-menu.component.ts) con reloj sincronizado en tiempo real.
  - **Visor de CV Vintage**: [`retro-cv`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/retro-os/components/retro-cv/retro-cv.component.ts) con datos profesionales de Bryan.
  - **Ajustes de Tema**: [`retro-settings`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/retro-os/components/retro-settings/retro-settings.component.ts) permitiendo alternar entre `zen-dark`, `retro-amber` y `matrix-green`.
  - **Buscaminas Retro Nativo (Canvas 2D)**: [`retro-game-canvas`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/retro-os/components/retro-game-canvas/retro-game-canvas.component.ts). Implementación completa de Buscaminas (9x9 con 10 minas), cronómetro LED de 3 dígitos, conteo de minas restantes, detección de victoria/derrota, modo bandera para móviles y persistencia de récords (`retro-scores`).

### 2.3 Terminal Linux Interactiva (`terminal/`)
- **Archivos**: [`terminal.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/terminal/terminal.component.ts), `.html`, `.css`.
- **Servicio Asociado**: [`terminal-executor.service.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/application/services/terminal-executor.service.ts).
- **Características**:
  - Emulación de terminal Unix con banner inicial en arte de Gengar / ASCII.
  - Autosugerencias en texto tenue estilo **Fish Shell** aceptables mediante `Tab` o `Flecha Derecha`.
  - Historial de comandos navegable con `Flecha Arriba` y `Flecha Abajo`.
  - Atajo `Ctrl + L` para limpieza rápida de pantalla.
  - Comandos soportados: `help`, `clear`, `about`, `whoami`, `cat skills.json`, `fetch skills`, `guestbook sign "Mensaje"`, `leaderboard --game snake`.

### 2.4 Simulador de Respuesta a Incidentes Cloud (`incident-simulator/`)
- **Archivos**: [`incident-simulator.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/incident-simulator/incident-simulator.component.ts), `.html`, `.css`.
- **Servicio Asociado**: [`security-agent.service.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/services/security-agent.service.ts).
- **Características**:
  - Stepper en 3 etapas: 1 = Selección de Escenario, 2 = Ataque en Vivo & Mitigación, 3 = Evidencia Forense.
  - Modos de vista: `guided` (comprensible para cualquier público) y `tech` (metadatos MITRE ATT&CK, IPs y puertos para auditores técnicos).
  - Escenarios preconfigurados: Intrusión Purple Team y Auditoría Externa EASM.
  - Conexión vía webhook a orquestador de seguridad con manejo de rate-limiting (429).

### 2.5 Chatbot Asistente con IA (`chat-bot/`)
- **Archivos**: [`chat-bot.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/chat-bot/chat-bot.component.ts), `.html`, `.css`.
- **Store Asociado**: [`chat.store.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/application/stores/chat.store.ts).
- **Características**:
  - Ventana flotante retráctil con control de foco automático al abrir.
  - Prompts preconfigurados rápidos para reclutadores.
  - Indicador de digitación (*isTyping*) y scroll automático al fondo vía `effect()`.
  - Despacho de mensajes hacia webhook de n8n con fallback y manejo de errores.

### 2.6 Proyectos Destacados (`featured-projects/`)
- **Archivos**: [`featured-projects.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/featured-projects/featured-projects/featured-projects.component.ts) y [`project-detail.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/featured-projects/project-detail/project-detail.component.ts).
- **Proyectos Cargados**:
  1. **Ammi-Online**: Plataforma médica/clínica online (.NET 8, Clean Arch, JWT & RBAC, MediatR CQRS).
  2. **Módulo Vacaciones RRHH**: Sistema con algoritmo FIFO y reportes (.NET 9, Clean Arch, JWT & RBAC).
  3. **Sistema de Titulación**: Gestión de convocatorias académicas (.NET 9, Clean Arch).
  4. **SIPLECE**: Arquitectura institucional y SharePoint (.NET 8, Clean Arch, IST Mayor Pedro Traversari).
- **Comportamiento**: Carrusel adaptativo por columnas (`HostListener('window:resize')`) con modal en superposición para lectura detallada de desafíos, soluciones e impactos.

### 2.7 Perfil Técnico y Arte ASCII (`technical-profile/`)
- **Archivos**: [`technical-profile.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/technical-profile/technical-profile.component.ts).
- **Características**: Carga asíncrona de `assets/portfolio.txt` para renderizado de retrato en arte ASCII y desglose de biografía profesional.

### 2.8 Sección de Contacto & Digital Rain (`contact-section/`)
- **Archivos**: [`contact-section.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/contact-section/contact-section.component.ts).
- **Características**:
  - Efecto de lluvia digital de caracteres Matrix en HTML5 Canvas 2D acelerado.
  - Formulario reactivo fuertemente tipado (`FormGroup` con `nonNullable: true`).
  - Validación de campos en tiempo real (nombre, email, detalles de proyecto).

### 2.9 Orquestador de la Landing (`landing/`)
- **Archivos**: [`landing.component.ts`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/presentation/features/landing/landing.component.ts).
- **Características**:
  - Navegación entre secciones (`hero`, `retro`, `projects`, `simulator`, `terminal`, `contact`) con cortina de transición suave.
  - Sincronización con el hash de la URL (`#projects`, `#simulator`, etc.).
  - Gestor de gestos táctiles (`touchstart`, `touchend`) y rueda de ratón (`wheel`) respetando scroll interno de contenedores.
  - Reloj internacional sincronizado con zona horaria de Quito (`America/Guayaquil`).

---

## 3. Servicios Transversales y de Aplicación

| Servicio | Ubicación | Responsabilidad |
|---|---|---|
| **I18nService** | `application/services/i18n.service.ts` | Motor de traducción reactivo con Signals. Soporta Español (`es`) e Inglés (`en`) con tipado estricto. |
| **TerminalExecutorService** | `application/services/terminal-executor.service.ts` | Parser declarativo de comandos, autocompletado e integración con i18n. |
| **RetroAudioService** | `application/services/retro-audio.service.ts` | Generador de audio retro con Web Audio API (`AudioContext`, osciladores triangulares y senoidales a 0 KB). |
| **SecurityAgentService** | `services/security-agent.service.ts` | Cliente HTTP del simulador con manejo de errores y códigos de estado (429, 400, 500). |
