# 15 — Catálogo completo de `skills(4).zip` y política de selección

**Inventario real:** 103 archivos `SKILL.md` ubicados en 103 carpetas del ZIP. Cada fila se ha clasificado por metadatos y alcance. **Clasificar no equivale a cargar/ejecutar una skill.** Al realizar una tarea concreta debe leerse la `SKILL.md` seleccionada **completa** y sus referencias obligatorias aplicables, tal como exige `precision-skill-reading`.

## Política irrevocable de la infraestructura

- **Runtime, staging, lab y producción: Docker Engine + plugin `docker compose` únicamente.** Un solo `inferra-deploy/compose/compose.yaml` versionado; perfiles y archivos de entorno, **sin** `docker-compose.prod.yml` independiente. No Podman Compose, Swarm, Kubernetes, Helm, Argo CD, EKS, Terraform, AWS, CloudFront, Lambda, SQS, SNS, S3 de Amazon, ECS, ECR ni servicios cloud gestionados.
- **Se permite RustFS instalado en Docker Compose** con protocolo S3 compatible **local**, porque S3 es un protocolo de API; **NO** supone Amazon S3. Para DR usar segundo host/soporte local externo cifrado y probado, también sin AWS.
- Skills con instrucciones que mencionen AWS o Podman solo se usan en sus partes agnósticas. Las decisiones explícitas del usuario y seguridad aplicable prevalecen sobre los ejemplos de topología ajenos. `node-nest-async-workers` menciona SNS/SQS: extraer principios outbox, idempotencia y DLQ, implementar con PostgreSQL + BullMQ/Valkey.
- CI/CD compatible con Forgejo/GitLab self-hosted + runners propios; no obligar a un servicio externo. OCI, Syft, Grype/Trivy, Cosign y SBOM pueden funcionar sin AWS. GitHub Actions es alternativa voluntaria, no requisito de despliegue.
- El LLM trabaja en host GPU con vLLM; NestJS en contenedor separado. El API no monta socket Docker ni tiene privilegios para shell remoto; cambios de runtime mediante perfiles y operador/agente limitado.

## Cuándo cargar cada familia

| Etapa/tipo | Skills seleccionadas al trabajar en esa área |
|---|---|
| Reglas comunes | `vigilio-auto-senior`, `precision-skill-reading`, `vigilio-architecture-guide`, `complete-work-no-shortcuts`, `architecture-traceability`, `skill-create-docs`, `platform-validation-evidence` |
| Backend | `node-nest-technologies`, `node-nest-build-feature`, `node-nest-security`, `node-nest-persistence`, `node-nest-testing`, `node-nest-async-workers` (patrones no-cloud), `node-nest-realtime` |
| Frontend | `web-mfe-technologies`, `web-mfe-build-feature`, `web-mfe-contracts`, `web-mfe-testing`, `web-mfe-quality`, `web-mfe-security-delivery` (sin cloud), `web-mfe-realtime` |
| UX/UI | `ux-product-discovery`, `ux-information-architecture`, `ux-web-experience`, `ux-accessibility`, `ui-design-system`, `ui-art-direction`, `ui-interaction-motion`, `ui-quality-review` |
| Infraestructura/operación | `platform-repository-workspace`, `platform-compose-vps-delivery` (solo Docker), `platform-cicd-factory`, `platform-environment-promotion`, `platform-local-production-lab`, `platform-observability-sre`, `platform-data-reliability`, `platform-resilience-disaster-recovery`, `platform-scalability-capacity`, `software-supply-chain-security` |
| Serving y costos | `ai-rag-llmops-finops` (solo LLMOps/FinOps), `platform-finops`; **no crear RAG** salvo feature futura autorizada |
| Review | `review-code-change`, `symbol-ownership-architecture`, `repository-readme-architecture`, `shared-technologies` |

## Inventario exhaustivo, sin omisiones

En la tabla siguiente `BASE` = guía transversal; `POR_FEATURE` = cargar según cambio; `CONDICIONAL` = únicamente con señal real; `EXCLUIDA_CLOUD` = incompatible con decisión del usuario; `EXCLUIDA_STACK` = otro lenguaje/producto. Las rutas pertenecen al ZIP aportado, no a archivos instalados automáticamente en el consumidor.

| Skill | Selección | Uso o razón |
|---|---|---|
| `adaptive-context-budget` | `CONDICIONAL` | Cuando la tarea supere presupuesto contextual |
| `ai-rag-llmops-finops` | `POR_FEATURE` | Solo serving, observabilidad LLM, seguridad, cuotas y benchmarks; RAG opcional |
| `architecture-traceability` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `aws-platform-foundation` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `codebase-context-efficiency` | `CONDICIONAL` | Al navegar repositorios grandes |
| `coderabbit-compliance` | `CONDICIONAL` | Solo si CodeRabbit está conectado y autorizado |
| `commit-ai-change` | `CONDICIONAL` | Si se pide commit y flujo Git está autorizado |
| `complete-work-no-shortcuts` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `cpp-native-build-feature` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `cpp-native-delivery` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `cpp-native-security` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `cpp-native-testing` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `cpp-qt-webengine` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `cpp-workspace-architecture` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `diagnosing-bugs` | `CONDICIONAL` | Incidentes, regresiones, causas raíz |
| `godot-animation-audio` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `godot-backend-multiplayer` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `godot-build-gameplay` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `godot-delivery` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `godot-project-architecture` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `godot-testing-quality` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `grill-me` | `CONDICIONAL` | Revisión adversaria de requisitos/ADRs por pedido |
| `improve-codebase-architecture` | `CONDICIONAL` | Refactor arquitectónico con evidencia |
| `kubernetes-eks-delivery` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `kubernetes-gitops-delivery` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `kubernetes-policy-runtime-security` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `mobile-mfe-build-feature` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `mobile-mfe-contracts` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `mobile-mfe-quality` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `mobile-mfe-security-delivery` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `mobile-mfe-testing` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `node-nest-async-workers` | `POR_FEATURE` | Outbox, idempotencia, BullMQ/Valkey, reintentos (ignorar SNS/SQS) |
| `node-nest-build-feature` | `POR_FEATURE` | Backend: bounded contexts, controllers, DTOs, application services |
| `node-nest-persistence` | `POR_FEATURE` | PostgreSQL, Drizzle, constraints, transacciones, migraciones |
| `node-nest-realtime` | `POR_FEATURE` | Streaming SSE HTTP y cancelación |
| `node-nest-security` | `POR_FEATURE` | Autenticación OAuth/OTP/MFA, guards, tenancy, RBAC |
| `node-nest-security-aws` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `node-nest-technologies` | `POR_FEATURE` | Backend: validar versiones y compatibilidad |
| `node-nest-testing` | `POR_FEATURE` | Vitest, integración real, API E2E, BDD |
| `onprem-kubernetes-foundation` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `openspec-apply-change` | `CONDICIONAL` | Cuando se usa OpenSpec en implementación aprobada |
| `openspec-archive-change` | `CONDICIONAL` | Cierre OpenSpec formal |
| `openspec-explore` | `CONDICIONAL` | Exploración de cambio complejo con OpenSpec |
| `openspec-propose` | `CONDICIONAL` | Propuesta de cambio cross-repo/breaking |
| `openspec-sync-specs` | `CONDICIONAL` | Sincronización de especificaciones aprobadas |
| `openspec-update-change` | `CONDICIONAL` | Cambio de alcance OpenSpec |
| `php-laravel-build-feature` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-contracts` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-persistence` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-quality` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-queues` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-realtime` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-runtime` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-security` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-technologies` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `php-laravel-testing` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `platform-cicd-factory` | `POR_FEATURE` | CI/CD self-hosted o runners autorizados, OIDC firma OCI, sin cloud |
| `platform-compose-vps-delivery` | `BASE` | Aplicar Docker Compose ÚNICAMENTE: las opciones Podman son incompatibles con la decisión del proyecto |
| `platform-data-reliability` | `POR_FEATURE` | PITR, migraciones, consistencia y backups |
| `platform-environment-promotion` | `POR_FEATURE` | Mismo digest entre staging/producción Compose |
| `platform-finops` | `POR_FEATURE` | Coste estimado de GPU/tokens y presupuestos, no billing AWS |
| `platform-local-production-lab` | `POR_FEATURE` | Laboratorio real con el mismo compose.yaml |
| `platform-observability-sre` | `POR_FEATURE` | OTel, Prometheus, Grafana, Loki, Tempo, SLO |
| `platform-repository-workspace` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `platform-resilience-disaster-recovery` | `POR_FEATURE` | Runbooks, restore drills, RTO/RPO y rollback |
| `platform-scalability-capacity` | `POR_FEATURE` | Capacidad GPU y concurrencia con métricas reales |
| `platform-validation-evidence` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `precision-skill-reading` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `refactor-existing-code` | `CONDICIONAL` | Cambios sobre código existente que requieran compatibilidad |
| `repository-readme-architecture` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `review-code-change` | `POR_FEATURE` | Review separado read-only al finalizar cada cambio |
| `rust-agent-runtime-security` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `rust-native-build-feature` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `rust-native-delivery` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `rust-native-testing` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `rust-workspace-architecture` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `shared-technologies` | `POR_FEATURE` | Versiones, herramientas y convenciones compartidas |
| `skill-create-docs` | `BASE` | Diseño, auditoría y coherencia del SuperSkill |
| `software-supply-chain-security` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `symbol-ownership-architecture` | `POR_FEATURE` | Ownership de símbolos al extraer/reorganizar módulos |
| `terraform-iac-delivery` | `EXCLUIDA_CLOUD` | Prohibida por política de infraestructura: nada AWS/Kubernetes/Terraform |
| `token-context-compression` | `CONDICIONAL` | Contexto grande, sin truncar normas críticas |
| `ui-art-direction` | `POR_FEATURE` | Dirección visual profesional propia |
| `ui-design-system` | `POR_FEATURE` | Tokens, componentes, estados, dark/light |
| `ui-interaction-motion` | `POR_FEATURE` | Progreso de jobs, feedback, reduced motion |
| `ui-prototyping-handoff` | `CONDICIONAL` | Cuando se requieran prototipos/handoff |
| `ui-quality-review` | `POR_FEATURE` | Review UX/UI independiente |
| `ux-accessibility` | `POR_FEATURE` | WCAG 2.2 AA, teclado, lectores, contraste |
| `ux-desktop-experience` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `ux-game-experience` | `EXCLUIDA_STACK` | Otro stack/producto (no es parte de Inferra web + NestJS) |
| `ux-information-architecture` | `POR_FEATURE` | Navegación, permisos, menús y búsqueda |
| `ux-mobile-experience` | `CONDICIONAL` | Solo UX responsive móvil web, no crear app nativa |
| `ux-product-discovery` | `POR_FEATURE` | Personas, journeys, onboarding, necesidades empresariales |
| `ux-web-experience` | `POR_FEATURE` | Flujos de formularios, tablas, dashboard |
| `vigilio-architecture-guide` | `BASE` | Gobernanza/calidad común sin dependencia cloud |
| `vigilio-auto-senior` | `BASE` | Router de skills y evidencia, no ejecución automática asumida |
| `web-mfe-build-feature` | `POR_FEATURE` | Screens, forms, route state, queries |
| `web-mfe-contracts` | `POR_FEATURE` | OpenAPI generado, tipado browser-safe, compatibilidad |
| `web-mfe-quality` | `POR_FEATURE` | Performance, accesibilidad, Biome y calidad web |
| `web-mfe-realtime` | `POR_FEATURE` | SSE parser, abort, reintentos controlados |
| `web-mfe-security-delivery` | `POR_FEATURE` | CSP, cookies, secretos y web release; solo perfil Compose |
| `web-mfe-technologies` | `POR_FEATURE` | Preact, Vite, Tailwind, browser stack |
| `web-mfe-testing` | `POR_FEATURE` | Playwright/Vitest de login, forms y rutas |

## Reglas de ruteo y evidencia

1. Nunca cargar las 103 skills sin razón. Descubrir por `routing_*`, seleccionar las de la tarea y leer sus `SKILL.md` + `references/` obligatorias.
2. Guardar en evidencia `skills_discovered`, `skills_loaded` con ruta + SHA-256 real, `canonical_sources_read` y `not_applied` para partes cloud rechazadas.
3. Si un ejemplo Vigilio exige Podman, NATS, SNS/SQS, Terraform o AWS por perfil **no seleccionado**, no copiarlo. Aplicar Docker Compose, PostgreSQL, Valkey, BullMQ, Caddy y servicios autoalojados.
4. Si la tarea requiere herramientas o acceso ausentes, estado `BLOCKED` o `NOT_RUN`; nunca inventar ejecución o resultados.
