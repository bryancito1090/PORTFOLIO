# 03 // MATRIZ DE COMPETENCIAS TÉCNICAS
> *Inventario de Lenguajes, Frameworks, Bases de Datos, Arquitectura y Herramientas.*

---

## 1. Backend & Lenguajes de Servidor

| Tecnología | Nivel | Aplicación Práctica |
|---|---|---|
| **C# / .NET 8 y 9** | Senior / Avanzado | Clean Architecture, Web APIs RESTful, Kestrel, Dependency Injection nativa, Primary Constructors. |
| **MediatR & CQRS** | Senior / Avanzado | Segregación de comandos y consultas, pipeline behaviors (`ValidationBehavior`, `LoggingBehavior`). |
| **Entity Framework Core** | Senior / Avanzado | Mapeos Fluent API, consultas asíncronas con `.AsNoTracking()`, migraciones complejas, optimización de queries. |
| **FluentValidation** | Avanzado | Reglas declarativas de validación de modelos y casos de uso sin ensuciar controladores. |
| **Seguridad .NET** | Avanzado | JWT con tiempo corto, Refresh Token Rotation persistido, RBAC con claims, RFC 7807 `ProblemDetails`. |
| **Python** | Intermedio | Scripts de automatización, pruebas de seguridad y procesamiento de datos. |

---

## 2. Frontend & Tecnologías Web

| Tecnología | Nivel | Aplicación Práctica |
|---|---|---|
| **Angular (18, 19, 20)** | Senior / Avanzado | Standalone Components, Signal Stores reactivos (`signal`, `computed`, `effect`), `ChangeDetectionStrategy.OnPush`. |
| **TypeScript** | Senior / Avanzado | Tipado estricto extremo, genéricos avanzados, inmutabilidad con `readonly`, DTOs y Mappers puros. |
| **HTML5 Canvas 2D** | Avanzado | Motores de renderizado nativos para juegos retro (Buscaminas), lluvia digital Matrix y secuencias fotograma a fotograma sin librerías pesadas. |
| **Web Audio API** | Intermedio-Avanzado | Síntesis acústica procedural en tiempo real (clics mecánicos y tonos senoidales) con `AudioContext` nativo (0 KB de activos). |
| **CSS3 & Diseño Moderno** | Avanzado | CSS Variables / Tokens, Grid de 8px, Flexbox, media queries (`prefers-reduced-motion`), animaciones por hardware GPU (`transform: translate3d`). |

---

## 3. Bases de Datos & Almacenamiento

| Motor | Tipo | Experiencia |
|---|---|---|
| **MySQL / MariaDB** | Relacional SQL | Motores InnoDB, normalización en 3NF, optimización de índices B-Tree, transacciones ACID y backups automatizados. |
| **PostgreSQL** | Relacional SQL | Modelado relacional, PostGIS para datos geográficos y extensiones avanzadas. |
| **Redis** | NoSQL Key-Value | Caché en memoria para aceleración de consultas frecuentes y gestión de sesiones distribuidas. |

---

## 4. Cloud, DevOps & Infraestructura

| Plataforma / Herramienta | Rol en el Ecosistema |
|---|---|
| **Oracle Cloud Infrastructure (OCI)** | Servidor VPS Compute Always Free (Ubuntu), redes virtuales de nube (VCN) y almacenamiento en bloque. |
| **Cloudflare Zero Trust** | Túneles salientes (`cloudflared`), CDN Edge, SSL/TLS gestionado, protección anti-DDoS y WAF. |
| **Docker & Docker Compose** | Contenerización multicontenedor aislada, builds multi-stage para .NET y orquestación reproducible. |
| **Git & GitFlow** | Control de versiones riguroso, ramas semánticas (`feature/`, `fix/`, `release/`), commits convencionales. |
| **GitHub Actions** | Automatización de pipelines CI/CD para compilación, testing y despliegue continuo. |
| **Arch Linux & Entorno Shell** | Entorno nativo de trabajo diario con Fish Shell, Neovim, terminales Zsh y utilidades Unix. |

---

## 5. Ciberseguridad & Buenas Prácticas

- **Perímetro y Red**: Segmentación de tráfico, mitigación de ataques de fuerza bruta, configuración Zero Trust.
- **Seguridad Web**: Protección contra OWASP Top 10 (CSRF, XSS, SQL Injection vía ORM parametrizado, Rate Limiting).
- **Hardening de Contenedores**: Ejecución de imágenes con usuarios sin privilegios (`non-root user`) y reducción de superficies de ataque con imágenes base distroless o Alpine.
