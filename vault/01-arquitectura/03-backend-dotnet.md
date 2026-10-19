# 03 // ESPECIFICACIÓN ARQUITECTÓNICA BACKEND — .NET 8/9 CLEAN ARCHITECTURE
> *Clean Architecture, CQRS con MediatR, FluentValidation, Entity Framework Core y Persistencia MySQL.*

---

## 1. Visión y Principios del Backend

El backend está concebido como una **Web API RESTful de alto rendimiento en .NET 8/9 (C#)** diseñada bajo los principios de **Clean Architecture**, **CQRS** (Command Query Responsibility Segregation) y la **Filosofía Ponytail** (cero sobreingeniería).

### Reglas de Oro:
1. **El Dominio es Inmaculado**:
   - `Portfolio.Domain` no tiene dependencias de EF Core, MySQL, MediatR ni ASP.NET Core. Solo C# puro.
2. **Prohibido Generic Repository Inflado**:
   - No se utiliza `IRepository<T>` con docenas de métodos genéricos. Se diseñan interfaces quirúrgicas y específicas para cada raíz de agregado (ej. `IProjectRepository`, `ISkillRepository`).
3. **No envolver `DbContext`**:
   - `DbContext` de EF Core ya es un *Unit of Work* y *Identity Map* robusto. No se envuelve en clases intermedias innecesarias.
4. **Prohibido AutoMapper**:
   - Se realizan proyecciones directas en LINQ con `.Select()` para lecturas sin sobrecarga de reflexión, o constructores estáticos en `record` para mapeos explícitos y seguros.
5. **C# Moderno**:
   - Uso de `public sealed record` para DTOs, Commands y Queries inmutables.
   - Uso de **Primary Constructors** de C# 12+ para inyección de dependencias limpia en una sola línea.
6. **Asincronía Total**:
   - Todas las operaciones de I/O reciben `CancellationToken` y son estrictamente `async/await`.

---

## 2. Mapa de Capas y Solución .NET (`backend/src/`)

```
backend/src/
├── Portfolio.Domain/                 <- NÚCLEO DEL NEGOCIO (Cero dependencias externas)
│   ├── Entities/                     <- Project, Skill, User, RefreshToken, ContactInquiry
│   ├── Enums/                        <- ProjectCategory, SkillCategory, UserRole, InquiryStatus
│   ├── Exceptions/                   <- DomainException, NotFoundException
│   └── Interfaces/                   <- IProjectRepository, ISkillRepository, IUserRepository
│
├── Portfolio.Application/            <- CASOS DE USO Y CQRS (Solo depende de Domain)
│   ├── Common/
│   │   ├── Behaviors/                <- ValidationBehavior (MediatR Pipeline)
│   │   └── Interfaces/               <- IJwtTokenGenerator, IPasswordHasher
│   ├── Features/                     <- Vertical Slices por Característica
│   │   ├── Projects/                 <- Commands, Queries, DTOs, Validators de Proyectos
│   │   ├── Skills/                   <- Commands, Queries, DTOs de Habilidades
│   │   ├── Interactive/              <- Endpoints públicos (Ping, Telemetría, Guestbook)
│   │   ├── Inquiries/                <- Recepción de consultas de contacto B2B
│   │   └── Auth/                     <- Login de Bryan, Refresh Token Rotation, RBAC
│   └── DependencyInjection.cs        <- Registro de MediatR y FluentValidation
│
├── Portfolio.Infrastructure/         <- DETALLES TÉCNICOS (Depende de Application y Domain)
│   ├── Persistence/
│   │   ├── Context/                  <- PortfolioDbContext (EF Core con Pomelo MySQL)
│   │   ├── Configurations/           <- Mapeos Fluent API (EntityTypeConfiguration)
│   │   └── Repositories/             <- Implementación de IProjectRepository, etc.
│   ├── Security/
│   │   ├── JwtTokenGenerator.cs      <- Emisión de JWTs firmados
│   │   └── PasswordHasher.cs         <- Hasheo seguro con BCrypt
│   └── DependencyInjection.cs        <- Configuración de DbContext y Repositorios
│
└── Portfolio.WebApi/                 <- PUNTO DE ENTRADA HTTP (Controladores y Pipeline)
    ├── Controllers/                  <- ProjectsController, InteractiveController, AuthController
    ├── Middleware/                   <- GlobalExceptionHandler (RFC 7807 ProblemDetails)
    ├── Program.cs                    <- Pipeline HTTP, Rate Limiter, CORS, Swagger
    └── appsettings.json              <- Cadenas de conexión y configuración JWT
```

---

## 3. Pipeline de Flujo de Datos (Data Flow Pipeline)

Cada petición HTTP entrante sigue estrictamente este flujo de 7 pasos:

```
[1. Request HTTP / DTO]
        │
        ▼
[2. Command / Query (MediatR IRequest<T>)]
        │
        ▼
[3. FluentValidation (Pipeline Behavior ValidationBehavior)]
        │
        ▼
[4. Handler (IRequestHandler<T, TResponse>)]
        │
        ▼
[5. Dominio & Persistencia]
    ├── Escritura: Entidad de Dominio -> IRepository.AddAsync() -> SaveChangesAsync()
    └── Lectura: DbContext.Set<T>().AsNoTracking().Select(...) -> Directo a DTO
        │
        ▼
[6. Response DTO (Record Inmutable)]
        │
        ▼
[7. Controller Action] (Retorna ActionResult<TResponse> con 200, 201, 204 o ProblemDetails)
```

---

## 4. Endpoints Interactivos Públicos (Live Playground)

Para que los visitantes de la web y reclutadores interactúen con el backend sin autenticación pero con **Rate Limiting nativo de .NET 8/9**:

```csharp
[ApiController]
[Route("api/v1/[controller]")]
[EnableRateLimiting("interactive-policy")] // Máx 30 peticiones/minuto por IP
public sealed class InteractiveController(ISender sender) : ControllerBase
{
    [HttpGet("ping")]
    public async Task<ActionResult<PingResponseDto>> Ping(CancellationToken ct)
    {
        return Ok(await sender.Send(new PingServerQuery(), ct));
    }

    [HttpGet("telemetry")]
    public async Task<ActionResult<ServerTelemetryDto>> Telemetry(CancellationToken ct)
    {
        return Ok(await sender.Send(new GetServerTelemetryQuery(), ct));
    }
}
```

---

## 5. Seguridad y Control de Acceso (RBAC)

1. **Tokens JWT de Vida Corta**: Expiración de 15 minutos, con `ClockSkew = TimeSpan.Zero` para prevenir el uso de tokens vencidos.
2. **Refresh Token Rotation en MySQL**:
   - Cada refresh token se almacena en `refresh_tokens` con hash, fecha de expiración y estado de revocación.
   - Al solicitar renovación, el token antiguo se invalida y se genera uno nuevo. Si un token ya revocado intenta ser utilizado, se invalida toda la cadena de sesiones por sospecha de compromiso de credenciales.
3. **Roles en Claims**:
   - `Role: Admin` (Bryan Baño, con acceso a endpoints de escritura `POST`, `PUT`, `DELETE`).
   - `Role: Visitor` (Público general con acceso a lecturas y endpoints de prueba).
