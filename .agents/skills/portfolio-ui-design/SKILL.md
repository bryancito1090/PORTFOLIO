---
name: portfolio-ui-design
description: Estándar de diseño UI/UX para el Portafolio Profesional Interactivo. Fusión de estética Zen Japonés, Dark High-Contrast y Retro Computing (PC-98 / NeXT / Terminal Linux), con especificaciones para Laptop 3D desarmable en scroll, mini-pantalla Retro OS con videojuegos retro, terminal interactiva y probador de API en vivo.
---

# Estándar de Diseño UI/UX — Portafolio Profesional Interactivo (Zen Japonés + Dark + Retro)

Este documento define las reglas visuales, estéticas, de interacción y diseño de componentes para el **Portafolio Web Profesional Interactivo**. Su propósito es crear una experiencia memorable, sofisticada y técnicamente impresionante, combinando la serenidad y minimalismo del **Zen Japonés (Wabi-Sabi, Ma, Kanso)** con el misterio del **Dark Mode de alto contraste** y la nostalgia táctil del **Retro Computing / Cyber-Zen**.

---

## 1. Filosofía de Diseño — Reglas de Oro

El agente actúa como un **Director Creativo & Diseñador UI/UX Senior con 10+ años de experiencia** en diseño web interactivo, aplicaciones 3D y sistemas de diseño de alto impacto.

### 1.1 El Concepto Central: "Cyber-Zen & Retro Elegance"
1. **Zen Japonés (Wabi-Sabi & Ma - 間)**:
   - **Ma (Espacio negativo consciente)**: Las secciones respiran. No atiborrar la pantalla. El vacío tiene peso y propósito.
   - **Kanso (Simplicidad)**: Eliminar lo superfluo. Cada elemento visual tiene una función de comunicación o interacción.
   - **Shizen (Naturalidad dentro de lo digital)**: Transiciones orgánicas, fluidez como el agua, contrastadas con el rigor del código.
   - **Kintsugi (El valor de la técnica)**: Acentos dorados sutiles (`#d4af37` / `#c59b27`) que destacan la artesanía del software.
2. **Dark High-Contrast**:
   - Fondos negros tinta (Sumi-e ink `#0a0c10`), carbón profundo (`#12151b`) y pizarra (`#1a1f26`).
   - Cero grises desteñidos o descoloridos. El texto y los acentos resaltan con legibilidad WCAG AAA.
3. **Retro Computing & Terminal Nostalgia**:
   - Elementos inspirados en estaciones de trabajo Unix (NeXTSTEP, Silicon Graphics, PC-98 japonés).
   - Tipografía monoespaciada para datos técnicos, prompt de terminal Linux interactivo, scanlines CRT hiper-sutiles (opcionales/conmutables) y ventanas estilo OS vintage pero refinadas.

### 1.2 Prohibiciones Absolutas (Cero "AI Slop")
- **Prohibido emojis en la UI**: En ningún título, label, botón, tooltip o feedback.
- **Prohibido gradientes estridentes tipo arcoíris o neón descontrolado**: La paleta es sobria, monocromática con acentos de precisión.
- **Prohibido cards hinchadas con sombras gigantescas**: Las tarjetas usan bordes nítidos de `1px solid rgba(...)`, sombras difusas tenues y proporciones elegantes.
- **Prohibido border-radius desproporcionado**: El estilo zen/retro usa bordes rectos o de redondeo mínimo (`2px` a `6px`). Prohibido usar `border-radius: 24px` o píldoras gigantes.
- **Prohibido saturar con librerías pesadas de animación**: Las interacciones deben ser fluidas a 60fps usando CSS moderno, requestAnimationFrame y WebGL/Canvas nativo cuando sea requerido.

---

## 2. Paleta de Colores y Tokens Visuales

### 2.1 Variables CSS Base (Sumi & Gold Palette)

```css
:root {
  /* Fondos (Sumi-e Ink & Obsidian) */
  --zen-bg-abyss: #07080b;          /* Fondo más profundo (canvas del 3D / Landing) */
  --zen-bg-base: #0c0e14;           /* Fondo principal de la aplicación */
  --zen-bg-surface: #131720;        /* Superficie de cards, ventanas y paneles */
  --zen-bg-elevated: #1a202c;       /* Superficies flotantes, dropdowns, tooltips */
  --zen-bg-overlay: rgba(12, 14, 20, 0.85); /* Backdrops y overlays */

  /* Bordes & Divisores */
  --zen-border-subtle: #1e2533;     /* Bordes estándar de división */
  --zen-border-focus: #3d4a63;      /* Bordes activos o hover */
  --zen-border-kintsugi: #c59b27;   /* Borde acentuado de oro kintsugi */

  /* Textos & Tipografía */
  --zen-text-primary: #f0f3f8;      /* Blanco perla japonés (alta legibilidad) */
  --zen-text-secondary: #9aa5b8;    /* Gris pizarra para subtítulos y metadatos */
  --zen-text-muted: #5e697d;        /* Gris atenuado para hints y footer */
  --zen-text-gold: #e2b94a;         /* Dorado para llamadas de atención selectas */

  /* Acentos Temáticos */
  --zen-accent-kintsugi: #c59b27;   /* Oro kintsugi (artesanía, acción primaria) */
  --zen-accent-matcha: #4e9b6f;     /* Verde matcha / Terminal éxito */
  --zen-accent-sakura: #d96f88;     /* Rosa sakura atenuado / Alertas o badges */
  --zen-accent-amber: #e69d45;      /* Ámbar CRT retro / Warnings */
  --zen-accent-cyan: #38bdf8;       /* Azul glacial / API tester */

  /* Retro CRT & Terminal */
  --term-bg: #090b0e;
  --term-prompt: #4e9b6f;           /* Verde fósforo zen */
  --term-text: #d8dee9;
  --term-cursor: #e2b94a;

  /* Elevaciones & Sombras */
  --zen-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --zen-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.6);
  --zen-shadow-window: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05);

  /* Curvaturas (Bordes nítidos y elegantes) */
  --zen-radius-xs: 2px;             /* Botones retro, inputs */
  --zen-radius-sm: 4px;             /* Tarjetas, ventanas */
  --zen-radius-md: 6px;             /* Contenedores principales */
}
```

### 2.2 Temas Conmutables (Data-Attributes)

El usuario puede alternar la paleta visual desde la Terminal (ej: `theme amber`) o desde los ajustes del Retro OS:

```css
/* Tema 1: Zen Dark (Predeterminado) */
[data-theme='zen-dark'] {
  --zen-bg-base: #0c0e14;
  --zen-bg-surface: #131720;
  --zen-text-primary: #f0f3f8;
  --zen-accent-kintsugi: #c59b27;
  --term-prompt: #4e9b6f;
}

/* Tema 2: Retro CRT Ámbar (Estación de trabajo vintage) */
[data-theme='retro-amber'] {
  --zen-bg-base: #0a0702;
  --zen-bg-surface: #140f06;
  --zen-border-subtle: #2d1e0a;
  --zen-text-primary: #ffb833;
  --zen-text-secondary: #cc8e20;
  --zen-accent-kintsugi: #ffb833;
  --term-bg: #0d0903;
  --term-prompt: #ffb833;
  --term-text: #ffcf70;
  --term-cursor: #ffb833;
}

/* Tema 3: Matrix / Cyber-Zen Verde */
[data-theme='matrix-green'] {
  --zen-bg-base: #040a06;
  --zen-bg-surface: #0a140d;
  --zen-border-subtle: #122819;
  --zen-text-primary: #33ff77;
  --zen-text-secondary: #22aa4e;
  --zen-accent-kintsugi: #33ff77;
  --term-bg: #040a06;
  --term-prompt: #33ff77;
  --term-text: #66ff99;
  --term-cursor: #33ff77;
}
```

---

## 3. Tipografía

El portafolio comunica rigor de ingeniería mediante una cuidada jerarquía tipográfica:

```css
/* Familias Tipográficas */
--font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-retro: 'VT323', 'Press Start 2P', monospace; /* Para detalles retro específicos */
```

| Elemento | Fuente | Tamaño | Peso | Color | Uso |
|---|---|---|---|---|---|
| Display / Hero Title | Sans | `2.75rem - 3.5rem` | `700` | `--zen-text-primary` | Título de landing, frase de impacto |
| Heading H1 / Sección | Sans | `1.75rem - 2.25rem` | `600` | `--zen-text-primary` | Títulos de proyectos, terminal header |
| Heading H2 / Subsección | Sans | `1.25rem - 1.5rem` | `600` | `--zen-text-primary` | Títulos de cards, ventanas de OS |
| Eyebrow / Kanji Tag | Mono | `0.75rem` | `600` | `--zen-accent-kintsugi` | Acentos zen (ej: `01 // 開発 PROYECTOS`) |
| Body / Párrafo | Sans | `0.9375rem` | `400` | `--zen-text-secondary` | Descripciones, texto de lectura fluida |
| Terminal / Logs | Mono | `0.875rem` | `400` | `--term-text` | Consola interactiva, código, respuestas API |
| Retro OS UI | Mono / Retro | `0.8125rem` | `500` | `--zen-text-primary` | Barras de título de ventanas, menú de juegos |

---

## 4. Componentes Interiores Clave — Especificación Detallada

### 4.1 Fondo Hero con Laptop 3D Desarmable al Scroll (Exploded View)

#### Concepto y Comportamiento:
- En la Landing Page, el centro visual es una **laptop estética minimalista** vista en perspectiva isométrica o 3/4.
- A medida que el usuario hace scroll hacia abajo, la laptop se **desarma suavemente en capas explosivas (Exploded View)**:
  1. **Scroll 0% - 15%**: Laptop cerrada/abierta en reposo, pantalla brillando tenuemente con el logo o terminal zen.
  2. **Scroll 15% - 40%**: La tapa superior con la pantalla se eleva verticalmente en el eje Z.
  3. **Scroll 40% - 65%**: El teclado y el chasis superior flotan hacia arriba, revelando la placa madre (motherboard).
  4. **Scroll 65% - 85%**: Los microcomponentes (procesador .NET, chips de memoria, buses) se separan flotando con líneas de conexión y etiquetas técnicas flotantes que apuntan a tus habilidades técnicas reales (ej. "Arquitectura Limpia", "Motor de Signals", "MySQL Optimization").
  5. **Scroll 85% - 100%**: Los componentes se reensamblan o se desvanecen suavemente dando paso al siguiente bloque de contenido.

#### Reglas de Implementación Técnica & Rendimiento:
- Utilizar **Three.js** o **WebGL Canvas** con instanced meshes ligeras o primitivas geométricas optimizadas (archivo GLTF/GLB comprimido con Draco, peso máximo `< 1.8 MB`).
- Vincular la rotación y separación exclusivamente a la posición de scroll normalizada (`0.0` a `1.0`) mediante `requestAnimationFrame`.
- **Modo Reducido / Fallback**:
  - En dispositivos móviles o si `prefers-reduced-motion: reduce` está activo, deshabilitar la separación 3D continua y renderizar una vista 3D fija o una ilustración estática de alta calidad optimizada.
  - Pausar el render loop de WebGL cuando la sección hero esté fuera del viewport (vía `IntersectionObserver`).

---

### 4.2 Terminal Linux Interactiva (Hacker Zen Console)

#### Concepto:
Una consola interactiva incrustada donde reclutadores y visitantes técnicos pueden ejecutar comandos reales para navegar tu información como si estuvieran en un servidor Unix.

#### Anatomía Visual de la Terminal:
- Barra superior estilo ventana Unix/Retro con:
  - Indicador de estado: punto verde latente (`● online`).
  - Título: `bryan@zen-kernel: ~ (zsh)`
  - Botones de acción mínimos (minimizar, cerrar).
- Prompt interactivo: `bryan@zen:~$ ` en color matcha `--term-prompt`.
- Cursor parpadeante con animación escalonada `steps(2, start)`.

#### Comandos Soportados Requeridos:
- `help`: Muestra la lista de comandos disponibles con formato de tabla limpia.
- `about`: Resumen profesional, filosofía de desarrollo y enfoque arquitectónico.
- `skills`: Lista de tecnologías organizadas por Backend (.NET, MySQL), Frontend (Angular, Signals), y Prácticas (Clean Arch, CQRS).
- `projects`: Lista de proyectos destacados con enlaces clickeables.
- `curl /api/ping`: Ejecuta una petición HTTP real al backend .NET y muestra la respuesta con latencia.
- `retro`: Abre la ventana del sistema operativo retro / minijuegos.
- `clear`: Limpia el buffer de la pantalla.
- `sudo`: Mensaje de humor de permisos para administradores.

#### Estilo CSS de la Terminal:

```css
.zen-terminal-window {
  background: var(--term-bg);
  border: 1px solid var(--zen-border-subtle);
  border-radius: var(--zen-radius-sm);
  box-shadow: var(--zen-shadow-window);
  font-family: var(--font-mono);
  overflow: hidden;
}

.zen-terminal-header {
  background: #11141a;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--zen-border-subtle);
}

.zen-terminal-body {
  padding: 16px;
  min-height: 260px;
  max-height: 420px;
  overflow-y: auto;
  color: var(--term-text);
  line-height: 1.6;
}

.zen-terminal-prompt {
  color: var(--term-prompt);
  font-weight: 600;
}
```

---

### 4.3 Pantalla de Sistema Operativo Retro (ZenOS / Retro Desktop)

#### Concepto:
Una mini-pantalla o ventana de escritorio que evoca sistemas operativos de los años 90 (estilo NeXTSTEP / PC-98 japonés / System 7):
- Fondo de escritorio con cuadrícula punteada retro o patrón geométrico monocromático.
- Íconos en el escritorio estilo pixel-art minimalista:
  - `Juegos.exe` (Abre el catálogo de videojuegos retro).
  - `Curriculum.doc` (Visor de experiencia interactiva).
  - `Terminal.sh` (Acceso directo a la consola).
  - `Ajustes.sys` (Cambio de tema: Zen Dark / Phosphor Amber / Matrix Green).
- Ventanas arrastrables (*draggable*) con barra de título gris pizarra oscura, botones biselados clásicos de cerrar/minimizar y tipografía pixelada o mono nítida.

#### Mini-Juego Retro Integrado:
- Juegos ligeros implementados en **Canvas 2D HTML5 nativo** (cero dependencias pesadas de juegos):
  - **Zen Snake**: La clásica serpiente, pero con estética de tinta japonesa (come esferas de kanjis o monedas kintsugi).
  - **Space Defense / Katana Retro**: Un juego arcade simple de esquivar/disparar obstáculos con puntuación guardada localmente.
- Panel de control del juego: botones de pausa, reinicio, controles táctiles opcionales para móvil y tabla de "High Scores" que puede consultar la API del backend.

---

### 4.4 Probador de API en Vivo (Live .NET Playground)

#### Concepto:
Demuestra de inmediato que no es solo un frontend estático, sino una arquitectura fullstack real en producción. Permite al visitante invocar endpoints públicos controlados de .NET.

#### Componente Visual:
- Selector de endpoints de prueba:
  - `GET /api/v1/interactive/ping` (Verifica salud y tiempo de respuesta del backend .NET).
  - `GET /api/v1/interactive/skills-metrics` (Retorna métricas dinámicas calculadas por el backend).
  - `GET /api/v1/interactive/server-telemetry` (Retorna tiempo de actividad, versión de .NET y motor de base de datos MySQL).
- Botón de acción: `Ejecutar Endpoint` con feedback de carga elegante.
- Visor de respuesta:
  - Badge de Status Code: `200 OK` (verde matcha), `422 Unprocessable` (ámbar), `500 Server Error` (sakura).
  - Medidor de latencia: `Tiempo de respuesta: 42 ms`.
  - Caja de código JSON formateada con sintaxis coloreada nativa.

---

### 4.5 Panel de Administración RBAC (Backoffice Minimalista Zen)

#### Concepto:
Vista protegida para que Bryan pueda gestionar sus proyectos, habilidades y contenidos sin desplegar código nuevo.
- Acceso mediante modal discreto (o atajo desde terminal con `login`).
- Formularios limpios:
  - Inputs con focus de borde inferior kintsugi (`#c59b27`).
  - Tablas densas con tipografía mono, filtros rápidos y acciones CRUD (Crear, Editar, Desactivar).
  - Modal de confirmación con diseño sobrio.

---

## 5. Sistema de Espaciado (Grid de 8px)

Todo padding, margen y separación debe ser múltiplo de `8px` (o submúltiplo de `4px` para elementos microscópicos):

| Token | Medida | Aplicación |
|---|---|---|
| `--space-1` | `4px` | Separación mínima entre icono y texto |
| `--space-2` | `8px` | Padding interno de inputs, tags y botones compactos |
| `--space-3` | `12px` | Separación de items en listas densas |
| `--space-4` | `16px` | Padding de cards, ventanas y botones estándar |
| `--space-6` | `24px` | Separación entre grupos de campos o elementos de card |
| `--space-8` | `32px` | Padding principal de secciones y modales |
| `--space-12`| `48px` | Separación entre módulos mayores de la página |
| `--space-16`| `64px` | Margen vertical de grandes secciones en desktop |

---

## 6. Movimiento, Animaciones y Microinteracciones

1. **Duraciones y Curvas de Aceleración**:
   - Transiciones de hover/focus: `150ms cubic-bezier(0.4, 0, 0.2, 1)` (rápidas, precisas).
   - Apertura de ventanas retro / modales: `200ms cubic-bezier(0, 0, 0.2, 1)` (sin rebotes infantiles).
   - Movimiento de scroll 3D: Interpolación lineal suave (*lerp* con factor `0.08` a `0.12`).
2. **Efecto Scanline Retro**:
   - Implementado mediante un pseudo-elemento `::after` con gradiente repetitivo muy sutil (`opacity: 0.04`) y `pointer-events: none`. Con interruptor para apagarlo en caso de preferencia del usuario.
3. **Respeto a la Accesibilidad**:
   - `@media (prefers-reduced-motion: reduce)` debe anular cualquier animación continua o de scroll 3D.

### 6.2 Diseño de Sonido Retro (Web Audio API Nativa — 0 KB)

Para brindar respuesta táctil a la terminal y controles retro sin descargar archivos `.mp3` ni añadir librerías:

```typescript
export class RetroAudioService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return this.ctx;
  }

  // Clic mecánico sutil al teclear en la terminal (120Hz triángulo)
  playKeypress(): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }

  // Beep retro al ejecutar comando con éxito (880Hz senoidal)
  playSuccessBeep(): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}
```

---

## 7. Límites de Líneas y Modularidad de Componentes UI

Para permitir un desarrollo visual fluido y expresivo sin caer en el extremo de crear micro-archivos innecesarios para cada detalle, se definen los siguientes umbrales tolerables:

| Elemento Visual | Líneas Ideales | Máximo Tolerable | Acción al Exceder el Límite |
|---|---|---|---|
| **Plantilla de Componente UI (`.html`)** | **50 – 130** | **200** | Descomponer bloques visuales densos en subcomponentes presentacionales hijos. |
| **Estilos de Componente (`.css`)** | **40 – 100** | **160** | Utilizar los tokens CSS globales definidos en `portfolio-ui-design` (colores, sombras, radios) en lugar de CSS repetitivo. |
| **Componentes de Ventana (Retro OS / Terminal)** | **60 – 140** | **240** | Dividir la ventana en subcomponentes (`window-header`, `window-content`) si supera el máximo. |
| **Tarjetas de Proyecto / Skills** | **30 – 75** | **130** | Cada tarjeta encapsula su preview, descripción y tags; dividir solo si integra modales embebidos. |
| **Diálogos Modales / Drawers** | **50 – 110** | **170** | El modal provee el marco y botones; el contenido de formularios extensos es un subcomponente hijo. |

### Regla de Descomposición UI:
1. **Cohesión Visual Natural**: Un componente puede albergar cómodamente su estructura visual completa (hasta 150-200 líneas de HTML y 100-160 de CSS). Se divide cuando un sub-bloque tiene comportamiento interactivo propio e independiente.
2. **Subcomponentes Atómicos**: Si una interfaz compuesta (como la consola interactiva o la ventana retro) supera las 200 líneas de HTML o 160 de CSS, se crean subcomponentes hijos en una carpeta `components/` local a esa feature.

---

## 8. Tabla de Anti-Patrones Prohibidos

| Anti-patrón Prohibido | Solución Correcta en este Portafolio |
|---|---|
| Usar emojis en la interfaz para verse "amigable" | Tipografía limpia, badges de texto plano e iconos SVG monocromáticos precisos |
| Gradientes púrpuras/rosas genéricos de IA | Paleta Sumi-e: fondos carbón profundos con acentos dorados kintsugi y verde matcha |
| Border-radius excesivo tipo píldora (20px+) | Bordes nítidos (`2px` a `6px`) de estilo arquitectónico y retro computing |
| Ventanas retro sobrecargadas que bloquean la navegación | Ventana contenida, redimensionable o minimizable sin entorpecer el flujo principal |
| Modelo 3D pesado que demora 10 segundos en cargar | Geometría optimizada (`< 1.8 MB`), carga diferida (lazy load) y fallback estático |
| Animaciones que saltan y distraen la lectura | Movimiento solo en interacción deliberada o ligado al scroll de forma armónica |
| Falta de contraste en modo oscuro (texto gris sobre gris) | Texto principal perla `#f0f3f8` sobre fondo `#0c0e14` (ratio > 7:1, WCAG AAA) |
