# 02 // ESTADO ACTUAL — BASE DE DATOS MYSQL
> *Esquema Relacional en Tercera Forma Normal (3NF), Optimización de Índices y Datos Semilla.*

---

## 1. Ficha Técnica de la Base de Datos

- **Archivo Fuente**: [`database/schema.sql`](file:///home/bryan/Projects/PORTFOLIO/database/schema.sql)
- **Base de Datos**: `portfolio_db`
- **Motor**: MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine)
- **Charset & Collation**: `utf8mb4` / `utf8mb4_unicode_ci` (compatibilidad total con símbolos, tildes y caracteres especiales)
- **Diseño**: Minimalista, normalizado en **Tercera Forma Normal (3NF)** y guiado por la filosofía Ponytail (cero sobreingeniería relacional).

---

## 2. Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "posee (1:N)"
    PROJECTS ||--o{ PROJECT_SKILLS : "utiliza (1:N)"
    SKILLS ||--o{ PROJECT_SKILLS : "está en (1:N)"
    
    USERS {
        char(36) id PK
        varchar(50) username UK
        varchar(100) email UK
        varchar(255) password_hash
        varchar(20) role
        datetime created_at_utc
        datetime updated_at_utc
    }

    REFRESH_TOKENS {
        char(36) id PK
        char(36) user_id FK
        varchar(255) token_hash
        datetime expires_at_utc
        boolean is_revoked
        datetime created_at_utc
        varchar(255) replaced_by_token
    }

    PROJECTS {
        char(36) id PK
        varchar(100) slug UK
        varchar(150) title
        varchar(255) short_description
        text full_description
        varchar(255) repository_url
        varchar(255) live_demo_url
        varchar(255) thumbnail_url
        boolean is_featured
        smallint display_order
        datetime created_at_utc
        datetime updated_at_utc
    }

    SKILLS {
        char(36) id PK
        varchar(50) name UK
        enum category
        varchar(50) icon_slug
        tinyint proficiency_percentage
        smallint display_order
        boolean is_featured
        datetime created_at_utc
    }

    PROJECT_SKILLS {
        char(36) project_id PK, FK
        char(36) skill_id PK, FK
    }

    INTERACTIVE_MESSAGES {
        char(36) id PK
        varchar(60) sender_name
        varchar(100) sender_contact
        varchar(500) message
        enum origin
        boolean is_approved
        datetime created_at_utc
    }

    CONTACT_INQUIRIES {
        char(36) id PK
        varchar(100) full_name_or_company
        varchar(100) email
        varchar(30) phone
        varchar(50) service_type
        text project_details
        enum status
        varchar(45) ip_address
        datetime created_at_utc
        datetime replied_at_utc
    }
```

---

## 3. Justificación y Propósito de Cada Tabla

### 1. `users` (Autenticación y RBAC del Propietario)
- **Propósito**: Almacena las credenciales administrativas de Bryan para el futuro backoffice.
- **Decisión Ponytail**: Se evita crear una maraña de tablas `roles`, `permissions` y `user_roles`. Al existir solo dos roles (`Admin` y `Visitor`), una columna `role VARCHAR(20)` es la solución más limpia y eficiente.

### 2. `refresh_tokens` (Rotación Segura de Sesiones JWT)
- **Propósito**: Permite mantener la sesión activa de Bryan sin emitir JWTs de larga duración.
- **Seguridad**: Soporta invalidación en cadena (`replaced_by_token`, `is_revoked`) con borrado en cascada ligado al usuario.

### 3. `skills` (Catálogo de Habilidades Técnicas)
- **Propósito**: Administradas vía CRUD por Bryan. Se categorizan en `Backend`, `Frontend`, `Database`, `DevOps` y `Architecture`.
- **Uso**: Consumidas por el frontend y por la terminal interactiva (`cat skills.json` o `fetch skills`).

### 4. `projects` (Proyectos del Portafolio)
- **Propósito**: Catálogo completo de proyectos destacados y secundarios.
- **Ventaja**: Permite a Bryan agregar o editar proyectos en producción sin tener que volver a compilar o redesplegar el frontend. Incluye `slug` amigable para URLs directas y comandos en terminal.

### 5. `project_skills` (Tabla Intermedia N:M)
- **Propósito**: Resuelve la relación muchos a muchos entre Proyectos y Habilidades sin duplicar cadenas de texto en arrays no normalizados.

### 6. `interactive_messages` (Libro de Visitas / Guestbook)
- **Propósito**: Almacena las firmas dejadas por reclutadores y visitantes técnicos desde el comando `guestbook sign "mensaje"` de la terminal Linux interactiva o el probador de API en vivo.

### 7. `contact_inquiries` (Consultas Técnicas B2B y Propuestas)
- **Propósito**: Almacena leads comerciales privados enviados desde el formulario web de contacto.
- **Seguridad**: Totalmente aislada del libro de visitas público. Incluye trazabilidad de IP (`ip_address`), estado (`New`, `Read`, `Replied`, `Archived`) y fecha de respuesta.

---

## 4. Estado de Migración y Datos Semilla (Seeds)

El archivo `database/schema.sql` ya incluye los datos semilla listos para ejecución inmediata:
- **Usuario Admin Inicial**: UUID `11111111-1111-1111-1111-111111111111`, username `bryan`, con contraseña hasheada.
- **Habilidades Base**: .NET 8/9, Clean Architecture & CQRS, Angular & Signals, MySQL / EF Core, Docker & CI/CD.
- **Proyecto Semilla**: Portafolio Profesional Interactivo vinculado a las habilidades clave.
- **Mensaje de Bienvenida**: Registro inicial de `Kernel Bot` en el libro de visitas.
- **Consulta de Contacto de Prueba**: Solicitud simulada de modernización de arquitectura.
