# 03 // REGISTRO Y ADQUISICIÓN DE NUEVOS CONOCIMIENTOS
> *Marco de Trabajo Metodológico para Integrar Nuevas Tecnologías y Aprendizajes en la Bóveda.*

---

## 1. Propósito de este Registro

A medida que Bryan avance en su carrera profesional e investigue nuevas áreas tecnológicas (tales como microservicios con gRPC, computación en Rust o Go, orquestación con Kubernetes, observability con OpenTelemetry o modelos locales de IA con Ollama), este documento y su carpeta servirán como **cuaderno de campo y bitácora de adopción técnica**.

---

## 2. Plantilla Estándar para Incorporar un Nuevo Aprendizaje

Cuando Bryan adquiera o experimente con una nueva tecnología, se debe crear una ficha en esta carpeta siguiendo este formato estándar:

```markdown
# [NOMBRE DE LA TECNOLOGÍA / HERRAMIENTA]

## 1. ¿Qué es y qué problema resuelve?
- Breve descripción del concepto.
- ¿Por qué es relevante para nuestro ecosistema (.NET / Angular / Cloud / Seguridad)?

## 2. Evaluación de Simplicidad (Filtro Ponytail)
- ¿Aporta un beneficio tangible frente a la librería estándar o soluciones existentes?
- ¿Añade complejidad accidental o sobrecarga innecesaria?

## 3. Experimento o Prueba de Concepto (PoC)
- Breve snippet de código o configuración Docker de prueba.
- Comportamiento observado, rendimiento y consumo de recursos.

## 4. Plan de Integración en el Portafolio
- ¿En qué parte del proyecto se implementará?
  - Ejemplo: Nuevo endpoint en .NET WebApi, comando interactivo en la terminal, o servicio en el VPS de Oracle Cloud.

## 5. Lecciones Aprendidas y Notas de Campo
- Hallazgos, limitaciones detectadas y buenas prácticas descubiertas.
```

---

## 3. Candidatos Tecnológicos en el Radar de Exploración

1. **Rust / WebAssembly (Wasm)**:
   - Exploración de módulos Wasm compilados en Rust para tareas de criptografía o procesamiento gráfico en el cliente web.
2. **OpenTelemetry & Jaeger**:
   - Trazabilidad distribuida para rastrear el ciclo de vida de peticiones desde el frontend hasta la base de datos MySQL.
3. **gRPC en .NET 9**:
   - Comunicación binaria ultrarrápida entre microservicios o agentes internos en el VPS de Oracle Cloud.
4. **Modelos Locales de IA con Ollama en el VPS**:
   - Experimentar con modelos ligeros de LLM (ej. Phi-3 mini o Gemma 2B) alojados directamente en el servidor sin depender de APIs de terceros.
