# 04 // DIAGNÓSTICO DEL ESTADO ACTUAL — BACKEND (.NET)
> *Evaluación de la Carpeta src/backend, Brechas Identificadas y Hoja de Implementación.*

---

## 1. Situación Actual de `src/backend/`

Una inspección directa del directorio [`src/backend/`](file:///home/bryan/Projects/PORTFOLIO/src/backend) revela que actualmente **es una carpeta vacía**.

### Contexto:
- El diseño conceptual y las reglas de codificación están plenamente detalladas en el archivo de especificación [`.agents/skills/portfolio-backend/SKILL.md`](file:///home/bryan/Projects/PORTFOLIO/.agents/skills/portfolio-backend/SKILL.md).
- El esquema relacional de base de datos está completamente diseñado en [`database/schema.sql`](file:///home/bryan/Projects/PORTFOLIO/database/schema.sql).
- En el frontend, varias llamadas que idealmente deberían ser atendidas por el backend .NET (como el libro de visitas, catálogo dinámico de proyectos, y métricas del servidor) se manejan actualmente mediante datos estáticos en memoria, `localStorage` o simulación en TypeScript.

---

## 2. Matriz de Brechas (Gap Analysis)

| Componente Requerido | Estado Actual | Solución Planificada |
|---|---|---|
| **Estructura de Solución .NET** | No creada | Crear solución `Portfolio.sln` con las 4 capas de Clean Architecture: `Domain`, `Application`, `Infrastructure`, `WebApi`. |
| **Entidades de Dominio** | Definidas en schema SQL | Mapear a C# puro en `Portfolio.Domain/Entities/` (`Project`, `Skill`, `User`, `RefreshToken`, etc.). |
| **Persistencia EF Core MySQL** | Solo script SQL suelto | Configurar `PortfolioDbContext` en `Infrastructure` usando `Pomelo.EntityFrameworkCore.MySql` con mapeos Fluent API. |
| **Casos de Uso CQRS** | Especificados en doc | Implementar Commands y Queries con MediatR y `ValidationBehavior` con FluentValidation. |
| **Endpoints REST WebApi** | No implementados | Controladores `ProjectsController`, `SkillsController`, `InteractiveController`, `AuthController`. |
| **ProblemDetails RFC 7807** | Solo especificado | Middleware global con `IExceptionHandler` nativo de .NET 8/9. |
| **Rate Limiter Nativo** | Solo especificado | Configurar `AddRateLimiter` con política fija de 30 req/min por IP. |
| **Dockerización Backend** | Pendiente | Crear `Dockerfile` multi-stage ligero para compilar y servir la WebApi en el servidor de Oracle Cloud. |

---

## 3. Plan de Construcción Paso a Paso para el Backend

Para levantar el backend siguiendo rigurosamente Clean Architecture y Ponytail (cero sobreingeniería):

### Paso 1: Inicialización de la Solución .NET
```bash
cd src/backend
dotnet new sln -n Portfolio
dotnet new classlib -n Portfolio.Domain -f net9.0
dotnet new classlib -n Portfolio.Application -f net9.0
dotnet new classlib -n Portfolio.Infrastructure -f net9.0
dotnet new webapi -n Portfolio.WebApi -f net9.0 --no-openapi

dotnet sln add Portfolio.Domain/Portfolio.Domain.csproj
dotnet sln add Portfolio.Application/Portfolio.Application.csproj
dotnet sln add Portfolio.Infrastructure/Portfolio.Infrastructure.csproj
dotnet sln add Portfolio.WebApi/Portfolio.WebApi.csproj

# Referencias entre capas (estrictamente hacia adentro)
dotnet add Portfolio.Application/Portfolio.Application.csproj reference Portfolio.Domain/Portfolio.Domain.csproj
dotnet add Portfolio.Infrastructure/Portfolio.Infrastructure.csproj reference Portfolio.Application/Portfolio.Application.csproj
dotnet add Portfolio.Infrastructure/Portfolio.Infrastructure.csproj reference Portfolio.Domain/Portfolio.Domain.csproj
dotnet add Portfolio.WebApi/Portfolio.WebApi.csproj reference Portfolio.Application/Portfolio.Application.csproj
dotnet add Portfolio.WebApi/Portfolio.WebApi.csproj reference Portfolio.Infrastructure/Portfolio.Infrastructure.csproj
```

### Paso 2: Instalación Quirúrgica de Paquetes NuGet (Sin Bloat)
- **Application**: `MediatR` y `FluentValidation.DependencyInjectionExtensions`.
- **Infrastructure**: `Pomelo.EntityFrameworkCore.MySql`, `Microsoft.EntityFrameworkCore.Design`, `BCrypt.Net-Next`.
- **WebApi**: `Microsoft.AspNetCore.Authentication.JwtBearer`.

### Paso 3: Vinculación con el Frontend
Una vez desplegado el backend, sustituir los adaptadores locales del frontend por [`HttpInteractiveDemoAdapter`](file:///home/bryan/Projects/PORTFOLIO/src/frontend/src/app/infrastructure/adapters) y los correspondientes puertos para proyectos y mensajes del libro de visitas.
