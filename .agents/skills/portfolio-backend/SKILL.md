---
name: portfolio-backend
description: Parámetros, reglas y estándares de arquitectura backend en C# / .NET 8/9 con Clean Architecture (Domain, Application, Infrastructure, WebApi), CQRS con MediatR, FluentValidation, EF Core MySQL, RBAC para administración y endpoints interactivos de prueba.
---

# Estándar de Arquitectura Backend — Clean Architecture en .NET (Portafolio Interactivo)

Este documento define las reglas de arquitectura, flujo de datos por capas, convenciones de código, seguridad y persistencia con MySQL para el backend en **.NET 8/9** del portafolio interactivo.

---

## 1. Mentalidad de Arquitecto Backend Senior — Reglas de Oro

El agente actúa como un **Ingeniero Principal y Arquitecto Backend Senior con 10+ años de experiencia** en desarrollo con .NET y arquitecturas limpias de alto rendimiento.

1. **Clean Architecture & Regla de Dependencia**:
   - Las dependencias van estrictamente hacia adentro:
     `WebApi` ──► `Application` ──► `Domain` ◄── `Infrastructure`
   - El núcleo (`Domain`) nunca depende de EF Core, MySQL, MediatR, ASP.NET Core ni librerías externas.
   - La inversión de dependencias permite aislar la lógica de negocio: `Domain` declara los contratos (`IProjectRepository`), e `Infrastructure` los implementa.
2. **Filosofía Ponytail (Prevención de Sobreingeniería)**:
   - **Prohibido Generic Repository genérico** (`IRepository<T>` con 30 métodos que nadie usa). Diseñar interfaces de repositorio específicas y quirúrgicas para cada raíz de agregado (Aggregate Root).
   - **Prohibido envolver DbContext en un UnitOfWork casero adicional**: `DbContext` de EF Core ya es un *Unit of Work* y *Identity Map* probado en producción.
   - **Prohibido AutoMapper**: En su lugar, proyectar directamente con `.Select()` de LINQ para lecturas, o constructores/métodos estáticos en records para mapeos explícitos, seguros y sin overhead de reflection.
   - **Records posicionales**: Usar `public sealed record ...` para DTOs, Commands y Queries. Cero clases verbosas con getters/setters tradicionales.
   - **Primary Constructors**: Aprovechar la sintaxis moderna de C# 12+ para inyección de dependencias limpia en una sola línea.
3. **Cero operaciones síncronas en I/O**:
   - Todo acceso a base de datos, hasher o servicios de token es estrictamente asíncrono (`async/await`) recibiendo siempre `CancellationToken`.
4. **Manejo Centralizado de Excepciones**:
    - Prohibido capturar excepciones dentro de los controladores. Se utiliza `AddProblemDetails()` y `IExceptionHandler` según el estándar **RFC 7807**.

---

## 2. Límites de Líneas por Archivo y Modularidad Backend

Para mantener un balance óptimo entre cohesión y separación de responsabilidades (evitando tanto las *God Classes* monolíticas como la sobre-fragmentación artificial en decenas de micro-archivos), se establecen los siguientes umbrales tolerables:

| Tipo de Archivo | Capa / Ubicación | Líneas Ideales | Máximo Tolerable | Acción al Exceder el Límite |
|---|---|---|---|---|
| **Controlador REST** | `WebApi/Controllers/` | **50 – 120** | **200** | Prohibido incluir lógica de negocio. Solo validar HTTP, delegar a MediatR (`ISender`) y retornar `ActionResult<T>`. Permite agrupar las rutas CRUD completas de un recurso. |
| **Command / Query Handler** | `Application/Features/.../` | **40 – 90** | **160** | Principio *One Handler per File*. Si supera 160 líneas, encapsular reglas dentro de la Entidad de Dominio o delegar a subservicios especializados. |
| **Entidad de Dominio** | `Domain/Entities/` | **60 – 130** | **220** | Contiene propiedades, reglas de negocio y fábrica estática `Create()`. Extraer sub-conceptos a Value Objects si crece. |
| **DTO / Command / Query** | `Application/.../DTOs/` | **10 – 40** | **80** | Usar `public sealed record` posicionales. Si se agrupan varios DTOs relacionados en un archivo (ej: `ProjectDtos.cs`), el archivo puede alcanzar hasta **120 líneas**. |
| **Validador FluentValidation**| `Application/.../Validators/` | **25 – 60** | **100** | Encapsular validaciones complejas o reutilizables en métodos de extensión propios. |
| **Repositorio de Infraestructura** | `Infrastructure/Persistence/` | **50 – 100** | **180** | Implementar los métodos de consulta y persistencia requeridos por el contrato de dominio (`IProjectRepository`). |
| **Configuración EF Core (Fluent API)** | `Infrastructure/Configurations/` | **30 – 70** | **120** | Una clase por entidad (`IEntityTypeConfiguration<T>`). |
| **DbContext** | `Infrastructure/Context/` | **40 – 90** | **150** | Registrar los `DbSet<T>` y llamar a `modelBuilder.ApplyConfigurationsFromAssembly(...)`. |

### Reglas de Descomposición Modular:
- **One Handler per File**: Cada caso de uso (Command o Query) y su Handler viven en su propio archivo independiente para facilitar pruebas unitarias y navegación.
- **División de Controladores**: Un controlador puede manejar cómodamente las operaciones CRUD de una entidad (hasta 150-200 líneas). Solo se divide si mezcla recursos no relacionados o responsabilidades administrativas distintas.

---

## 3. Mapa de Capas y Responsabilidades

```
backend/src/
├── Portfolio.Domain/                 <- Núcleo del Negocio. Cero dependencias externas.
│   ├── Entities/                     <- Project, Skill, User, Role, InteractiveLog
│   ├── Enums/                        <- ProjectCategory, SkillLevel, UserRole
│   ├── Exceptions/                   <- DomainException, NotFoundException
│   └── Interfaces/                   <- IProjectRepository, IUserRepository, IUnitOfWork (opcional)
│
├── Portfolio.Application/            <- Casos de Uso (CQRS). Solo depende de Domain.
│   ├── Common/
│   │   ├── Behaviors/                <- ValidationBehavior (MediatR Pipeline)
│   │   └── Interfaces/               <- IJwtTokenGenerator, IPasswordHasher
│   ├── Features/                     <- Organización vertical por Feature (Vertical Slice inside App)
│   │   ├── Projects/
│   │   │   ├── Commands/             <- CreateProjectCommand, UpdateProjectCommand
│   │   │   ├── Queries/              <- GetProjectsQuery, GetProjectByIdQuery
│   │   │   ├── DTOs/                 <- ProjectResponseDto, CreateProjectRequestDto
│   │   │   └── Validators/           <- CreateProjectCommandValidator
│   │   ├── Interactive/              <- Endpoints de prueba para visitantes
│   │   │   ├── Queries/              <- GetServerTelemetryQuery, PingServerQuery
│   │   │   └── DTOs/                 <- ServerTelemetryDto, PingResponseDto
│   │   └── Auth/                     <- Login, RefreshToken, RBAC
│   │       ├── Commands/             <- LoginCommand, RefreshTokenCommand
│   │       ├── DTOs/                 <- AuthResponseDto, LoginRequestDto
│   │       └── Validators/           <- LoginCommandValidator
│   └── DependencyInjection.cs
│
├── Portfolio.Infrastructure/         <- Implementación Técnica. Depende de Application y Domain.
│   ├── Persistence/
│   │   ├── Context/                  <- PortfolioDbContext (EF Core con MySQL)
│   │   ├── Configurations/           <- EntityTypeConfigurations (Fluent API)
│   │   └── Repositories/             <- ProjectRepository, UserRepository
│   ├── Security/
│   │   ├── JwtTokenGenerator.cs      <- Generación y validación de tokens JWT
│   │   └── PasswordHasher.cs         <- Hasheo de contraseñas (BCrypt / PBKDF2)
│   └── DependencyInjection.cs
│
└── Portfolio.WebApi/                 <- Punto de Entrada HTTP. Depende de Application e Infrastructure.
    ├── Controllers/                  <- ProjectsController, InteractiveController, AuthController
    ├── Middleware/                   <- GlobalExceptionHandler (ProblemDetails RFC 7807)
    ├── Security/                     <- HasPermissionAttribute o Authorize policies
    ├── Program.cs                    <- Pipeline HTTP, DI y configuración
    └── appsettings.json
```

---

## 4. Flujo de Datos Obligatorio para Endpoints (Data Flow Pipeline)

Para mantener total coherencia y evitar sobreingeniería, todo endpoint debe seguir estrictamente este flujo de 7 pasos secuenciales:

```
[1. Request HTTP / DTO]
        │
        ▼
[2. Command / Query (MediatR IRequest<T>)]
        │
        ▼
[3. FluentValidation (Pipeline Behavior)]
        │
        ▼
[4. Handler (IRequestHandler<T, TResponse>)]
        │
        ▼
[5. Dominio & Persistencia]
    ├── Si es ESCRITURA: Entidad de Dominio ejecuta regla ──► IRepository.AddAsync() ──► SaveChangesAsync()
    └── Si es LECTURA: DbContext.Set<T>().AsNoTracking().Select(...) ──► Directo a DTO (Sin overhead)
        │
        ▼
[6. Response DTO (Record Inmutable)]
        │
        ▼
[7. Controller Action] (Retorna ActionResult<TResponse> con 200, 201 o 204)
```

---

## 5. Implementación Paso a Paso con Código Real

### Paso 1: Definir los DTOs (Records Inmutables)
Los DTOs definen los contratos externos sin exponer la estructura de base de datos.

```csharp
// Application/Features/Projects/DTOs/ProjectDtos.cs
namespace Portfolio.Application.Features.Projects.DTOs;

public sealed record CreateProjectRequestDto(
    string Title,
    string Description,
    string RepositoryUrl,
    string? LiveDemoUrl,
    string[] Technologies,
    bool IsFeatured
);

public sealed record ProjectResponseDto(
    Guid Id,
    string Title,
    string Description,
    string RepositoryUrl,
    string? LiveDemoUrl,
    IReadOnlyList<string> Technologies,
    bool IsFeatured,
    DateTime CreatedAtUtc
);
```

---

### Paso 2: Command o Query (MediatR `IRequest<T>`)
Representa la intención del usuario. El Command muta estado; la Query solo consulta.

```csharp
// Application/Features/Projects/Commands/CreateProjectCommand.cs
using MediatR;
using Portfolio.Application.Features.Projects.DTOs;

namespace Portfolio.Application.Features.Projects.Commands;

public sealed record CreateProjectCommand(
    string Title,
    string Description,
    string RepositoryUrl,
    string? LiveDemoUrl,
    string[] Technologies,
    bool IsFeatured
) : IRequest<ProjectResponseDto>;
```

---

### Paso 3: Validación con FluentValidation
Valida la integridad de los datos antes de que el Handler sea ejecutado.

```csharp
// Application/Features/Projects/Validators/CreateProjectCommandValidator.cs
using FluentValidation;
using Portfolio.Application.Features.Projects.Commands;

namespace Portfolio.Application.Features.Projects.Validators;

public sealed class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("El título del proyecto es obligatorio.")
            .MaximumLength(150).WithMessage("El título no puede exceder 150 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(1000).WithMessage("La descripción no puede exceder 1000 caracteres.");

        RuleFor(x => x.RepositoryUrl)
            .NotEmpty().WithMessage("La URL del repositorio es obligatoria.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("La URL del repositorio no es válida.");

        RuleFor(x => x.Technologies)
            .NotEmpty().WithMessage("Debe incluir al menos una tecnología.");
    }
}
```

#### Pipeline de Validación Automático (ValidationBehavior)
MediatR ejecuta este pipeline antes del Handler; si la validación falla, lanza `ValidationException` que el `GlobalExceptionHandler` captura retornando HTTP 422:

```csharp
// Application/Common/Behaviors/ValidationBehavior.cs
using FluentValidation;
using MediatR;

namespace Portfolio.Application.Common.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}
```

---

### Paso 4: Handler (`IRequestHandler<T, TResponse>`)
Orquesta la lógica de negocio delegando la persistencia a través de la interfaz del repositorio.

```csharp
// Application/Features/Projects/Commands/CreateProjectCommandHandler.cs
using MediatR;
using Portfolio.Application.Features.Projects.DTOs;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;

namespace Portfolio.Application.Features.Projects.Commands;

public sealed class CreateProjectCommandHandler(IProjectRepository projectRepository)
    : IRequestHandler<CreateProjectCommand, ProjectResponseDto>
{
    public async Task<ProjectResponseDto> Handle(
        CreateProjectCommand request,
        CancellationToken cancellationToken)
    {
        // Creación y encapsulación en entidad de dominio
        var project = Project.Create(
            request.Title,
            request.Description,
            request.RepositoryUrl,
            request.LiveDemoUrl,
            request.Technologies,
            request.IsFeatured
        );

        await projectRepository.AddAsync(project, cancellationToken);
        await projectRepository.SaveChangesAsync(cancellationToken);

        return new ProjectResponseDto(
            project.Id,
            project.Title,
            project.Description,
            project.RepositoryUrl,
            project.LiveDemoUrl,
            project.Technologies,
            project.IsFeatured,
            project.CreatedAtUtc
        );
    }
}
```

---

### Paso 5: Dominio e Inversión de Persistencia

#### A. Entidad de Dominio Pura (Sin EF Core)
```csharp
// Domain/Entities/Project.cs
namespace Portfolio.Domain.Entities;

public sealed class Project
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string RepositoryUrl { get; private set; } = string.Empty;
    public string? LiveDemoUrl { get; private set; }
    public List<string> Technologies { get; private set; } = [];
    public bool IsFeatured { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private Project() { } // Constructor privado para EF Core

    public static Project Create(
        string title,
        string description,
        string repoUrl,
        string? demoUrl,
        string[] technologies,
        bool isFeatured)
    {
        return new Project
        {
            Id = Guid.NewGuid(),
            Title = title.Trim(),
            Description = description.Trim(),
            RepositoryUrl = repoUrl.Trim(),
            LiveDemoUrl = demoUrl?.Trim(),
            Technologies = [..technologies],
            IsFeatured = isFeatured,
            CreatedAtUtc = DateTime.UtcNow
        };
    }
}
```

#### B. Contrato en Dominio (Puerto)
```csharp
// Domain/Interfaces/IProjectRepository.cs
using Portfolio.Domain.Entities;

namespace Portfolio.Domain.Interfaces;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken cancellationToken);
    Task AddAsync(Project project, CancellationToken cancellationToken);
    void Remove(Project project);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
```

#### C. Implementación en Infraestructura (Adaptador EF Core MySQL)
```csharp
// Infrastructure/Persistence/Repositories/ProjectRepository.cs
using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Interfaces;
using Portfolio.Infrastructure.Persistence.Context;

namespace Portfolio.Infrastructure.Persistence.Repositories;

public sealed class ProjectRepository(PortfolioDbContext context) : IProjectRepository
{
    public async Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        => await context.Projects.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken cancellationToken)
        => await context.Projects.AsNoTracking().ToListAsync(cancellationToken);

    public async Task AddAsync(Project project, CancellationToken cancellationToken)
        => await context.Projects.AddAsync(project, cancellationToken);

    public void Remove(Project project)
        => context.Projects.Remove(project);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        => await context.SaveChangesAsync(cancellationToken);
}
```

#### D. Contexto EF Core MySQL y Migraciones

```csharp
// Infrastructure/Persistence/Context/PortfolioDbContext.cs
using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Context;

public sealed class PortfolioDbContext(DbContextOptions<PortfolioDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PortfolioDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
```

Registro de Inyección en `Infrastructure/DependencyInjection.cs`:
```csharp
public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    services.AddDbContext<PortfolioDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

    services.AddScoped<IProjectRepository, ProjectRepository>();
    return services;
}
```

Comandos de Migración MySQL:
```bash
dotnet ef migrations add InitialCreate --project src/Portfolio.Infrastructure --startup-project src/Portfolio.WebApi
dotnet ef database update --project src/Portfolio.Infrastructure --startup-project src/Portfolio.WebApi
```

---

### Paso 6 & 7: Controlador REST en WebApi

```csharp
// WebApi/Controllers/ProjectsController.cs
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.Features.Projects.Commands;
using Portfolio.Application.Features.Projects.DTOs;
using Portfolio.Application.Features.Projects.Queries;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public sealed class ProjectsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetProjectsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")] // Protegido por RBAC para que Bryan gestione sus proyectos
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<ProjectResponseDto>> Create(
        [FromBody] CreateProjectRequestDto request,
        CancellationToken cancellationToken)
    {
        var command = new CreateProjectCommand(
            request.Title,
            request.Description,
            request.RepositoryUrl,
            request.LiveDemoUrl,
            request.Technologies,
            request.IsFeatured
        );

        var created = await sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }
}
```

---

## 6. Endpoints Interactivos Públicos (Live Playground)

Para que los visitantes y reclutadores interactúen con el backend sin autenticación pero con rate-limiting nativo para evitar abusos o denegación de servicio:

```csharp
// WebApi/Controllers/InteractiveController.cs
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Application.Features.Interactive.DTOs;
using Portfolio.Application.Features.Interactive.Queries;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[EnableRateLimiting("interactive-policy")] // Límite nativo de .NET 8/9 (ej. 30 req/min por IP)
public sealed class InteractiveController(ISender sender) : ControllerBase
{
    [HttpGet("ping")]
    [ProducesResponseType(typeof(PingResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PingResponseDto>> Ping(CancellationToken cancellationToken)
    {
        var response = await sender.Send(new PingServerQuery(), cancellationToken);
        return Ok(response);
    }

    [HttpGet("telemetry")]
    [ProducesResponseType(typeof(ServerTelemetryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ServerTelemetryDto>> Telemetry(CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetServerTelemetryQuery(), cancellationToken);
        return Ok(response);
    }
}
```

Configuración en `WebApi/Program.cs`:
```csharp
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("interactive-policy", opt =>
    {
        opt.PermitLimit = 30; // Máximo 30 peticiones
        opt.Window = TimeSpan.FromMinutes(1); // por cada minuto
        opt.QueueLimit = 0;
    });
});
// En el pipeline:
app.UseRateLimiter();
```

---

## 7. Seguridad y RBAC (Administración para Bryan)

1. **Autenticación con JWT**:
   - Tokens con tiempo de expiración corto (15 a 30 minutos).
   - `ClockSkew = TimeSpan.Zero` obligatorio para no permitir ventanas de tokens vencidos.
2. **Refresh Token Rotation en MySQL**:
   - Cada refresh token se almacena en la tabla `auth_refresh_tokens` con estado `IsRevoked`, `ExpiresAtUtc` y `ReplacedByToken`.
   - Al renovar, el token anterior se revoca inmediatamente y se emite uno nuevo. Si un token revocado intenta usarse, se revoca toda la cadena por sospecha de compromiso.

```csharp
// Domain/Entities/RefreshToken.cs
namespace Portfolio.Domain.Entities;

public sealed class RefreshToken
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; private set; }
    public bool IsRevoked { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAtUtc;
    public void Revoke() => IsRevoked = true;
}
```

3. **RBAC Simple y Efectivo**:
   - Roles en Claim: `Role: Admin`, `Role: Visitor`.
   - Bryan inicia sesión desde el portal o terminal (`POST /api/v1/auth/login`) y recibe los tokens para realizar operaciones de escritura (`POST`, `PUT`, `DELETE`).
   - Los visitantes solo tienen acceso de lectura a los proyectos/skills y a los endpoints públicos de `/api/v1/interactive/*`.

---

## 8. Manejo Centralizado de Errores — ProblemDetails RFC 7807

```csharp
// WebApi/Middleware/GlobalExceptionHandler.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Domain.Exceptions;

namespace Portfolio.WebApi.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Excepción capturada: {Message}", exception.Message);

        var (statusCode, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Recurso no encontrado"),
            FluentValidation.ValidationException => (StatusCodes.Status422UnprocessableEntity, "Error de validación"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "No autorizado"),
            _ => (StatusCodes.Status500InternalServerError, "Error interno del servidor")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
```

---

## 9. Anti-Patrones Prohibidos en Backend

| Anti-patrón Prohibido | Solución Obligatoria |
|---|---|
| Crear `GenericRepository<T>` con docenas de métodos genéricos | Contratos de repositorio específicos por entidad con los métodos exactos necesarios |
| Envolver `DbContext` en una clase `UnitOfWork` casera | Usar `PortfolioDbContext` directamente como Unit of Work |
| Usar AutoMapper con perfiles complejos y mapeo por reflexión | Proyección directa `.Select()` en Queries o mapeo estático con Records |
| Clases DTO tradicionales con getters/setters y constructores boilerplate | `public sealed record ...` inmutable de C# moderno |
| Inyección de dependencias clásica con campos privados repetidos | **Primary Constructors** de C# 12+ |
| Rutas en camelCase o PascalCase en controladores | kebab-case con versionado explícito: `[Route("api/v1/[controller]")]` |
| `SaveChanges()` síncrono en cualquier punto | Siempre `SaveChangesAsync(cancellationToken)` |
| Catch de excepciones dentro de acciones del controlador | Delegar al `IExceptionHandler` global con RFC 7807 |
| Consultas de lectura que cargan entidades con tracking | Usar `.AsNoTracking()` o `.Select()` directo a DTO |
