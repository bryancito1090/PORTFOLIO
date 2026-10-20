# ==============================================================================
# Dockerfile Multi-Stage: Backend .NET 8/9 Clean Architecture (ARM64 / x86_64)
# ==============================================================================

# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar definiciones de solución y proyectos para aprovechar caché de Docker
COPY ["Directory.Build.props", "./"]
COPY ["src/Portfolio.Domain/Portfolio.Domain.csproj", "src/Portfolio.Domain/"]
COPY ["src/Portfolio.Application/Portfolio.Application.csproj", "src/Portfolio.Application/"]
COPY ["src/Portfolio.Infrastructure/Portfolio.Infrastructure.csproj", "src/Portfolio.Infrastructure/"]
COPY ["src/Portfolio.WebApi/Portfolio.WebApi.csproj", "src/Portfolio.WebApi/"]

RUN dotnet restore "src/Portfolio.WebApi/Portfolio.WebApi.csproj"

# Copiar código fuente y publicar artefactos optimizados
COPY ["src/", "src/"]
WORKDIR "/src/src/Portfolio.WebApi"
RUN dotnet publish "Portfolio.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ------------------------------------------------------------------------------
# Stage 2: Runtime Production Container
# ------------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Puerto no-root estándar de .NET 8/9
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true

COPY --from=build /app/publish .

# Usuario con privilegios mínimos (UID predeterminado de Microsoft en .NET 8)
USER $APP_UID

ENTRYPOINT ["dotnet", "Portfolio.WebApi.dll"]
