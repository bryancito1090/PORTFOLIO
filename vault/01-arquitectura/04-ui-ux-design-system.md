# 04 // SISTEMA DE DISEÑO UI/UX — CYBER-ZEN & RETRO COMPUTING
> *Fusión de Wabi-Sabi, Dark High-Contrast, Kintsugi Gold y Estaciones de Trabajo Vintage.*

---

## 1. Concepto Visual Central

El diseño visual del portafolio se aparta radicalmente de las tendencias genéricas y saturadas de la web moderna ("AI Slop" con gradientes púrpuras chillones y tarjetas infladas). Su identidad se asienta en tres pilares:

1. **Zen Japonés (Wabi-Sabi & Ma - 間)**:
   - **Ma (Espacio negativo consciente)**: Las secciones respiran holgadamente; el vacío comunica propósito y serenidad técnica.
   - **Kanso (Simplicidad)**: Cero elementos decorativos innecesarios. Cada línea, badge o marco cumple una función informativa o de orientación.
   - **Kintsugi (El valor de la técnica)**: Acentos dorados sutiles (`#c59b27` / `#e2b94a`) que resaltan la nobleza del trabajo artesanal de software.
2. **Dark Mode de Alto Contraste**:
   - Fondos en negro tinta tradicional (Sumi-e ink `#0a0c10`), carbón profundo (`#12151b`) y pizarra (`#1a1f26`).
   - Cero grises desteñidos que fatiguen la vista: el texto en blanco perla (`#f0f3f8`) garantiza contraste estricto según el estándar **WCAG AAA** (ratio superior a 7:1).
3. **Retro Computing & Terminal Nostalgia**:
   - Inspiración directa en estaciones de trabajo Unix de alto calibre (NeXTSTEP, Silicon Graphics IRIX, NEC PC-98 japonés).
   - Tipografía monoespaciada de alta precisión técnica, scanlines CRT ultra-sutiles y ventanas de sistema operativo con bordes nítidos de 2px a 6px.

---

## 2. Paleta Cromática y Tokens Visuales (Sumi & Gold)

```css
:root {
  /* Fondos (Sumi-e Ink & Obsidian) */
  --zen-bg-abyss: #07080b;          /* Fondo base más profundo (Canvas 3D / Landing) */
  --zen-bg-base: #0c0e14;           /* Fondo principal de la aplicación */
  --zen-bg-surface: #131720;        /* Superficie de tarjetas, paneles y ventanas */
  --zen-bg-elevated: #1a202c;       /* Superficies flotantes y dropdowns */
  --zen-bg-overlay: rgba(12, 14, 20, 0.85); /* Backdrops translúcidos */

  /* Bordes & Divisores */
  --zen-border-subtle: #1e2533;     /* Bordes estándar de 1px */
  --zen-border-focus: #3d4a63;      /* Bordes en estado hover/activo */
  --zen-border-kintsugi: #c59b27;   /* Borde dorado de acento kintsugi */

  /* Textos & Tipografía */
  --zen-text-primary: #f0f3f8;      /* Blanco perla japonés (alta legibilidad) */
  --zen-text-secondary: #9aa5b8;    /* Gris pizarra para subtítulos */
  --zen-text-muted: #5e697d;        /* Gris atenuado para metadatos */
  --zen-text-gold: #e2b94a;         /* Dorado de énfasis */

  /* Acentos Temáticos */
  --zen-accent-kintsugi: #c59b27;   /* Oro kintsugi (artesanía, acción primaria) */
  --zen-accent-matcha: #4e9b6f;     /* Verde matcha / Éxito en terminal */
  --zen-accent-sakura: #d96f88;     /* Rosa sakura atenuado / Alertas */
  --zen-accent-amber: #e69d45;      /* Ámbar fósforo CRT retro */
  --zen-accent-cyan: #38bdf8;       /* Azul glacial para telemetría */

  /* Terminal Linux & Retro */
  --term-bg: #090b0e;
  --term-prompt: #4e9b6f;           /* Verde fósforo zen */
  --term-text: #d8dee9;
  --term-cursor: #e2b94a;

  /* Curvaturas Nítidas */
  --zen-radius-xs: 2px;             /* Botones e inputs retro */
  --zen-radius-sm: 4px;             /* Tarjetas y ventanas */
  --zen-radius-md: 6px;             /* Contenedores principales */
}
```

---

## 3. Jerarquía Tipográfica

Se emplean fuentes de ingeniería que comunican rigor lógico y elegancia:
- **`Plus Jakarta Sans`**: Títulos principales y cuerpo de lectura fluido.
- **`JetBrains Mono`**: Datos técnicos, comandos de terminal, código JSON y metadatos de proyectos.
- **`VT323`**: Títulos de ventanas retro y elementos de juegos vintage.

| Jerarquía | Fuente | Tamaño | Peso | Aplicación |
|---|---|---|---|---|
| **Display / Hero** | Sans | `2.75rem - 3.5rem` | 700 | Título de landing e impacto inicial |
| **H1 / Sección** | Sans | `1.75rem - 2.25rem` | 600 | Títulos de proyectos, header de terminal |
| **H2 / Subsección** | Sans | `1.25rem - 1.5rem` | 600 | Títulos de tarjetas y ventanas de OS |
| **Eyebrow / Kanji** | Mono | `0.75rem` | 600 | Acentos zen (ej: `01 // 開発 PROYECTOS`) |
| **Body / Párrafo** | Sans | `0.9375rem` | 400 | Descripciones y lecturas extensas |
| **Terminal / Código** | Mono | `0.875rem` | 400 | Consola interactiva, payloads JSON |
| **Retro OS UI** | VT323 / Mono | `0.8125rem` | 500 | Barras de título de ventanas y juegos |

---

## 4. Prohibiciones Absolutas de Estilo

1. **Cero Emojis en la UI**: En ningún título, botón, tarjeta o mensaje de feedback. Se emplean badges en texto monoespaciado o iconos monocromáticos SVG de línea delgada.
2. **Cero Bordes de Píldora (`border-radius: 24px+`)**: El diseño arquitectónico utiliza bordes de `2px` a `6px` para mantener carácter técnico y sobriedad.
3. **Cero Sombras Neón Gigantes**: Las sombras son tenues, difusas y acotadas (`0 4px 16px rgba(0, 0, 0, 0.6)`).
4. **Cero Librerías de Sonido Pesadas**: Los efectos de clic y notificación se sintetizan en tiempo real mediante la **Web Audio API** nativa del navegador con osciladores de onda senoidal y triangular.
