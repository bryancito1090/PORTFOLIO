-- ==============================================================================
-- Portfolio MySQL Database Initialization & Seed Script
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `portfolio_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `portfolio_db`;

-- 1. Tabla de Habilidades Técnicas
CREATE TABLE IF NOT EXISTS `Skills` (
    `Id` VARCHAR(36) NOT NULL,
    `Name` VARCHAR(60) NOT NULL,
    `Category` INT NOT NULL,
    `ProficiencyPercentage` INT NOT NULL,
    `IconUrl` VARCHAR(255) NULL,
    `IsFeatured` TINYINT(1) NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL,
    `UpdatedAt` DATETIME(6) NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Proyectos de Producción
CREATE TABLE IF NOT EXISTS `Projects` (
    `Id` VARCHAR(36) NOT NULL,
    `Title` VARCHAR(120) NOT NULL,
    `Slug` VARCHAR(140) NOT NULL,
    `Summary` VARCHAR(300) NOT NULL,
    `Description` TEXT NOT NULL,
    `ArchitectureOverview` TEXT NOT NULL,
    `ThumbnailUrl` VARCHAR(255) NULL,
    `DemoUrl` VARCHAR(255) NULL,
    `RepositoryUrl` VARCHAR(255) NULL,
    `IsFeatured` TINYINT(1) NOT NULL DEFAULT 0,
    `OrderPriority` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL,
    `UpdatedAt` DATETIME(6) NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `UX_Projects_Slug` (`Slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla Intermedia Proyecto - Habilidad (Muchos a Muchos)
CREATE TABLE IF NOT EXISTS `ProjectSkills` (
    `ProjectId` VARCHAR(36) NOT NULL,
    `SkillId` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`ProjectId`, `SkillId`),
    CONSTRAINT `FK_ProjectSkills_Projects` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_ProjectSkills_Skills` FOREIGN KEY (`SkillId`) REFERENCES `Skills` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Firmas del Muro (Guestbook Wall)
CREATE TABLE IF NOT EXISTS `InteractiveMessages` (
    `Id` VARCHAR(36) NOT NULL,
    `SenderName` VARCHAR(80) NOT NULL,
    `SenderContact` VARCHAR(100) NULL,
    `Message` VARCHAR(500) NOT NULL,
    `Origin` INT NOT NULL DEFAULT 0,
    `IsApproved` TINYINT(1) NOT NULL DEFAULT 1,
    `LikesCount` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL,
    `UpdatedAt` DATETIME(6) NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Récords de Videojuegos Retro (Buscaminas)
CREATE TABLE IF NOT EXISTS `GameScores` (
    `Id` VARCHAR(36) NOT NULL,
    `GameCode` VARCHAR(30) NOT NULL,
    `PlayerTag` VARCHAR(10) NOT NULL,
    `Score` INT NOT NULL,
    `Difficulty` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    `SessionMetadataJson` TEXT NULL,
    `CreatedAt` DATETIME(6) NOT NULL,
    `UpdatedAt` DATETIME(6) NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de Contacto y Solicitudes
CREATE TABLE IF NOT EXISTS `ContactInquiries` (
    `Id` VARCHAR(36) NOT NULL,
    `FullName` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(120) NOT NULL,
    `Phone` VARCHAR(30) NULL,
    `ServiceType` VARCHAR(80) NOT NULL,
    `Details` TEXT NOT NULL,
    `Status` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME(6) NOT NULL,
    `UpdatedAt` DATETIME(6) NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Datos Iniciales Semilla (Seeds de Producción)
-- -----------------------------------------------------------------------------

INSERT IGNORE INTO `Skills` (`Id`, `Name`, `Category`, `ProficiencyPercentage`, `IsFeatured`, `CreatedAt`) VALUES
('skill-dotnet', '.NET 8 / .NET 9 Clean Architecture', 0, 95, 1, UTC_TIMESTAMP()),
('skill-csharp', 'C# Moderno (CQRS, MediatR, EF Core)', 0, 95, 1, UTC_TIMESTAMP()),
('skill-angular', 'Angular 20 Standalone & Signals', 1, 92, 1, UTC_TIMESTAMP()),
('skill-mysql', 'MySQL / PostgreSQL / Pomelo', 2, 88, 1, UTC_TIMESTAMP()),
('skill-docker', 'Docker Multi-Stage & Linux ARM64', 3, 90, 1, UTC_TIMESTAMP()),
('skill-n8n', 'n8n Workflow Automation & AI Agents', 4, 92, 1, UTC_TIMESTAMP());

INSERT IGNORE INTO `Projects` (`Id`, `Title`, `Slug`, `Summary`, `Description`, `ArchitectureOverview`, `IsFeatured`, `OrderPriority`, `CreatedAt`) VALUES
('proj-portfolio', 'High-Impact Full-Stack Portfolio', 'high-impact-portfolio', 
 'Vitrina técnica de alto impacto con Clean Architecture en .NET 8/9, Signals en Angular 20, monitor Retro CRT y automatización con n8n.', 
 'Portafolio interactivo desarrollado desde cero para demostrar maestría en ingeniería de software, observabilidad en tiempo real y micro-interacciones de 60 FPS.', 
 'Clean Architecture (.NET Domain, Application con CQRS, Infrastructure Pomelo MySQL, WebApi RFC 7807) + Angular 20 Signals Hexagonal.', 
 1, 1, UTC_TIMESTAMP());

INSERT IGNORE INTO `GameScores` (`Id`, `GameCode`, `PlayerTag`, `Score`, `Difficulty`, `CreatedAt`) VALUES
('score-1', 'MINESWEEPER', 'ZEN', 42, 'NORMAL', UTC_TIMESTAMP()),
('score-2', 'MINESWEEPER', 'NEO', 68, 'NORMAL', UTC_TIMESTAMP()),
('score-3', 'MINESWEEPER', 'BRY', 95, 'NORMAL', UTC_TIMESTAMP());

INSERT IGNORE INTO `InteractiveMessages` (`Id`, `SenderName`, `SenderContact`, `Message`, `Origin`, `IsApproved`, `CreatedAt`) VALUES
('msg-1', 'Kenji Sato', 'Tokio, Japón', 'Excelente combinación de arquitectura limpia y estética Zen con retro monitor.', 1, 1, UTC_TIMESTAMP()),
('msg-2', 'Sophia Lindqvist', 'Estocolmo, Suecia', 'El packet tracer visual en vivo demuestra un dominio real de redes y backend.', 0, 1, UTC_TIMESTAMP());
