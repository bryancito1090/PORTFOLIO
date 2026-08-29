---
name: portfolio-frontend
description: Parámetros, reglas y estándares de arquitectura frontend con Clean Architecture en Angular (Signals reactivos, Domain Ports & Adapters, Application Stores, Presentation OnPush, Terminal interactiva, Retro OS Canvas y 3D Scroll Hero).
---

# Estándar de Desarrollo Frontend — Clean Architecture en Angular (Portafolio Interactivo)

Este documento establece las directrices de arquitectura, organización de código, reactividad con **Angular Signals**, desacoplamiento hexagonal (**Ports & Adapters**) e integración de módulos interactivos (Terminal, Retro OS, Videojuegos Canvas y Hero 3D) para el cliente web del portafolio.

---

## 1. Mentalidad de Arquitecto Frontend Senior — Reglas de Oro

El agente actúa como un **Arquitecto Frontend Senior con 10+ años de experiencia** en aplicaciones enterprise y experiencias web interactivas de alto rendimiento.

1. **Clean Architecture / Inversión de Dependencias (DIP)**:
   - Las capas internas nunca conocen a las externas. El código fuente solo apunta hacia el centro:
     `Presentation` ──► `Application` ──► `Domain` ◄── `Infrastructure / Data`
   - El **Dominio** es TypeScript puro, agnóstico del framework (cero imports de `@angular/*`, cero `HttpClient`).
   - Los cambios de endpoints en el backend solo afectan a `infrastructure/`, jamás a la UI ni al Dominio.
2. **Reactividad Primitiva con Signals & OnPush**:
   - Todo componente en la capa de presentación debe usar `changeDetection: ChangeDetectionStrategy.OnPush`.
   - El estado se administra exclusivamente con **Angular Signals** (`signal`, `computed`, `effect`).
   - Prohibido abusar de `BehaviorSubject` para estados locales o UI cuando `signal()` es nativo, más limpio y de menor overhead.
   - RxJS se reserva exclusivamente para flujos asíncronos y cancelables en adaptadores de infraestructura (`HttpClient`).
3. **Smart vs. Dumb Components**:
   - **Smart Components (Pages/Containers)**: Inyectan Application Stores o Facades, coordinan la vista y pasan señales a los componentes hijos.
   - **Dumb / Presentational Components (UI)**: Reciben datos estrictamente por `input()` / `input.required()` y notifican eventos mediante `output()`. Cero inyecciones de repositorios o servicios HTTP.
4. **Sintaxis Moderna de Control de Flujo**:
   - Uso obligatorio de la nueva sintaxis `@if`, `@for` (con `track`), `@switch` y `@defer`.
   - Prohibido el uso de directivas estructurales legadas (`*ngIf`, `*ngFor`).
5. **Filosofía Ponytail (Cero Sobreingeniería)**:
   - Usar las herramientas nativas de Angular y la Web Platform antes de añadir paquetes `npm`.
   - Mini-juego retro: Usar la **API nativa Canvas 2D** en lugar de motores de juego pesados de 500KB.
   - Scroll 3D: Implementar con Three.js optimizado o Canvas/CSS 3D ligero, pausando el render loop cuando no esté visible con `IntersectionObserver`.

---

## 2. Límites de Líneas por Archivo y Modularidad de Componentes

Para equilibrar la modularidad sin caer en una fragmentación excesiva (evitando crear cientos de micro-archivos innecesarios), se establecen los siguientes umbrales tolerables:

| Tipo de Archivo | Extensión / Ubicación | Líneas Ideales | Máximo Tolerable | Acción al Exceder el Límite |
|---|---|---|---|---|
| **Componente TypeScript** | `*.component.ts` | **80 – 180** | **280** | Extraer lógica pesada al Store o delegar bloques de vista en subcomponentes Dumb. |
| **Plantilla HTML** | `*.component.html` | **50 – 130** | **200** | Descomponer bloques visuales complejos en subcomponentes presentacionales hijos. |
| **Hojas de Estilo** | `*.component.css` | **40 – 100** | **160** | Consumir tokens globales de diseño y utilidades para no duplicar reglas CSS. |
| **Application Stores** | `*.store.ts` | **80 – 160** | **240** | Dividir por dominio funcional o sub-estado específico si acumula demasiados flujos. |
| **Servicios / Casos de Uso** | `*.service.ts` / `*.usecase.ts` | **50 – 120** | **180** | Aplicar Single Responsibility (SRP): mantener el servicio acotado a su función. |
| **Modelos y Puertos** | `domain/models/`, `ports/` | **30 – 70** | **120** | Separar modelos o agrupar contratos relacionados de forma coherente. |
| **Adaptadores y Repositorios**| `infrastructure/adapters/` | **60 – 120** | **180** | Mantener solo las llamadas HTTP del recurso específico. |
| **Mappers y DTOs** | `infrastructure/mappers/` | **30 – 80** | **130** | Dividir funciones de mapeo si el DTO tiene muchas transformaciones complejas. |
| **Motor de Juego / Canvas** | `retro-game/` | **100 – 200** | **320** | Separar en módulos si el juego crece: `game-engine.ts`, `renderer.ts`, `input-handler.ts`. |

### Criterio de Descomposición Inteligente:
- **No forzar la micro-fragmentación**: No es necesario crear un subcomponente por cada botón o etiqueta. Se crea un nuevo subcomponente cuando una sección visual o interactiva tiene identidad propia (ej. `terminal-prompt`, `retro-window-header`, `game-scoreboard`).
- **Control Flow Anidado**: Si una plantilla HTML supera **3 a 4 niveles de anidamiento** de bloques `@if` o `@for`, es momento de extraer ese bloque interno a un subcomponente Dumb dedicado para mantener la legibilidad.

---

## 3. Diagrama de Capas de Arquitectura Limpia

```
┌─────────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER (Angular)                │
│  - Pages (Hero, Terminal, Retro OS, Projects, Admin)       │
│  - Dumb Components (WindowFrame, TerminalView, GameCanvas)  │
│  - UI Directives & Pipes                                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ consume
┌──────────────────────────────▼──────────────────────────────┐
│             APPLICATION LAYER (Stores & Use Cases)          │
│  - ProjectStore (Signals)       - TerminalEngine (Signals)   │
│  - RetroOsStore (Signals)       - AuthStore (RBAC Signals)   │
│  - InteractiveApiStore                                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ orquesta usando puertos
┌──────────────────────────────▼──────────────────────────────┐
│                    DOMAIN LAYER (Core Puro)                 │
│  - Models (Project, Skill, Command, RetroWindow, AuthUser)  │
│  - Ports (Abstract Classes / Injection Tokens)              │
│  - Domain Value Objects & Business Rules                    │
└──────────────────────────────▲──────────────────────────────┘
                               │ implementa contratos de
┌──────────────────────────────┴──────────────────────────────┐
│             INFRASTRUCTURE / DATA LAYER (Adapters)          │
│  - HttpProjectRepository        - HttpInteractiveRepository  │
│  - HttpAuthRepository           - LocalStorageAdapter       │
│  - DTOs & Mappers puros (DTO <-> Model)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Estructura de Directorios del Proyecto Frontend

```
frontend/src/app/
├── domain/                               <- TypeScript PURO (Sin Angular imports)
│   ├── models/                           <- Modelos inmutables de negocio
│   │   ├── project.model.ts
│   │   ├── skill.model.ts
│   │   ├── terminal-command.model.ts
│   │   ├── retro-os.model.ts
│   │   ├── interactive-demo.model.ts
│   │   └── auth.model.ts
│   └── ports/                            <- Contratos abstractos (Interfaces / Abstract Classes)
│       ├── project.port.ts
│       ├── interactive-demo.port.ts
│       └── auth.port.ts
│
├── infrastructure/                       <- Implementaciones técnicas y adaptadores
│   ├── dtos/                             <- Contratos directos de la API .NET
│   │   ├── project.dto.ts
│   │   ├── interactive-demo.dto.ts
│   │   └── auth.dto.ts
│   ├── mappers/                          <- Transformadores puros (DTO <-> Model)
│   │   ├── project.mapper.ts
│   │   ├── interactive-demo.mapper.ts
│   │   └── auth.mapper.ts
│   └── adapters/                         <- Implementación HTTP con HttpClient
│       ├── http-project.adapter.ts
│       ├── http-interactive-demo.adapter.ts
│       └── http-auth.adapter.ts
│
├── application/                          <- Orquestación de casos de uso y estado reactivo
│   ├── stores/                           <- Signals Stores (State Management)
│   │   ├── project.store.ts
│   │   ├── terminal.store.ts
│   │   ├── retro-os.store.ts
│   │   ├── interactive-api.store.ts
│   │   └── auth.store.ts
│   └── services/                         <- Lógica de negocio de aplicación
│       ├── terminal-executor.service.ts  <- Parser y ejecutor de comandos
│       └── retro-audio.service.ts        <- Efectos de sonido retro con Web Audio API
│
├── presentation/                         <- UI Angular (Componentes Standalone OnPush)
│   ├── features/
│   │   ├── hero-3d/                      <- Laptop desarmable en scroll 3D
│   │   │   ├── hero-3d.component.ts
│   │   │   └── hero-3d.component.html
│   │   ├── terminal/                     <- Consola Linux interactiva
│   │   │   ├── terminal.component.ts
│   │   │   ├── terminal.component.html
│   │   │   └── components/terminal-line.component.ts
│   │   ├── retro-os/                     <- Sistema operativo vintage & mini-juego
│   │   │   ├── retro-os.component.ts
│   │   │   ├── retro-os.component.html
│   │   │   └── components/
│   │   │       ├── retro-window.component.ts
│   │   │       └── retro-game-canvas.component.ts
│   │   ├── interactive-api/              <- Probador de API en vivo (.NET Playground)
│   │   │   ├── interactive-api.component.ts
│   │   │   └── interactive-api.component.html
│   │   ├── projects/                     <- Galería de proyectos con filtros
│   │   │   ├── project-list.component.ts
│   │   │   └── project-card.component.ts
│   │   └── admin/                        <- Backoffice protegido por RBAC
│   │       ├── login/login.component.ts
│   │       └── dashboard/admin-dashboard.component.ts
│   └── shared/                           <- Componentes UI reutilizables
│       ├── components/
│       │   ├── zen-button/zen-button.component.ts
│       │   └── zen-badge/zen-badge.component.ts
│       └── pipes/
│           └── json-pretty.pipe.ts
│
├── core/                                 <- Servicios transversales
│   ├── guards/
│   │   └── auth.guard.ts                 <- Verificación de token y rol admin
│   ├── interceptors/
│   │   ├── auth.interceptor.ts           <- Inyección de Bearer Token JWT
│   │   └── error.interceptor.ts          <- Mapeo de ProblemDetails RFC 7807
│   └── tokens/
│       └── api-config.token.ts
│
├── app.config.ts                         <- Inyección de dependencias (providers)
└── app.routes.ts                         <- Rutas principales con Lazy Loading
```

---

## 5. Implementación Práctica por Capas (Ejemplos Estándar)

### 5.1 Capa de Dominio (`domain/`)

Modelos inmutables en TypeScript puro. Cero decoradores `@Injectable` o librerías externas.

```typescript
// domain/models/interactive-demo.model.ts
export interface ServerTelemetry {
  readonly status: string;
  readonly framework: string;
  readonly databaseEngine: string;
  readonly uptimeSeconds: number;
  readonly serverTimeUtc: string;
  readonly latencyMs?: number;
}

export interface ApiDemoResult {
  readonly endpoint: string;
  readonly httpStatus: number;
  readonly executionTimeMs: number;
  readonly payload: unknown;
  readonly isSuccess: boolean;
}
```

```typescript
// domain/ports/interactive-demo.port.ts
import { Observable } from 'rxjs';
import { ApiDemoResult, ServerTelemetry } from '../models/interactive-demo.model';

export abstract class InteractiveDemoPort {
  abstract getTelemetry(): Observable<ServerTelemetry>;
  abstract pingServer(): Observable<ApiDemoResult>;
  abstract executeCustomDemo(demoId: string): Observable<ApiDemoResult>;
}
```

---

### 5.2 Capa de Infraestructura (`infrastructure/`)

Maneja la comunicación HTTP, DTOs y Mappers hacia el backend .NET.

```typescript
// infrastructure/dtos/interactive-demo.dto.ts
export interface ServerTelemetryDto {
  status: string;
  framework: string;
  database_engine: string;
  uptime_seconds: number;
  server_time_utc: string;
}

export interface ApiExecutionResponseDto<T = unknown> {
  endpoint: string;
  status_code: number;
  duration_ms: number;
  data: T;
}
```

```typescript
// infrastructure/mappers/interactive-demo.mapper.ts
import { ApiDemoResult, ServerTelemetry } from '../../domain/models/interactive-demo.model';
import { ApiExecutionResponseDto, ServerTelemetryDto } from '../dtos/interactive-demo.dto';

export class InteractiveDemoMapper {
  static toDomainTelemetry(dto: ServerTelemetryDto, latencyMs: number): ServerTelemetry {
    return {
      status: dto.status,
      framework: dto.framework,
      databaseEngine: dto.database_engine,
      uptimeSeconds: dto.uptime_seconds,
      serverTimeUtc: dto.server_time_utc,
      latencyMs
    };
  }

  static toDomainDemoResult(dto: ApiExecutionResponseDto): ApiDemoResult {
    return {
      endpoint: dto.endpoint,
      httpStatus: dto.status_code,
      executionTimeMs: dto.duration_ms,
      payload: dto.data,
      isSuccess: dto.status_code >= 200 && dto.status_code < 300
    };
  }
}
```

```typescript
// infrastructure/adapters/http-interactive-demo.adapter.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InteractiveDemoPort } from '../../domain/ports/interactive-demo.port';
import { ApiDemoResult, ServerTelemetry } from '../../domain/models/interactive-demo.model';
import { ApiExecutionResponseDto, ServerTelemetryDto } from '../dtos/interactive-demo.dto';
import { InteractiveDemoMapper } from '../mappers/interactive-demo.mapper';

@Injectable({ providedIn: 'root' })
export class HttpInteractiveDemoAdapter implements InteractiveDemoPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/interactive';

  getTelemetry(): Observable<ServerTelemetry> {
    const startTime = performance.now();
    return this.http.get<ServerTelemetryDto>(`${this.baseUrl}/telemetry`).pipe(
      map(dto => {
        const latency = Math.round(performance.now() - startTime);
        return InteractiveDemoMapper.toDomainTelemetry(dto, latency);
      })
    );
  }

  pingServer(): Observable<ApiDemoResult> {
    return this.http.get<ApiExecutionResponseDto>(`${this.baseUrl}/ping`).pipe(
      map(InteractiveDemoMapper.toDomainDemoResult)
    );
  }

  executeCustomDemo(demoId: string): Observable<ApiDemoResult> {
    return this.http.post<ApiExecutionResponseDto>(`${this.baseUrl}/execute`, { demo_id: demoId }).pipe(
      map(InteractiveDemoMapper.toDomainDemoResult)
    );
  }
}
```

---

### 5.3 Capa de Aplicación (`application/stores/`)

Administración de estado reactivo mediante **Angular Signals**.

```typescript
// application/stores/interactive-api.store.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { InteractiveDemoPort } from '../../domain/ports/interactive-demo.port';
import { ApiDemoResult, ServerTelemetry } from '../../domain/models/interactive-demo.model';

@Injectable({ providedIn: 'root' })
export class InteractiveApiStore {
  private readonly demoPort = inject(InteractiveDemoPort);

  // Signals privadas de estado
  private readonly _telemetry = signal<ServerTelemetry | null>(null);
  private readonly _lastResult = signal<ApiDemoResult | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _errorMessage = signal<string | null>(null);

  // Signals públicas de solo lectura
  readonly telemetry = this._telemetry.asReadonly();
  readonly lastResult = this._lastResult.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly isHealthy = computed(() => this._telemetry()?.status === 'Healthy');

  loadTelemetry(): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);

    this.demoPort.getTelemetry().subscribe({
      next: (telemetry) => {
        this._telemetry.set(telemetry);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._errorMessage.set(err.message ?? 'No se pudo conectar con el backend .NET');
        this._isLoading.set(false);
      }
    });
  }

  executePing(): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);

    this.demoPort.pingServer().subscribe({
      next: (result) => {
        this._lastResult.set(result);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._errorMessage.set(err.message ?? 'Error al ejecutar ping');
        this._isLoading.set(false);
      }
    });
  }
}
```

---

### 5.4 Capa de Presentación (`presentation/`)

#### A. Smart Page Component
```typescript
// presentation/features/interactive-api/interactive-api.component.ts
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { InteractiveApiStore } from '../../../application/stores/interactive-api.store';
import { JsonPrettyPipe } from '../../../shared/pipes/json-pretty.pipe';

@Component({
  selector: 'app-interactive-api',
  standalone: true,
  imports: [JsonPrettyPipe],
  templateUrl: './interactive-api.component.html',
  styleUrl: './interactive-api.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractiveApiComponent implements OnInit {
  protected readonly store = inject(InteractiveApiStore);

  ngOnInit(): void {
    this.store.loadTelemetry();
  }

  onTestPing(): void {
    this.store.executePing();
  }
}
```

#### B. Template con Control Flow Moderno y Estilo Zen
```html
<!-- presentation/features/interactive-api/interactive-api.component.html -->
<section class="zen-card api-tester-container">
  <header class="card-header">
    <div class="header-badge">
      <span class="status-dot" [class.online]="store.isHealthy()"></span>
      <span class="mono-label">.NET 8 BACKEND // LIVE TESTER</span>
    </div>
    <h2 class="section-title">Interacción en Tiempo Real con la API</h2>
  </header>

  <div class="control-actions">
    <button
      type="button"
      class="zen-btn-primary"
      [disabled]="store.isLoading()"
      (click)="onTestPing()"
    >
      @if (store.isLoading()) {
        <span>Consultando...</span>
      } @else {
        <span>Ejecutar Ping Controlado</span>
      }
    </button>
  </div>

  @if (store.errorMessage(); as error) {
    <div class="zen-alert-error" role="alert">
      <span>{{ error }}</span>
    </div>
  }

  @if (store.lastResult(); as result) {
    <div class="api-response-viewer">
      <div class="response-meta">
        <span class="method-tag">GET</span>
        <span class="url-tag">{{ result.endpoint }}</span>
        <span class="status-tag" [class.success]="result.isSuccess">
          {{ result.httpStatus }} OK
        </span>
        <span class="latency-tag">{{ result.executionTimeMs }} ms</span>
      </div>

      <pre class="json-code"><code>{{ result.payload | jsonPretty }}</code></pre>
    </div>
  }
</section>
```

---

## 6. Arquitectura de Módulos Específicos

### 6.1 Motor de la Terminal Interactiva (`application/services/terminal-executor.service.ts`)
Parser de comandos extensible con mapeo declarativo y llamadas HTTP reales al backend:

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, of, isObservable, map } from 'rxjs';
import { InteractiveDemoPort } from '../../domain/ports/interactive-demo.port';

@Injectable({ providedIn: 'root' })
export class TerminalExecutorService {
  private readonly demoPort = inject(InteractiveDemoPort);

  private readonly commands: Record<string, (args: string[]) => Observable<string> | string> = {
    help: () => `Comandos disponibles:
  about       - Conoce sobre mi perfil y enfoque arquitectónico
  skills      - Stack técnico (.NET, Angular, MySQL, Clean Arch)
  projects    - Listado de proyectos destacados
  curl <url>  - Ejecuta una petición HTTP en vivo al backend .NET
  retro       - Abre el sistema operativo vintage y videojuegos
  clear       - Limpia el buffer de la consola`,

    about: () => 'Bryan // Fullstack Developer especializado en .NET & Angular Clean Architecture.',
    skills: () => 'Backend: .NET 8/9, EF Core, MySQL, MediatR, CQRS.\nFrontend: Angular, Signals, OnPush, Canvas 2D.\nPrácticas: Clean Architecture, Ponytail (YAGNI/KISS), TDD.',
    clear: () => '__CLEAR__',
    retro: () => 'Abriendo entorno ZenOS...',
    curl: (args) => {
      if (args[0] === '/api/v1/interactive/ping' || args[0] === 'ping') {
        return this.demoPort.pingServer().pipe(
          map(res => `HTTP ${res.httpStatus} OK (${res.executionTimeMs}ms)\n${JSON.stringify(res.payload, null, 2)}`)
        );
      }
      return 'Endpoint no reconocido. Prueba con: curl /api/v1/interactive/ping';
    }
  };

  execute(rawInput: string): Observable<string> {
    const parts = rawInput.trim().split(/\s+/);
    const commandName = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (!commandName) return of('');
    const handler = this.commands[commandName];
    if (!handler) return of(`comando no encontrado: ${commandName}. Escribe "help" para ver la lista.`);

    const result = handler(args);
    return isObservable(result) ? result : of(result);
  }
}
```

### 6.2 Motor del Videojuego Canvas Retro (`retro-game-canvas.component.ts`)
Bucle de renderizado nativo en 2D sin librerías pesadas, con limpieza estricta de memoria:

```typescript
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-retro-game-canvas',
  standalone: true,
  template: `<canvas #gameCanvas width="320" height="240" class="pixel-canvas"></canvas>`,
  styleUrl: './retro-game-canvas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroGameCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private isRunning = false;

  protected readonly score = signal<number>(0);
  protected readonly isGameOver = signal<boolean>(false);

  ngAfterViewInit(): void {
    const context = this.canvasRef.nativeElement.getContext('2d');
    if (!context) return;
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false; // Pixel-art nítido
    this.isRunning = true;
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    // Actualización de entidades y colisiones del juego
  }

  private render(): void {
    this.ctx.fillStyle = '#0a0c10';
    this.ctx.fillRect(0, 0, 320, 240);
  }

  ngOnDestroy(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId); // Cero memory leaks
    }
  }
}
```

### 6.3 Hero 3D con Scroll Desarmable (`hero-3d.component.ts`)
Lectura de scroll pasiva y pausa del render loop mediante `IntersectionObserver`:

```typescript
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hero-3d',
  standalone: true,
  templateUrl: './hero-3d.component.html',
  styleUrl: './hero-3d.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Hero3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer') private containerRef!: ElementRef<HTMLDivElement>;
  private isVisible = true;
  private intersectionObserver?: IntersectionObserver;
  protected scrollProgress = 0;

  ngAfterViewInit(): void {
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    this.intersectionObserver.observe(this.containerRef.nativeElement);

    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private onScroll = (): void => {
    if (!this.isVisible) return;
    const el = this.containerRef.nativeElement;
    const rect = el.getBoundingClientRect();
    this.scrollProgress = Math.min(Math.max(-rect.top / window.innerHeight, 0), 1);
    // Aplicar transformación a las piezas 3D según scrollProgress (0.0 a 1.0)
  };

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    this.intersectionObserver?.disconnect();
  }
}
```

---

## 7. Interceptores y Configuración Global (`app.config.ts`)

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  if (token && !req.url.includes('/auth/login')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { InteractiveDemoPort } from './domain/ports/interactive-demo.port';
import { HttpInteractiveDemoAdapter } from './infrastructure/adapters/http-interactive-demo.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Inversión de dependencias de puertos
    { provide: InteractiveDemoPort, useClass: HttpInteractiveDemoAdapter }
  ]
};
```

---

## 8. Tabla de Anti-Patrones Prohibidos en Frontend

| Anti-patrón Prohibido | Solución Obligatoria |
|---|---|
| Inyectar `HttpClient` directamente en componentes | Inyectar Store/Facade que consuma Ports implementados en `infrastructure/` |
| Directivas legadas `*ngIf`, `*ngFor` | Sintaxis moderna `@if`, `@for (item of items; track item.id)` |
| `ChangeDetectionStrategy.Default` en componentes | Siempre `ChangeDetectionStrategy.OnPush` |
| Bucle infinito en canvas del juego al cambiar de ruta | Limpiar bucle con `cancelAnimationFrame` en `ngOnDestroy()` |
| Instalar librerías de 1MB para efectos sencillos | Usar Web APIs nativas: Canvas 2D, Web Audio, IntersectionObserver |
| Uso de `any` en respuestas HTTP | Definir DTOs tipados en `infrastructure/dtos/` y mapear a modelos |
| Estado global mutable o variables sueltas | Angular Signals con interfaces inmutables (`readonly`) |
