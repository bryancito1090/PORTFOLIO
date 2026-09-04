-- ==============================================================================
-- BASE DE DATOS: portfolio_db
-- MOTOR: MySQL 8.0+ / MariaDB 10.4+ / InnoDB
-- CHARSET: utf8mb4 / utf8mb4_unicode_ci
-- DESCRIPCIÓN: Esquema relacional minimalista y sin duplicación para
--              Portafolio Interactivo (Zen + Retro + Clean Arch .NET & Angular)
-- NOTA DBEAVER: Ejecutar todo el archivo con Alt + X (Ejecutar Script SQL / ▶▶).
--               No usar Ctrl + Enter sobre múltiples sentencias (error 1064).
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `portfolio_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `portfolio_db`;

-- ------------------------------------------------------------------------------
-- 1. TABLA: users (Autenticación y RBAC del Administrador)
-- Justificación: Almacena la cuenta del propietario (Bryan) para acceder al panel
-- administrativo. No se crean tablas complejas de 'roles' o 'permisos' porque
-- solo existen 2 roles en el sistema (Admin y Visitor). Un campo 'role' es la
-- solución más limpia y minimalista (Ponytail).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'Admin',
  `created_at_utc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_utc` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLA: refresh_tokens (Rotación segura de Tokens JWT)
-- Justificación: Permite mantener la sesión de administración de Bryan de forma
-- segura sin almacenar JWTs de larga duración. Si se detecta un token revocado,
-- se invalida la cadena. Relación 1:N con 'users' con borrado en cascada.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at_utc` DATETIME NOT NULL,
  `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at_utc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `replaced_by_token` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  KEY `idx_refresh_tokens_validation` (`user_id`, `is_revoked`, `expires_at_utc`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLA: skills (Catálogo de Habilidades Técnicas)
-- Justificación: Administradas por Bryan vía CRUD. Se renderizan en el frontend
-- y se consultan desde el comando 'skills' de la terminal Linux interactiva.
-- Normaliza los nombres técnicos para que no se dupliquen strings en los proyectos.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `skills` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `category` ENUM('Backend', 'Frontend', 'Database', 'DevOps', 'Architecture') NOT NULL,
  `icon_slug` VARCHAR(50) NULL DEFAULT NULL,
  `proficiency_percentage` TINYINT UNSIGNED NOT NULL DEFAULT 85,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_featured` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at_utc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_skills_name` (`name`),
  KEY `idx_skills_category_order` (`category`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: projects (Proyectos del Portafolio)
-- Justificación: Catálogo de proyectos destacados y proyectos generales. Permite
-- a Bryan crear/editar proyectos sin tocar código. Contiene slugs amigables para
-- URLs y terminal (`projects show [slug]`), enlaces a repositorios y demos en vivo.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` CHAR(36) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `short_description` VARCHAR(255) NOT NULL,
  `full_description` TEXT NOT NULL,
  `repository_url` VARCHAR(255) NOT NULL,
  `live_demo_url` VARCHAR(255) NULL DEFAULT NULL,
  `thumbnail_url` VARCHAR(255) NULL DEFAULT NULL,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at_utc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_utc` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_projects_slug` (`slug`),
  KEY `idx_projects_featured_order` (`is_featured`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: project_skills (Tabla Intermedia N:M Proyectos <-> Habilidades)
-- Justificación: Evita la duplicación de datos (3FN). Un proyecto usa muchas
-- tecnologías y una tecnología está en muchos proyectos. Permite filtrar
-- proyectos por tecnología con indexación real sin recurrir a campos de texto
-- plano o arrays desnormalizados difíciles de consultar.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_skills` (
  `project_id` CHAR(36) NOT NULL,
  `skill_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`project_id`, `skill_id`),
  KEY `idx_project_skills_skill` (`skill_id`),
  CONSTRAINT `fk_project_skills_project` FOREIGN KEY (`project_id`)
    REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_skills_skill` FOREIGN KEY (`skill_id`)
    REFERENCES `skills` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLA: interactive_messages (Libro de Visitas / Mensajes Interactivos)
-- Justificación: Permite a reclutadores y visitantes dejar una firma o mensaje
-- desde el comando interactivo de la terminal Linux (`guestbook sign "Mensaje"`)
-- o el probador de API en vivo. Demuestra operaciones de escritura inmediatas
-- y controladas en el backend con almacenamiento persistente.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `interactive_messages` (
  `id` CHAR(36) NOT NULL,
  `sender_name` VARCHAR(60) NOT NULL,
  `sender_contact` VARCHAR(100) NULL DEFAULT NULL,
  `message` VARCHAR(500) NOT NULL,
  `origin` ENUM('Terminal', 'WebForm', 'ApiTester') NOT NULL DEFAULT 'Terminal',
  `is_approved` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at_utc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_approved_date` (`is_approved`, `created_at_utc` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLA: contact_inquiries (Consultas Técnicas & Solicitudes de Propuesta)
-- Justificación: Almacena leads comerciales B2B y requerimientos de clientes de
-- forma privada y segura. Separada estrictamente de 'interactive_messages' (que es
-- un libro de visitas público). Soporta filtrado por estado y auditoría por IP.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` CHAR(36) NOT NULL,
  `full_name_or_company` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NULL DEFAULT NULL,
  `service_type` VARCHAR(50) NOT NULL DEFAULT 'Otro',
  `project_details` TEXT NOT NULL,
  `status` ENUM('New', 'Read', 'Replied', 'Archived') NOT NULL DEFAULT 'New',
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `created_at_utc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `replied_at_utc` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_inquiries_status_created` (`status`, `created_at_utc` DESC),
  KEY `idx_inquiries_created` (`created_at_utc` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA INICIAL (Datos de prueba para arranque inmediato)
-- ==============================================================================

-- 1. Usuario Administrador Inicial (Bryan)
-- Contraseña temporal por defecto: 'Admin123*!' (hasheada con BCrypt/PBKDF2 para prueba)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'bryan',
  'bryan@portfolio.local',
  '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin'
) ON DUPLICATE KEY UPDATE `username` = `username`;

-- 2. Habilidades Iniciales
INSERT INTO `skills` (`id`, `name`, `category`, `icon_slug`, `proficiency_percentage`, `display_order`, `is_featured`)
VALUES
  ('22222222-0001-0000-0000-000000000001', '.NET 8/9 / C#', 'Backend', 'dotnet', 95, 1, TRUE),
  ('22222222-0002-0000-0000-000000000002', 'Clean Architecture & CQRS', 'Architecture', 'architecture', 95, 2, TRUE),
  ('22222222-0003-0000-0000-000000000003', 'Angular & Signals', 'Frontend', 'angular', 90, 3, TRUE),
  ('22222222-0004-0000-0000-000000000004', 'MySQL / EF Core', 'Database', 'mysql', 90, 4, TRUE),
  ('22222222-0005-0000-0000-000000000005', 'Docker & CI/CD', 'DevOps', 'docker', 85, 5, TRUE)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- 3. Proyecto Destacado Inicial
INSERT INTO `projects` (`id`, `slug`, `title`, `short_description`, `full_description`, `repository_url`, `live_demo_url`, `is_featured`, `display_order`)
VALUES (
  '33333333-0001-0000-0000-000000000001',
  'portfolio-interactivo-zen',
  'Portafolio Profesional Interactivo',
  'Portafolio interactivo con estética Zen Dark, 3D Hero desarmable, terminal Linux y backend .NET Clean Architecture.',
  'Sistema completo desarrollado con .NET 8/9, EF Core, MySQL, y Angular con Clean Architecture y Signals reactivos.',
  'https://github.com/bryan/portfolio',
  'https://portfolio.bryan.dev',
  TRUE,
  1
) ON DUPLICATE KEY UPDATE `slug` = `slug`;

-- 4. Vinculación Proyecto - Habilidades
INSERT INTO `project_skills` (`project_id`, `skill_id`)
VALUES
  ('33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001'),
  ('33333333-0001-0000-0000-000000000001', '22222222-0002-0000-0000-000000000002'),
  ('33333333-0001-0000-0000-000000000001', '22222222-0003-0000-0000-000000000003'),
  ('33333333-0001-0000-0000-000000000001', '22222222-0004-0000-0000-000000000004')
ON DUPLICATE KEY UPDATE `project_id` = `project_id`;

-- 5. Mensaje de Bienvenida en el Libro de Visitas
INSERT INTO `interactive_messages` (`id`, `sender_name`, `sender_contact`, `message`, `origin`)
VALUES (
  UUID(),
  'Kernel Bot',
  'system@zen.os',
  'Bienvenido a la terminal interactiva. Ejecuta "help" para comenzar.',
  'Terminal'
) ON DUPLICATE KEY UPDATE `sender_name` = `sender_name`;

-- 6. Consulta de Contacto Inicial de Prueba
INSERT INTO `contact_inquiries` (`id`, `full_name_or_company`, `email`, `phone`, `service_type`, `project_details`, `status`)
VALUES (
  '44444444-0001-0000-0000-000000000001',
  'Enterprise Solutions Corp',
  'contacto@enterprisesolutions.com',
  '+593 99 123 4567',
  'Desarrollo Backend',
  'Requerimos modernización de arquitectura monolítica a microservicios con .NET 9, Clean Architecture y CQRS.',
  'New'
) ON DUPLICATE KEY UPDATE `full_name_or_company` = `full_name_or_company`;

