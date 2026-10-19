# 02 // ARQUITECTURA FRONTEND — ANGULAR & SIGNALS
> *Estructura Hexagonal, Reactividad Pura con Signals, Componentes OnPush y Web APIs Nativas.*

---

## 1. Stack Técnico y Decisiones de Diseño

El frontend está construido sobre **Angular 20.3.0** operando en modo completamente independiente (*standalone components*), sin `NgModule` legados y sin recurrir a bibliotecas de estado redundantes (como NgRx Store o Akita).

### Decisiones de Vanguardia:
- **Angular Signals**: Se utiliza el sistema de reactividad primitiva de Angular (`signal`, `computed`, `effect`) como único gestor de estado. Proporciona granularidad a nivel de nodo de vista, sincronización inmediata y rendimiento óptimo.
- **`ChangeDetectionStrategy.OnPush`**: Todos los componentes de presentación declaran `OnPush`. Ningún ciclo de detección de cambios innecesario recorre el árbol de componentes.
- **Modern Control Flow**: Uso estricto de `@if`, `@for` (con `track` obligatorio), `@switch` y bloques `@defer` para carga diferida de vistas complejas. Prohibición de directivas estructurales antiguas (`*ngIf`, `*ngFor`).
- **Web Platform First**: Reemplazo de librerías externas de 500 KB por APIs nativas del navegador:
  - **HTML5 Canvas 2D**: Secuencia de laptop 3D, juego Buscaminas retro y lluvia digital Matrix.
  - **Web Audio API**: Síntesis de sonido retro (clics de teclado mecánico y beeps de éxito) a 0 KB de descarga.
  - **IntersectionObserver**: Pausa de animaciones y bucles de render cuando la sección sale de la pantalla.

---

## 2. Organización Hexagonal de Carpetas en `src/app/`

```
src/frontend/src/app/
├── domain/                               <- NÚCLEO PURO EN TYPESCRIPT (Sin Angular imports)
│   ├── models/                           <- Interfaces y modelos de negocio inmutables
│   │   ├── chat.model.ts
│   │   ├── i18n.model.ts
│   │   ├── retro-game.model.ts
│   │   ├── retro-os.model.ts
│   │   └── security.model.ts
│   └── ports/                            <- Contratos de comunicación (Puertos abstractos)
│       ├── chat.port.ts
│       ├── retro-score.port.ts
│       └── security-agent.port.ts
│
├── infrastructure/                       <- IMPLEMENTACIÓN TÉCNICA Y ADAPTADORES
│   ├── dtos/                             <- Contratos de transferencia HTTP
│   │   └── n8n-chat.dto.ts
│   ├── mappers/                          <- Transformadores puros (DTO <-> Model)
│   └── adapters/                         <- Implementación concreta de puertos
│       ├── n8n-chat.adapter.ts
│       └── local-storage-retro-score.adapter.ts
│
├── application/                          <- ORQUESTACIÓN DE ESTADO Y CASOS DE USO
│   ├── stores/                           <- Signal Stores (Gestión reactiva de estado)
│   │   ├── chat.store.ts
│   │   └── retro-os.store.ts
│   ├── services/                         <- Servicios de lógica de negocio
│   │   ├── i18n.service.ts               <- Motor reactivo de internacionalización
│   │   ├── terminal-executor.service.ts  <- Parser y ejecutor de comandos estilo Fish
│   │   └── retro-audio.service.ts        <- Sintetizador de audio retro nativo
│   └── i18n/translations/                <- Diccionarios de idiomas tipados (es.ts, en.ts)
│
├── presentation/                         <- CAPA DE VISTA (Componentes OnPush)
│   ├── features/                         <- Módulos visuales completos
│   │   ├── hero-3d/                      <- Laptop desarmable en scroll (Canvas 240 frames)
│   │   ├── retro-os/                     <- Sistema operativo vintage ZenOS & Buscaminas
│   │   │   └── components/               <- Subcomponentes atómicos (window, icons, settings)
│   │   ├── terminal/                     <- Consola interactiva Linux estilo hacker
│   │   ├── incident-simulator/           <- Simulador de defensa Purple Team / EASM
│   │   ├── featured-projects/            <- Carrusel y modal de detalle de proyectos
│   │   ├── technical-profile/            <- Retrato ASCII y perfil biográfico
│   │   ├── contact-section/              <- Formulario reactivo y lluvia digital Matrix
│   │   ├── chat-bot/                     <- Widget de conversación con IA
│   │   └── landing/                      <- Orquestador principal de la página
│   └── shared/                           <- Componentes y utilidades compartidas
│
├── core/                                 <- SERVICIOS TRANSVERSALES Y CONFIGURACIÓN
│   ├── tokens/                           <- InjectionTokens (URLs de webhooks y endpoints)
│   ├── guards/                           <- Guardias de ruta (para futuro panel Admin)
│   └── interceptors/                     <- Interceptores HTTP (JWT, errores RFC 7807)
│
├── app.config.ts                         <- Configuración global e inyección de dependencias
├── app.routes.ts                         <- Enrutamiento con lazy loading
└── app.ts / app.html                     <- Componente raíz de arranque
```

---

## 3. Patrones de Reactividad y Señales

### 3.1 Anatomía de un Application Store con Signals
Los estados se encapsulan en stores inyectables donde el estado interno es privado y solo se exponen señales de solo lectura (`asReadonly()`):

```typescript
@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly chatPort = inject(ChatPort);

  // 1. Estado privado mutable
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _isTyping = signal<boolean>(false);

  // 2. Estado público expuesto como sólo lectura
  readonly messages = this._messages.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly isTyping = this._isTyping.asReadonly();

  // 3. Señales computadas derivadas
  readonly unreadCount = computed(() => 
    this._isOpen() ? 0 : this._messages().filter(m => !m.isRead).length
  );

  // 4. Métodos de mutación controlada
  sendMessage(text: string): void {
    // muta estado y despacha a puerto de infraestructura
  }
}
```

### 3.2 Smart Containers vs. Dumb Components
- **Smart Container (ej. `RetroOsComponent`)**: Inyecta el store (`RetroOsStore`), reacciona a eventos del ciclo de vida (`IntersectionObserver`) y distribuye el estado a los componentes hijos.
- **Dumb Component (ej. `RetroWindowComponent`)**: Define entradas con `input()` / `input.required()` y notificaciones con `output()`. No inyecta servicios HTTP ni muta estados globales.

---

## 4. Gestión de Memoria y Ciclo de Vida en Componentes Interactivos

Para garantizar 60 FPS estables y cero fugas de memoria (`memory leaks`):
1. **Cancelación de Bucles de Animación**: Todo componente con bucle de render (`requestAnimationFrame`) limpia su identificador en `ngOnDestroy()` mediante `cancelAnimationFrame()`.
2. **Desconexión de Observadores**: Los `IntersectionObserver` y `ResizeObserver` se desconectan explícitamente en el desmontaje.
3. **Limpieza de Listeners**: Eventos pasivos registrados fuera de la zona de Angular (`NgZone.runOutsideAngular`) se retiran con `removeEventListener`.
