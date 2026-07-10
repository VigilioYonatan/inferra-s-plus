# 00 — Lecturas, proveniencia y autoridad

## Fuentes de esta propuesta

Se examinaron los adjuntos `skills(4).zip` y `vigilio-docs(3).zip`, descomprimidos en el runtime como `review_skills/` y `review_docs/`, además de los tres blueprints anteriores y el manifiesto auditado. La presente skill no presupone que las skills Vigilio estén **instaladas en el repositorio consumidor**: tener el ZIP no equivale a ejecutar acciones o pipelines.

## Skills propietarias por tipo de trabajo

| Tarea | Skill Vigilio original a seleccionar | Fuente canónica destacada |
|---|---|---|
| Orquestación fiel y evidencias | `vigilio-auto-senior`, `precision-skill-reading` | `standards/ai/skill-orchestration-policy.md` y `precision-skill-reading-and-conflict-resolution.md` |
| Feature HTTP NestJS | `node-nest-build-feature`, `node-nest-technologies` | `stacks/backend/nestjs/http/semantic-dtos-and-pagination.md` |
| Sesiones y permisos | `node-nest-security` | `standards/security/authorization.md`, `tenant-isolation.md` |
| DB, migraciones, coherencia | `node-nest-persistence` | `stacks/backend/nestjs/persistence/drizzle-conventions.md` |
| Jobs/outbox | `node-nest-async-workers` | `standards/messaging/outbox-idempotency.md` |
| SSE/streaming | `node-nest-realtime`, `web-mfe-realtime` | `stacks/backend/nestjs/messaging/realtime-sse-websocket.md` |
| UI y forms Preact | `web-mfe-build-feature`, `web-mfe-contracts`, `web-mfe-technologies` | `standards/experience/components-states-and-contracts.md` |
| Web tests y delivery | `web-mfe-testing`, `web-mfe-quality`, `web-mfe-security-delivery` | `standards/experience/ux-quality-gates-and-ci-cd.md` |
| Diseño y accesibilidad | `ux-information-architecture`, `ux-accessibility`, `ui-design-system`, `ux-web-experience` | `standards/experience/*` |
| Repos, Compose y operaciones | `platform-repository-workspace`, `platform-compose-vps-delivery` | `platform/architecture/repository-boundaries.md`, `platform/compose/cloud-neutral-vps-delivery.md` |
| Observabilidad/DR | `platform-observability-sre`, `platform-data-reliability`, `platform-resilience-disaster-recovery` | `standards/observability/slo-runbooks.md`, `platform/sre/backup-disaster-recovery.md` |
| DevSecOps | `software-supply-chain-security`, `platform-cicd-factory` | `standards/devsecops/supply-chain.md`, `platform/cicd/pipeline-factory.md` |
| Pruebas y trazabilidad | `node-nest-testing`, `architecture-traceability`, `platform-validation-evidence` | `standards/testing/strategy.md`, `standards/engineering/use-case-traceability.md` |
| Documento y super-skill | `skill-create-docs`, `complete-work-no-shortcuts` | checklists y decisiones materiales según riesgo |

## Versiones de referencia (NO instaladas)

Fuente: `vigilio-docs/technology/versions.md`, revisada el 2026-11-01: Node 24 LTS; NestJS 11 conservador y NestJS 12 candidato; Zod 4; Preact 11; Vite 8; Tailwind 4; Drizzle 0.45.4; PostgreSQL 16/18; Valkey 8.1; BullMQ 5/6 según compatibilidad; Biome 2; Vitest 4/5 según snapshot; Playwright 1.64.1. **No pins exactos universales aquí**: verificar lockfile, adaptadores, APIs de las librerías, digest de imágenes y ABI GPU por plataforma. Si `compatibility.json` o docs contradicen el proyecto real, registrar y resolver antes de BUILD.

## Evidencia y estados

- `DESIGN`: arquitectura especificada.
- `STRUCTURAL_PASS`: consistencia local de matrices y docs verificada por scripts provistos.
- `NOT_RUN`: no se ejecutó el gate, incluido programa, Playwright, GPU y DR.
- `BLOCKED`: no hay recurso, credencial autorizada, referencia obligatoria o decisión humana.
- `PASS`: el comando/suite real terminó satisfactoriamente con evidencia reproducible.
- `FAIL`: ejecución real incumplió criterios.

**Regla:** no declarar revisión de código independiente, versión instalada, certificación de seguridad, compatibilidad 100 % OpenAI, verificación SLSA L2/L3 o backup restaurable solo por la existencia de documentos.

## Inventario completo del ZIP

Ver `15-catalogo-skills-del-zip.md` para los 103 nombres, clasificación de pertinencia y exclusiones AWS/K8s/Podman/Terraform; `15-catalogo-skills-del-zip.json` preserva SHA-256 individuales.
