# 04 // DIAGNÓSTICO DEL ESTADO ACTUAL — BACKEND (.NET)
> *Evaluación de la Carpeta src/backend, Arquitectura Implementada y Estado de Validación.*

---

## 1. Situación Actual de `src/backend/`

La carpeta [`src/backend/`](file:///home/bryan/Projects/PORTFOLIO/src/backend) se encuentra **completamente implementada y operativa**, siguiendo Clean Architecture estricta en .NET 8 con soporte multi-versión (RollForward LatestMajor para compatibilidad nativa con .NET 9).

### Estructura de la Solución (`Portfolio.sln`):
```
src/backend/
├── Portfolio.sln
├── Directory.Build.props                  <- RollForward LatestMajor
├── src/
│   ├── Portfolio.Domain/                 <- Cero dependencias externas
│   │   ├── Entities/                     <- Project, Skill, ProjectSkill, InteractiveMessage, GameScore, User, RefreshToken, ContactInquiry
│   │   ├── Enums/                        <- SkillCategory, MessageOrigin, InquiryStatus
│   │   ├── Exceptions/                   <- DomainException, NotFoundException
│   │   └── Interfaces/                   <- Repositorios específicos por agregado
│   │
│   ├── Portfolio.Application/            <- Casos de uso (CQRS)
│   │   ├── Common/                       <- ValidationBehavior (MediatR Pipeline)
│   │   ├── Features/Projects/            <- GetProjectsQuery, GetProjectBySlugQuery
│   │   ├── Features/Skills/              <- GetSkillsQuery
│   │   ├── Features/Guestbook/           <- CreateGuestbookMessageCommand, GetGuestbookMessagesQuery
│   │   ├── Features/Telemetry/           <- GetServerTelemetryQuery
│   │   └── Features/Leaderboard/         <- SubmitGameScoreCommand, GetLeaderboardQuery
│   │
│   ├── Portfolio.Infrastructure/         <- Persistencia y Seguridad
│   │   ├── Persistence/Context/          <- PortfolioDbContext (EF Core con Pomelo MySQL)
│   │   ├── Persistence/Configurations/   <- Mapeos Fluent API 3NF
│   │   ├── Persistence/Repositories/     <- Implementaciones de repositorios
│   │   └── Security/                     <- JwtTokenGenerator y PasswordHasher (BCrypt)
│   │
│   └── Portfolio.WebApi/                 <- Punto de entrada HTTP
│       ├── Controllers/                  <- Projects, Skills, Telemetry, Guestbook, Leaderboard
│       ├── Middleware/                   <- GlobalExceptionHandler (RFC 7807 ProblemDetails)
│       ├── appsettingsdevelop.json       <- Plantilla pública segura sin credenciales (versionada)
│       ├── appsettings.json              <- Secretos locales (excluido en .gitignore)
│       └── Program.cs                    <- Pipeline HTTP, DI, CORS, Swagger UI
│
└── tests/
    └── Portfolio.UnitTests/              <- Suite de 11 pruebas unitarias xUnit
```

---

## 2. Matriz de Estado

| Componente | Estado | Detalle |
|---|---|---|
| **Estructura de Solución .NET** | ✅ Implementada | `Portfolio.sln` con las 4 capas limpias y suite de tests. |
| **Entidades de Dominio** | ✅ Implementadas | Mapeadas en C# 12 con factorías estáticas e inmutabilidad. |
| **Persistencia EF Core MySQL** | ✅ Implementada | `PortfolioDbContext` con `Pomelo.EntityFrameworkCore.MySql` y Fluent API. |
| **Casos de Uso CQRS** | ✅ Implementados | Commands y Queries con MediatR y `ValidationBehavior`. |
| **Endpoints REST WebApi** | ✅ Implementados | `Projects`, `Skills`, `Telemetry`, `Guestbook`, `Leaderboard`. |
| **ProblemDetails RFC 7807** | ✅ Implementado | `GlobalExceptionHandler` con `IExceptionHandler` nativo. |
| **Seguridad de Configuración** | ✅ Implementada | `appsettingsdevelop.json` sin secretos en Git; `appsettings.json` en `.gitignore`. |
| **Pruebas Unitarias** | ✅ Aprobadas | 11/11 tests pasando en Release en 58 ms. |
| **CI/CD en Forgejo** | ✅ Validado | Job `validate-backend` corriendo en ARM64 con contenedor `dotnet-runner`. |
