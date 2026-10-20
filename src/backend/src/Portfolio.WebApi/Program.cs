using Microsoft.OpenApi.Models;
using Portfolio.Application;
using Portfolio.Infrastructure;
using Portfolio.Infrastructure.Persistence.Context;
using Portfolio.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuracion en cascada: appsettingsdevelop.json (base segura en Git) + appsettings.json (secretos locales)
builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettingsdevelop.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// 2. Inyeccion de dependencias de Capas (Clean Architecture)
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// 3. Manejo Global de Excepciones (RFC 7807 ProblemDetails)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 4. Controladores y Serializacion JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// 5. Configuracion de CORS para Angular Frontend
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200", "https://bryan-bano.com", "https://portfolio.bryan-bano.com"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("PortfolioCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. OpenAPI / Swagger con documentacion Cyber-Zen
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Bryan Baño // Portfolio API",
        Version = "v1",
        Description = "API REST de alto rendimiento para el portafolio profesional interactivo. Clean Architecture, CQRS y persistencia MySQL.",
        Contact = new OpenApiContact
        {
            Name = "Bryan Baño",
            Email = "contacto@bryan-bano.com",
            Url = new Uri("https://bryan-bano.com")
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Pipeline de Solicitudes HTTP
app.UseExceptionHandler();

if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwaggerInProd", true))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portfolio API v1");
        c.DocumentTitle = "Bryan Baño // API Documentation";
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("PortfolioCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Healthcheck basico en raiz
app.MapGet("/", () => Results.Ok(new
{
    service = "Portfolio Backend API",
    status = "Online",
    version = "1.0.0",
    docs = "/swagger"
}));

// 8. Auto-provisionamiento de esquema de base de datos en arranque
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PortfolioDbContext>();
    try
    {
        db.Database.EnsureCreated();
        app.Logger.LogInformation("Esquema de base de datos asegurado correctamente.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "No se pudo sincronizar la base de datos al inicio. Verifica la conexión a MySQL.");
    }
}

app.Run();
