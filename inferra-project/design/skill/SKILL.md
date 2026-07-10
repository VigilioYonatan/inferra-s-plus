---
name: inferra-super-senior
description: Diseña, implementa, revisa y opera Inferra S+, plataforma self-hosted de inferencia LLM sobre NestJS, Preact, vLLM y Docker Compose. Enruta cada feature desde caso de uso, contrato Zod/OpenAPI y UX hasta DevSecOps, tests BDD/E2E y producción con evidencias; respetando vigilio-skills y vigilio-docs.
owner: inferra-platform
lifecycle: proposed
introduced_in: 0.1.0-design
routing_ecosystems: "node, nestjs, preact, typescript, compose, llm, vllm"
routing_keywords: "inferra, inference engine, selfhosted, oauth, otp, gpu, llmops, benchmark, docker compose"
routing_files: "src/app.module.ts, compose/compose.yaml, vite.config.ts, pnpm-lock.yaml"
routing_capabilities: "product-architecture, backend, frontend-ux, ai-serving, identity, security, platform, test, release"
requires: []
optional: [vigilio-auto-senior, precision-skill-reading, node-nest-build-feature, node-nest-security, node-nest-persistence, node-nest-testing, node-nest-async-workers, node-nest-realtime, web-mfe-build-feature, web-mfe-contracts, web-mfe-testing, web-mfe-security-delivery, platform-repository-workspace, platform-compose-vps-delivery, platform-observability-sre, software-supply-chain-security, ux-information-architecture, ux-accessibility]
conflicts: []
supersedes: []
---

# Inferra S+ — SuperSkill de Ingeniería Senior / Staff

> **TIPO:** especificación operativa de una skill propuesta para el proyecto Inferra. **NO** es una skill ya instalada ni una aplicación implementada. La carpeta es transportable; para activarla el consumidor debe instalarla en su mecanismo real de skills, añadir instrucciones de agente y comprobar descubrimiento. El estado de todos los gates de aplicación es `NOT_RUN` hasta ejecutar código real.

## 0. Misión, límites y resolución de autoridad

Construir una plataforma de inferencia LLM autoalojada de instalación sencilla, producción verificable y optimización demostrable, no un wrapper visual de vLLM. Usuarios y aplicaciones podrán registrarse, entrar con Google/Facebook/OTP o contraseña, configurar MFA, organizar recursos por empresa, desplegar modelos aprobados, generar tokens mediante API compatible con OpenAI, medir GPU/latencia/costos, administrar cuotas, ejecutar benchmarks y recuperarse de fallos.

**Stack decidido por el usuario:** NestJS/TypeScript, Preact/Vite, Zod 4, Drizzle/PostgreSQL, Valkey/BullMQ, vLLM, Docker Compose, Caddy; RustFS solo cuando existan objetos/subidas; 100 % self-hosted para el plano de datos. **No AWS ni Kubernetes, ni Rust como backend de negocio.** Login Google/Facebook depende opcionalmente de proveedores externos; SMTP debe ser configurable y el acceso local/OTP no debe depender de OAuth externo.

**Precedencia:** código/lockfiles/tests/config reales > policies ejecutables de Vigilio instaladas > ADRs y `vigilio-docs` aplicables > este diseño > ejemplos. En caso de conflicto, preservar compatibilidad y registrar gap; no sustituir un requisito por una norma aplicable a otro stack. Versiones de referencia en `vigilio-docs/technology/versions.md`; solo lockfiles y artefactos demuestran versiones usadas.

## 1. Lectura obligatoria y selección de skills

1. Leer `AGENTS.md`, código, manifiestos, diff, lockfiles, tests, rutas y políticas del repositorio objetivo. Si aún no existen, actuar en fase DESIGN y no afirmar BUILD.
2. Leer este `SKILL.md` completo y `references/00-mapa-y-fuentes.md`. Abrir las referencias **por impacto**, siempre completas: producto/UX para nuevas pantallas; auth para identidad; backend/API para endpoints; data plane para runtime; plataforma para Compose; testing y threat model para cambios críticos.
3. Cuando estén instaladas, utilizar el protocolo `vigilio-auto-senior` + `precision-skill-reading`, seleccionando y LEYENDO las skills específicas completas y sus referencias. Una referencia mencionada no equivale a skill cargada, herramienta invocada o CI ejecutado.
4. Verificar `blueprint/architecture-manifest.json` y matrices con `python3 scripts/validate_super_skill.py`. Si cambia un endpoint o página, actualizar el **fuente de verdad** acordado y regenerar matrices con `blueprint/scripts/generate.py`; no mantener copias paralelas.
5. Revisar `references/12-decisiones-y-adrs.md` antes de imponer políticas pendientes de negocio, retención, registro público, facturación, coste real o permisos destructivos.

**Filtro obligatorio de selección:** leer `references/15-skills-seleccionadas-docker-compose.md` antes de escoger skills o infraestructura. Inferra descarta cualquier variante AWS, Kubernetes, Terraform y Podman; **solo Docker Compose** como orquestación de producción.

## 2. Mapa de referencias por intención

| Al trabajar en… | Leer **completamente** |
|---|---|
| Visión, personas, alcance y fases | `references/01-producto-y-capacidades.md` + `references/11-roadmap-y-aceptacion.md` |
| Arquitectura, paquetes y ownership | `references/02-arquitectura-software-y-repos.md` + `blueprint/01-arbol-de-archivos-comentado.md` |
| Auth, register, OAuth, OTP, MFA, cuentas, RBAC | `references/03-identidad-seguridad-y-tenancy.md` + `references/14-threat-model.md` |
| Controllers, services, DTO, schemas, OpenAPI | `references/04-backend-apis-y-datos.md` + `blueprint/02-matriz-endpoints.csv` |
| Rutas, componentes, diseño visual, UX, estados | `references/05-frontend-ux-ui.md` + `blueprint/03-matriz-paginas.csv` |
| vLLM, GPU, SSE, quotas, tuning y benchmarks | `references/06-inferencia-y-benchmarks.md` |
| PostgreSQL, Valkey, BullMQ, outbox, RustFS | `references/07-persistencia-workers-y-archivos.md` |
| CI/CD, Compose, imágenes, instalador, release | `references/08-devsecops-despliegue.md` |
| OTel, Grafana, SLO, incidentes, backup y DR | `references/09-observabilidad-sre-dr.md` |
| Unit, integration, BDD, API/web E2E, coverage | `references/10-testing-calidad-coverage.md` |
| Amenazas, análisis adversario | `references/14-threat-model.md` |
| ADRs, decisiones humanas, políticas sin resolver | `references/12-decisiones-y-adrs.md` |
| Skills del ZIP permitidas, descartadas y reglas anti-cloud | `references/15-skills-seleccionadas-docker-compose.md` |
| Validación de fuente y progreso real | `references/00-mapa-y-fuentes.md` + `references/13-evidencias-y-review.md` |

## 3. Contrato de arquitectura no negociable

- **Nivel Compose-VPS Vigilio:** cinco repos independientes: `apps/inferra-impl`, `apps/inferra-web`, `inferra-deploy`, `platform-ops`, `prod-local`. Raíz coordinadora sin `package.json`, `pnpm-workspace.yaml` ni carpeta `contracts/`.
- **Backend monolito modular:** `domain/schemas` propietario, `application/services` y `ports`, `infrastructure` Drizzle/Valkey/vLLM, `presentation/http/controllers|dto|docs`. No introducir entidades/abstracciones ceremoniales para CRUD trivial.
- **Control plane ≠ data plane:** NestJS autentica, autoriza, asigna recursos, contabiliza, controla modelos y audita; vLLM ejecuta kernel, batching, atención y KV-cache. Jamás convertir NestJS en ejecutor de kernels ni en proxy que permita llamar endpoints internos de vLLM arbitrariamente.
- **Plano de privilegio separado:** `ModelDeploymentsController` registra trabajos y transición deseada; un agente/provisioner mínimo con allowlist y privilegios mínimos es dueño de cambios de runtime. El servidor HTTP no monta `/var/run/docker.sock`, no ejecuta shell arbitraria ni acepta flags vLLM libres sin validación.
- **Una única definición `inferra-deploy/compose/compose.yaml`** para local/staging/producción, con parámetros y perfiles. Entradas backend de la **misma imagen firmada**: `api`, `worker`, `outbox`, `migrate` y `platform-setup`.
- **Multi-tenant verdadero:** membresía, rol, permiso y ownership del recurso se validan en Application + query DB. Control de instancia para GPUs/backups/host separado de administración de organización.
- **Contratos propios:** `*.schema.ts` Zod del dominio, `*.request|query|response.dto.ts` HTTP con esquema + tipo derivado, `*.doc.ts` exclusivamente adapter OpenAPI, `operationId` estable; no duplicar DTO en frontend. APIs externas compatibles con OpenAI preservan su formato.
- **Frontend** `app/`, `features/`, `services/`, `libs/ui/` con Preact. UI no ejecuta SQL, no almacena secretos, no define permisos, no interpreta headers arbitrarios como identidad. **Prohibición de emojis como iconos:** todo icono debe ser SVG vectorial dedicado (`libs/ui/icons.tsx`), nunca emojis de texto. **Arquitectura por feature obligatoria:** cada dominio en `features/<feature>/` debe descomponerse en `components/` (cards, forms, dialogs, banners de dominio) y `pages/` (rutas puramente orquestadoras); se prohíbe el código monolítico o concentrar todo en `libs/ui/components.tsx`.
- **Estado externo fail-closed:** PostgreSQL durabilidad, Valkey para límites/leases/colas; manejar degradación controlada y reconciliación, no autorizar inferencia ilimitada cuando cae el reservador.

## 4. Workflow end-to-end por cambio

### DISCOVER / PLAN
1. Determinar persona, necesidad, amenaza y *owner* del módulo; comprobar el repositorio/código real.
2. Identificar caso de uso, precondiciones, roles/tenant, datos, operaciones, estados UX, métricas y recuperación.
3. Consultar CSV de operaciones y páginas. Modificar el dueño canónico si hay ruta nueva; exigir consumidor o justificación SDK/operación interna.
4. Construir matriz `requirement → domain policy → service → DTO → controller → OpenAPI → UI → tests → observabilidad → runbook`.
5. Proponer ADR de cualquier cambio de topología, identidad, cuota, retención, modelo, exposición o release irreversible.

### BUILD (solo con autorización y proyecto real)
1. Escribir tests caracterizadores/negativos. Implementar schema, invariantes, ports y services.
2. Crear adapters de persistencia, workers y puertos externos con retries idempotentes y timeouts.
3. Crear DTOs HTTP Zod, presenter solo si realmente necesita mapper, documentación Swagger/Scalar y controller delgado.
4. Generar contrato browser-safe a partir del owner backend; enlazar frontend mediante versión/digest exactos y probar compatibilidad.
5. Construir pantalla completa (loading/empty/error/success/403/conflict/offline/retry), formulario y manejo de foco accesible.
6. Instrumentar logs redactados, trazas, métricas low-cardinality y auditoría; escribir runbook si añade modo de fallo.
7. Actualizar tests unit/integration/contract/E2E/BDD pertinentes, threat model, ADR, manifiesto y documentación afectada.

### VERIFY / REVIEW
1. Preflight servicios PostgreSQL/Valkey/upstream/stubs; migraciones y fixtures deterministas; no confundir readiness con E2E.
2. Ejecutar Biome, typecheck, Vitest coverage, integration, Cucumber, Playwright API/web, OpenAPI diff, seguridad, Compose config y quality gates pertinentes.
3. Para runtime GPU real: pruebas aisladas de latencia/throughput/VRAM, comparaciones con baseline, trazas de cancelación y benchmark reproducible.
4. Revisión independiente en fase de **solo lectura**: invariantes, exposición, IDOR, secretos, SQL scope, CSRF, race, LLM data leaks, costos, escalamiento, cambios de contrato.
5. Emitir evidencia `PASS | FAIL | BLOCKED | NOT_RUN`, comandos ejecutados, salidas, riesgo residual, cambios y puntuación solo de calidad de diseño si no hay implementación.

## 5. Acceptance gates por área

- Login email/password, email OTP, Google OIDC, Facebook OAuth, MFA, logout-all y revocación funcionan con tests de replay/abuso, o documentar proveedor opcional `DISABLED`.
- Toda request sensible tiene autenticación + autorización por recurso/tenant + rate limits; rutas públicas explícitas y mínimas.
- 100 % de operaciones **implementadas** tienen OpenAPI/DTO/permisos y API contract checks; el inventario completo propuesto contiene 163 y no constituye 163 operaciones ya implementadas.
- 100 % de rutas frontend **implementadas** prueban auth/access/404; los 71 targets son plan, no Playwright green.
- Cobertura reportada por capa con thresholds (base 85 % líneas/funciones/statements; 80 % ramas; crítica ≥95 % ramas objetivo y suites negativas), mutation sobre lógica de alto riesgo.
- Backups externos + restore drill medidos, vulnerabilidades y SBOM revisados, digest/firma comprobada antes de despliegue, métricas y alertas probadas.
- E2E de flujo real de `login → organización → API key → modelo → inferencia streaming → contabilización → auditoría` y una ruta de recuperación/rollback probada.

## 6. Entrega de cada turno

**Entregar:** alcance, repo/módulos afectados, archivos cambiados, contratos, experiencia, riesgos, tests por estado, versión de fuentes, conflictos, decisión/ADR, siguiente fase y evaluación de diseño vs. software ejecutado. No decir "producción lista", "seguro", "100 % coverage" ni "S+ demostrado" sin resultados. Nunca poner credenciales reales o modelos bajo licencias no revisadas en artefactos.

**Fuentes y trazabilidad:** `references/00-mapa-y-fuentes.md` es el índice de los ZIP que se leyeron para este paquete. Los documentos Vigilio conservan autoridad fuera de este bundle; esta skill no los sustituye ni clona sus implementaciones.
