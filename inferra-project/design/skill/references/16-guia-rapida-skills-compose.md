# 15 — Inventario de skills aplicables y exclusiones explícitas

**Fuente:** `skills(4).zip` (catálogo de `skills/*/SKILL.md`) y `vigilio-docs(3).zip`. Esta es la selección del proyecto **Inferra**, no una afirmación de que todas estén instaladas/activadas en un agente. Consultar contenido completo de la skill elegida y sus referencias canónicas **al implementar la tarea correspondiente**. No cargar 40 skills a la vez sin necesidad.

## Restricción innegociable

- Infraestructura: **solo Docker Engine + Docker Compose** sobre Linux self-hosted, en un solo host para el MVP, con expansión a hosts gestionados explícitamente cuando esté justificada. No AWS, EKS, ECS, Lambda, RDS, S3 gestionado, CloudFront, CDK, Terraform, Kubernetes, Helm, Argo CD ni servicios cloud para datos.
- Caddy es la puerta pública; todo PostgreSQL, Valkey, vLLM, RustFS y observabilidad reside en redes privadas Compose.
- RustFS es **compatible con el protocolo S3**, pero **no es AWS S3**. Permitir interoperabilidad S3 de RustFS no introduce AWS.
- Google/Facebook OAuth son proveedores de identidad externos opcionales. Nunca implican infraestructura cloud para la aplicación; el login local/OTP sigue funcionando independientemente.
- CI puede usar runners GitHub u on-prem, pero el **runtime de producción** únicamente Docker Compose. Para full on-prem, runners self-hosted + registry propio (ej. OCI registry privado) y correo SMTP local.
- No Podman para la distribución objetivo, aunque la skill fuente también lo permita.

## A. Skills núcleo: aplicar al plan y lectura por tarea

| Skill exacta | Cuándo y para qué |
|---|---|
| `vigilio-auto-senior` | Orquestar lectura, routing, revisión, evidencia y criterios de aceptación. |
| `precision-skill-reading` | Leer SKILL+referencias, resolver compatibilidad y conflictos sin inventar reglas. |
| `architecture-traceability` | Trazar requisito → endpoint → DTO → servicio → página → tests → operación. |
| `platform-repository-workspace` | Limitar ownership y estructura de 5 repositorios. |
| `platform-compose-vps-delivery` | **Skill principal de infraestructura:** 1 Compose, Caddy, perfiles, hardening, deploy/rollback, pgBackRest. Filtrar sus opciones Podman: Inferra solo Docker Compose. |
| `node-nest-technologies` | Versiones e integraciones del stack NestJS. |
| `node-nest-build-feature` | Controllers, DTO Zod, domain/application/infrastructure, OpenAPI. |
| `node-nest-security` | Sesiones, OTP/OAuth, RBAC/tenancy, límites, protecciones. |
| `node-nest-persistence` | PostgreSQL, Drizzle, migraciones, transacciones, repositorios. |
| `node-nest-async-workers` | BullMQ/Valkey, jobs idempotentes, outbox. |
| `node-nest-realtime` | SSE/streaming de inferencia, desconexiones y cancelación. |
| `node-nest-testing` | Unit, integración real, Cucumber/BDD, API E2E, cobertura. |
| `web-mfe-technologies` | Stack Preact, Vite, compatibilidad de librerías y build. |
| `web-mfe-build-feature` | Estructura app/features/services/libs, UI y hooks. |
| `web-mfe-contracts` | Tipos cliente desde schemas/contratos backend y validación de bordes. |
| `web-mfe-realtime` | Cliente SSE/streaming/AbortController y UX de cancelación. |
| `web-mfe-testing` | Vitest UI/MSW, Playwright browser, journey E2E. |
| `web-mfe-quality` | A11y, performance, bundle, loading/empty/error/success. |
| `web-mfe-security-delivery` | CSP, CSRF, cookies, secrets frontend, delivery estático. |
| `platform-cicd-factory` | Pipelines por repositorio, gates y promoción por digest. |
| `software-supply-chain-security` | SBOM, escaneo, firmas Cosign verificadas en host Compose; **excluir la variante Kyverno/Kubernetes**. |
| `platform-observability-sre` | OTel, Prometheus, Loki, Tempo, Grafana, SLO, alertas. |
| `platform-data-reliability` | PG backups, integridad, recuperación y revisiones de datos. |
| `platform-resilience-disaster-recovery` | Runbooks, RPO/RTO, restore drill y resiliencia self-hosted. |
| `platform-scalability-capacity` | Escalado medido, carga, GPU y presupuestos de capacidad. |
| `platform-validation-evidence` | Evidencias reales PASS/FAIL/BLOCKED/NOT_RUN, no promesas. |
| `platform-local-production-lab` | prod-local con el mismo Compose; caos/fault injection y restore. |
| `complete-work-no-shortcuts` | Definition of Done sin tests omitidos. |

## B. Skills de UX/UI

| Skill exacta | Propósito |
|---|---|
| `ux-product-discovery` | Personas, casos de uso, onboarding, investigación. |
| `ux-information-architecture` | Mapa de navegación, permisos, jerarquías y rutas. |
| `ux-web-experience` | Experiencia web con formularios, tablas, estados y responsive. |
| `ux-accessibility` | WCAG 2.2 AA, teclado, foco, lectores de pantalla. |
| `ui-art-direction` | Identidad visual operacional, densidad y tono. |
| `ui-design-system` | Tokens, componentes, variantes, estados, dark/light. |
| `ui-interaction-motion` | Microinteracciones, reduced motion, feedback de streaming. |
| `ui-prototyping-handoff` | Handoff de pantallas e interacción a implementación. |
| `ui-quality-review` | QA visual, consistencia, regresiones. |

## C. Skills de apoyo, usar solo cuando proceda

- `shared-technologies`: versiones/tooling compartido.
- `repository-readme-architecture`: README, navegación y contratos por repo.
- `skill-create-docs`: crear/sincronizar este paquete documental.
- `review-code-change`, `refactor-existing-code`, `improve-codebase-architecture`, `symbol-ownership-architecture`: revisiones y cambios de arquitectura reales.
- `diagnosing-bugs`, `commit-ai-change`, `codebase-context-efficiency`, `adaptive-context-budget`: diagnóstico y trabajo incremental.
- `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-update-change`, `openspec-sync-specs`, `openspec-archive-change`: propuestas/cambios trazables si se adopta OpenSpec.
- `ai-rag-llmops-finops`: **solo** reglas de benchmarking, serving, evaluación y coste; RAG/agentes fuera del alcance base.
- `platform-finops`: costes **on-prem** de GPU, energía, licencias y amortización; descartar métricas de facturación cloud.
- `platform-environment-promotion`: promoción staging→production del mismo digest en Compose.
- `coderabbit-compliance`: si se instala/habilita su integración externa; nunca requisito del runtime.

## D. Skills presentes en ZIP que NO deben gobernar Inferra

**Excluir completamente del runtime y de la arquitectura de despliegue:**
- `aws-platform-foundation`, `node-nest-security-aws`, `terraform-iac-delivery`.
- `kubernetes-eks-delivery`, `kubernetes-gitops-delivery`, `kubernetes-policy-runtime-security`, `onprem-kubernetes-foundation`.

**No pertenecen al stack base:** `cpp-*`, `godot-*`, `mobile-mfe-*`, `php-laravel-*`, `rust-*`, `ux-mobile-experience`, `ux-game-experience`, `ux-desktop-experience` y otras específicas de juegos/mobile/native. El motor RustFS es un contenedor de terceros, **no** una autorización para introducir un backend Rust.

## Docs Vigilio preferentes, no compat legacy AWS

1. `vigilio-docs/AGENTS.md`, `README.md`, `COMPATIBILITY.md`, `OPERATING-MODEL.md` y `technology/versions.md`.
2. `vigilio-docs/platform/compose/cloud-neutral-vps-delivery.md` y `platform/architecture/repository-boundaries.md`.
3. `vigilio-docs/stacks/backend/nestjs/**` y `stacks/frontend/**` aplicables, nunca los ejemplos de AWS en `.compat/*` como fuente de despliegue.
4. `vigilio-docs/standards/security/**`, `standards/testing/**`, `standards/observability/**`, `standards/experience/**`, `standards/devsecops/**` cuando existan y sean aplicables.
5. En un conflicto entre ejemplo AWS y requisito de Inferra, **gana la restricción self-hosted+Compose**; documentar el conflicto y trasladar el objetivo de seguridad, no el proveedor.

## Cómo seleccionar por feature

- **Login Google/Facebook, OTP, register y MFA:** `vigilio-auto-senior` → `precision-skill-reading` → `node-nest-security` → `node-nest-build-feature` → `node-nest-persistence` → `web-mfe-build-feature` → `web-mfe-security-delivery` → `node-nest-testing` + `web-mfe-testing` + `ux-accessibility`.
- **Modelos/vLLM/SSE:** `node-nest-build-feature` → `node-nest-realtime` → `web-mfe-realtime` → `platform-scalability-capacity` → `ai-rag-llmops-finops` → `node-nest-testing`.
- **Infraestructura a producción:** `platform-compose-vps-delivery` → `platform-cicd-factory` → `software-supply-chain-security` (solo controles Compose) → `platform-observability-sre` → `platform-data-reliability` → `platform-resilience-disaster-recovery` → `platform-validation-evidence`.
- **Nueva página:** `ux-information-architecture` → `ui-design-system` → `web-mfe-build-feature` → `web-mfe-contracts` → `web-mfe-testing` → `web-mfe-quality`.
