# 02 // CASOS DE ESTUDIO — PROYECTOS REALES DESTACADOS
> *Análisis Técnico, Desafíos de Ingeniería, Solución Arquitectónica e Impacto Cuantificable.*

---

## 1. Ammi-Online (PRJ-01)

### Ficha Técnica:
- **Institución / Contexto**: Plataforma de Servicios y Consultoría Médica Online
- **Tecnologías**: Angular, .NET 8, Clean Architecture, JWT & RBAC, MediatR CQRS, MySQL
- **Color de Acento**: `#9ece6a` (Verde Tokio)

### Desafío de Ingeniería:
La plataforma requería coordinar citas, historiales médicos y teleconsultas en tiempo real entre múltiples perfiles de usuario (médicos, pacientes, administradores) con estrictos requerimientos de privacidad de datos de salud y auditoría de accesos.

### Solución Arquitectónica:
- Implementación de **Clean Architecture** con separación estricta en 4 capas.
- Uso de **CQRS con MediatR** para desacoplar las operaciones de escritura (agendamiento, recetas) de las consultas de solo lectura (historial de citas con proyecciones directas en LINQ).
- Autenticación segura mediante **JWT con Refresh Token Rotation** y autorización basada en roles (RBAC) granular.
- Frontend en Angular con `ChangeDetectionStrategy.OnPush` para un rendimiento fluido.

### Resultados e Impacto:
1. Reducción del tiempo de agendamiento de citas en un 60%.
2. Cero incidentes de acceso no autorizado a información clínica confidencial.
3. Trazabilidad completa de auditoría para cada modificación de expediente.

---

## 2. Módulo de Vacaciones y Gestión RRHH (PRJ-02)

### Ficha Técnica:
- **Institución / Contexto**: Sistema Institucional de Recursos Humanos
- **Tecnologías**: Angular, .NET 9, Clean Architecture, Algoritmo FIFO, Reportes PDF, MySQL
- **Color de Acento**: `#e0af68` (Ámbar Dorado)

### Desafío de Ingeniería:
El cálculo de saldos de vacaciones acumuladas de cientos de empleados presentaba inconsistencias debido a variaciones en la legislación laboral, periodos devengados no consecutivos, permisos con o sin sueldo, y solicitudes cruzadas de días pendientes.

### Solución Arquitectónica:
- Diseño de un motor de liquidación en Dominio C# puro basado en el **Algoritmo FIFO (First-In, First-Out)**: las solicitudes de vacaciones consumen primero los días acumulados del periodo más antiguo devengado.
- Generación de reportes PDF de liquidación y constancias oficiales en tiempo de ejecución.
- Validaciones exhaustivas mediante **FluentValidation** para impedir aprobaciones con saldos negativos.

### Resultados e Impacto:
1. Eliminación total de errores de cálculo en saldos devengados de personal.
2. Generación instantánea de actas de finiquito y reportes de saldos en PDF.
3. Descongestión del departamento de talento humano en cierres de año fiscal.

---

## 3. Sistema de Titulación y Gestión de Convocatorias (PRJ-03)

### Ficha Técnica:
- **Institución / Contexto**: Gestión Universitaria y Acreditación de Grados
- **Tecnologías**: Angular, .NET 9, Clean Architecture, JWT & RBAC, Gestión de Convocatorias
- **Estado**: En Desarrollo Activo
- **Color de Acento**: `#bb9af7` (Púrpura Zen)

### Desafío de Ingeniería:
Orquestar las múltiples fases del proceso de titulación universitaria (publicación de convocatorias, asignación de tribunales, revisión de proyectos de grado, rúbricas de calificación y actas de grado) con control estricto de fechas límite y estados secuenciales.

### Solución Arquitectónica:
- Máquina de estados en el Dominio para modelar el flujo de vida de una postulación de grado: `Borrador` -> `Enviada` -> `En Tribunal` -> `Aprobada` -> `Titulado`.
- Notificaciones automáticas de cambio de estado y control de concurrencia optimista (`RowVersion`).

---

## 4. SIPLECE (PRJ-04)

### Ficha Técnica:
- **Institución / Contexto**: Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET)
- **Tecnologías**: Angular, .NET 8, Clean Architecture, JWT & RBAC, Integración SharePoint
- **Color de Acento**: `#7dcfff` (Azul Glacial)

### Desafío de Ingeniería:
Centralizar la gestión documental institucional, actas de comités académicos y repositorios de evidencias para procesos de evaluación y acreditación, integrando la plataforma interna con el almacenamiento en la nube de Microsoft SharePoint.

### Solución Arquitectónica:
- Patrón Adaptador de Infraestructura para abstraer el SDK de Microsoft Graph y SharePoint, permitiendo al Dominio tratar el almacenamiento documental como un repositorio abstracto desacoplado.
- Control de permisos jerárquicos y trazabilidad de descargas.
