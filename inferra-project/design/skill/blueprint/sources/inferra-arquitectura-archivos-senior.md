# Inferra S+ — Arquitectura de archivos (diseño objetivo)

**Fecha de diseño:** 2026-11-08. **Estado:** arquitectura propuesta; no es un repositorio funcional ni un release verificado.

**Restricciones aceptadas:** NestJS, Docker Compose (self-hosted), sin AWS, sin Kubernetes, frontend Preact de la línea Vigilio, vLLM como runtime GPU, PostgreSQL/Drizzle, Valkey, RustFS solo cuando se habilite almacenamiento de objetos, OAuth Google/Facebook + email OTP + MFA, observabilidad y DevSecOps. **Perfil normativo:** `compose-vps` nivel 1 de Vigilio, cinco repositorios.

> En los árboles, los nombres indican el archivo o carpeta a crear **cuando su funcionalidad se implemente**. No generar scaffolding vacío. Algunas capacidades (multi-host, rustfs, benchmark exhaustivo) son fases posteriores. Un árbol de nombres no prueba que los servicios funcionen.

## A. Workspace coordinador (5 repositorios Git)

```text
inferra-workspace/                         # SOLO checkout coordinador, no monorepo Node
├── README.md
├── workspace.yaml                         # origen/commit y ownership de cada repo
├── versions.yaml                          # versiones/hashes de CLI de desarrollo
├── apps/
│   ├── inferra-impl/                       # REPO 1 backend
│   └── inferra-web/                        # REPO 2 frontend
├── inferra-deploy/                         # REPO 3 distribución Compose
├── platform-ops/                           # REPO 4 Ansible independiente del producto
└── prod-local/                             # REPO 5 simulación local
```

Prohibido en raíz: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `packages/contracts/`, `contracts/`, scripts de instalación de negocio, secretos y volúmenes de runtime. Los repositorios pueden ser checkouts independientes o coordinados con manifiesto; si se eligen submódulos Git, fijar SHA.

## B. Repo 1 — `apps/inferra-impl/` — backend NestJS

```text
inferra-impl/
├── AGENTS.md                               # reglas locales Vigilio
├── README.md
├── LICENSE
├── .editorconfig
├── .gitignore
├── .gitleaks.toml
├── .npmrc
├── .env.example                           # NUNCA valores reales
├── .env.test.example
├── .github/
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   └── workflows/
│       ├── ci.yml                          # biome, typecheck, unit, integration, e2e
│       ├── security.yml                    # secrets, SAST, dependency audit
│       ├── openapi-compatibility.yml
│       └── release-oci.yml                 # SBOM+firma+digest
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml                     # packages: [] + supply chain hardened
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── biome.json
├── drizzle.config.ts
├── vitest.config.ts
├── vitest.integration.config.ts
├── playwright.api.config.ts
├── cucumber.js
├── Containerfile                           # build -> distroless node 24 glibc nonroot
├── scripts/
│   ├── check-env.mjs
│   ├── check-architecture.mjs              # fronteras / ciclos / import prohibidos
│   ├── export-openapi.mjs
│   ├── check-openapi-breaking.mjs
│   ├── export-browser-dtos.mjs             # a paquete/artifact generados (no carpeta manual)
│   ├── verify-browser-dtos.mjs
│   ├── generate-migration.mjs
│   ├── verify-migrations.mjs
│   └── smoke-api.mjs
├── src/
│   ├── app.module.ts
│   ├── main.ts                               # proceso `api`
│   ├── worker.main.ts                        # proceso `worker` BullMQ
│   ├── outbox.main.ts                        # proceso `outbox` PostgreSQL
│   ├── migrate.main.ts                       # proceso one-shot `migration`
│   ├── platform-setup.main.ts                # primer administrador/bootstrap
│   ├── bootstrap/
│   │   ├── http.bootstrap.ts                 # Express default, trust proxy, helmet, CORS
│   │   ├── worker.bootstrap.ts
│   │   ├── shutdown.bootstrap.ts             # drain/cancel/close
│   │   ├── openapi.bootstrap.ts
│   │   └── telemetry.bootstrap.ts            # OTel ANTES de Nest
│   ├── config/
│   │   ├── env.schema.ts                     # Zod 4 fail-fast
│   │   ├── env.service.ts
│   │   ├── database.config.ts
│   │   ├── sessions.config.ts
│   │   ├── oauth.config.ts
│   │   ├── inference.config.ts
│   │   ├── jobs.config.ts
│   │   └── telemetry.config.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── drizzle.client.ts
│   │   ├── drizzle.pool.ts
│   │   ├── migrations/                       # generadas, versionadas y revisadas
│   │   ├── seeds/                            # idempotentes, aislados de DDL
│   │   │   └── seed-demo-models.ts
│   │   └── migrate.ts
│   ├── shared/                               # SOLO contratos transversales reales
│   │   ├── http/
│   │   │   ├── dto/
│   │   │   │   ├── offset-pagination.query.dto.ts
│   │   │   │   ├── paginator.dto.ts
│   │   │   │   └── problem-details.response.dto.ts
│   │   │   ├── pipes/
│   │   │   │   ├── zod-body.pipe.ts
│   │   │   │   └── zod-query.pipe.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-principal.decorator.ts
│   │   │   │   └── idempotency-key.decorator.ts
│   │   │   ├── filters/problem-details.filter.ts
│   │   │   ├── interceptors/correlation-id.interceptor.ts
│   │   │   └── guards/private-by-default.guard.ts
│   │   ├── security/
│   │   │   ├── crypto/constant-time-compare.ts
│   │   │   ├── crypto/key-derivation.ts
│   │   │   ├── redaction/redact-sensitive-fields.ts
│   │   │   └── network/ssrf-egress.policy.ts
│   │   ├── tenancy/
│   │   │   ├── tenant-context.ts
│   │   │   └── tenant-scope.policy.ts
│   │   ├── observability/
│   │   │   ├── logger/pino.factory.ts
│   │   │   ├── tracing/span-attributes.ts
│   │   │   └── metrics/metric-registry.ts
│   │   ├── data/transaction-manager.port.ts
│   │   └── events/
│   │       ├── outbox-event.schema.ts
│   │       ├── outbox-dispatcher.ts
│   │       └── processed-event.repository.ts
│   └── modules/
│       ├── identity/                          # DETALLE COMPLETO ABAJO
│       ├── organizations/
│       ├── authorization/
│       ├── api-credentials/
│       ├── model-catalog/
│       ├── model-deployments/
│       ├── gpu-nodes/
│       ├── inference/
│       ├── request-routing/
│       ├── admission-control/
│       ├── quotas/
│       ├── usage-ledger/
│       ├── playground/
│       ├── benchmarks/
│       ├── experiments/
│       ├── notifications/
│       ├── audit/
│       ├── artifacts/                        # OPCIONAL RustFS
│       └── system/
├── tests/
│   ├── unit/
│   │   ├── identity/
│   │   ├── authorization/
│   │   ├── inference/
│   │   ├── admission-control/
│   │   └── quotas/
│   ├── integration/
│   │   ├── postgres/
│   │   ├── valkey/
│   │   ├── outbox/
│   │   ├── workers/
│   │   ├── inference-stub/
│   │   └── rustfs/                            # solo cuando `artifacts` exista
│   ├── contract/
│   │   ├── openapi.spec.ts
│   │   ├── dto-browser-safe.spec.ts
│   │   ├── openai-chat-compat.spec.ts
│   │   └── sse-event-contract.spec.ts
│   ├── bdd/
│   │   ├── features/
│   │   │   ├── auth/otp-once.feature
│   │   │   ├── auth/social-login-linking.feature
│   │   │   ├── tenancy/cross-tenant-deny.feature
│   │   │   ├── quota/atomic-reservation.feature
│   │   │   ├── inference/request-cancel.feature
│   │   │   └── deployment/approve-and-rollback.feature
│   │   ├── steps/
│   │   │   ├── identity.steps.ts
│   │   │   ├── tenancy.steps.ts
│   │   │   ├── quota.steps.ts
│   │   │   └── inference.steps.ts
│   │   └── support/
│   │       ├── world.ts
│   │       ├── test-clock.ts
│   │       └── fixtures.ts
│   ├── e2e/
│   │   ├── api/
│   │   │   ├── password-login.spec.ts
│   │   │   ├── google-callback.spec.ts        # OAuth stub, no Google real en CI
│   │   │   ├── facebook-callback.spec.ts
│   │   │   ├── otp-login.spec.ts
│   │   │   ├── mfa-recovery.spec.ts
│   │   │   ├── organization-members.spec.ts
│   │   │   ├── api-keys.spec.ts
│   │   │   ├── model-deployments.spec.ts
│   │   │   ├── openai-chat-stream.spec.ts
│   │   │   ├── inference-abort.spec.ts
│   │   │   └── benchmarks.spec.ts
│   │   └── security/
│   │       ├── idor-cross-tenant.spec.ts
│   │       ├── csrf.spec.ts
│   │       ├── rate-limits.spec.ts
│   │       ├── otp-replay.spec.ts
│   │       ├── session-reuse.spec.ts
│   │       └── unknown-model-access.spec.ts
│   ├── load/
│   │   ├── k6/inference-smoke.js
│   │   ├── k6/inference-saturation.js
│   │   ├── k6/api-auth-rate-limits.js
│   │   └── datasets/prompt-mix.example.jsonl
│   └── fixtures/
│       ├── tenant-factory.ts
│       ├── user-factory.ts
│       ├── fake-identity-provider.ts
│       ├── fake-vllm-server.ts
│       └── secrets-fixture.example.json
└── docs/
    ├── architecture/
    │   ├── context.md
    │   ├── containers.md
    │   ├── dependency-rules.md
    │   └── data-classification.md
    ├── adr/
    │   ├── 0001-modular-monolith.md
    │   ├── 0002-control-data-plane.md
    │   ├── 0003-sessions-and-oauth.md
    │   ├── 0004-atomic-quota-reservations.md
    │   └── 0005-model-provisioning-trust.md
    ├── threat-models/
    │   ├── auth-and-session.md
    │   ├── inference-prompt-data.md
    │   ├── remote-runtime-management.md
    │   └── object-upload.md
    ├── api/openapi.generated.json
    ├── api/openai-compatibility-matrix.md
    └── decisions/benchmark-methodology.md
```

### B1. `identity/` — Google, Facebook, email OTP, sesiones, MFA

```text
src/modules/identity/
├── identity.module.ts
├── domain/
│   ├── schemas/
│   │   ├── user.schema.ts
│   │   ├── identity-provider.schema.ts
│   │   ├── session.schema.ts
│   │   ├── otp-challenge.schema.ts
│   │   └── mfa-device.schema.ts
│   ├── entities/
│   │   └── otp-challenge.entity.ts        # canConsume / consume / expire
│   ├── policies/
│   │   ├── social-account-link.policy.ts
│   │   ├── sensitive-action.policy.ts
│   │   └── login-risk.policy.ts
│   └── errors/
│       ├── invalid-credentials.error.ts
│       └── otp-challenge-invalid.error.ts
├── application/
│   ├── ports/
│   │   ├── user.repository.port.ts
│   │   ├── session.repository.port.ts
│   │   ├── otp.repository.port.ts
│   │   ├── identity-provider.port.ts
│   │   ├── mailer.port.ts
│   │   └── token-hasher.port.ts
│   ├── services/
│   │   ├── register-account.service.ts
│   │   ├── authenticate-password.service.ts
│   │   ├── request-email-otp.service.ts
│   │   ├── verify-email-otp.service.ts
│   │   ├── begin-oauth-login.service.ts
│   │   ├── complete-oauth-login.service.ts
│   │   ├── link-social-identity.service.ts
│   │   ├── rotate-session.service.ts
│   │   ├── revoke-session.service.ts
│   │   ├── enroll-totp.service.ts
│   │   ├── verify-totp.service.ts
│   │   ├── recover-account.service.ts
│   │   └── require-step-up.service.ts
│   └── types/
│       ├── identity-principal.type.ts
│       └── oauth-callback-result.type.ts
├── infrastructure/
│   ├── persistence/drizzle/
│   │   ├── schema.ts                     # users, identities, sessions, otp, mfa
│   │   ├── user.repository.ts
│   │   ├── session.repository.ts
│   │   ├── otp.repository.ts
│   │   └── mfa.repository.ts
│   ├── oauth/
│   │   ├── google-oidc.adapter.ts
│   │   └── facebook-oauth.adapter.ts
│   ├── crypto/
│   │   ├── argon2id-password.adapter.ts
│   │   ├── otp-hash.adapter.ts
│   │   └── refresh-token-hash.adapter.ts
│   └── email/smtp-mailer.adapter.ts
├── presentation/http/
│   ├── controllers/
│   │   ├── identity.controller.ts
│   │   ├── oauth.controller.ts
│   │   ├── sessions.controller.ts
│   │   └── mfa.controller.ts
│   ├── dto/
│   │   ├── register-account.request.dto.ts
│   │   ├── authenticate-password.request.dto.ts
│   │   ├── request-email-otp.request.dto.ts
│   │   ├── verify-email-otp.request.dto.ts
│   │   ├── session.response.dto.ts
│   │   ├── list-sessions.response.dto.ts
│   │   ├── enroll-totp.response.dto.ts
│   │   ├── verify-totp.request.dto.ts
│   │   └── revoke-session.request.dto.ts
│   └── docs/
│       ├── authenticate-password.request.doc.ts
│       ├── request-email-otp.request.doc.ts
│       └── session.response.doc.ts
└── tests/
    ├── unit/otp-single-use.spec.ts
    ├── unit/account-linking.spec.ts
    ├── integration/otp-concurrent-verify.spec.ts
    └── integration/refresh-rotation-reuse.spec.ts
```

**Reglas auth:** OTP aleatorio con hash en BD, TTL, máximo de intentos y consumo atómico; respuestas resistentes a enumeración. Google: Code + PKCE + state/nonce + JWKS/issuer/audience; Facebook: OAuth state, validación backend del token, ID estable. No vincular cuentas solo por coincidencia del email. Sesiones browser por cookies `Secure`, `HttpOnly`, `SameSite` apropiado + CSRF donde corresponda; revocación y detección de refresh reuse. Modo instalación privada permite desactivar social login. `instance_owner` bootstrap por token de un solo uso, con caducidad y sin crear credenciales admin por defecto. Step-up MFA para secretos, modelos y cambios críticos.

### B2. `organizations/` y `authorization/` — tenancy, RBAC/ABAC

```text
src/modules/organizations/
├── organizations.module.ts
├── domain/schemas/{organization,member,invitation}.schema.ts
├── application/ports/{organization,invitation}.repository.port.ts
├── application/services/
│   ├── create-organization.service.ts
│   ├── list-organizations.service.ts
│   ├── invite-member.service.ts
│   ├── accept-invitation.service.ts
│   └── change-member-role.service.ts
├── infrastructure/persistence/drizzle/{schema,organization.repository,invitation.repository}.ts
├── presentation/http/controllers/{organizations,members,invitations}.controller.ts
└── presentation/http/dto/
    ├── create-organization.request.dto.ts
    ├── invite-member.request.dto.ts
    ├── update-member-role.request.dto.ts
    └── organization.response.dto.ts

src/modules/authorization/
├── authorization.module.ts
├── domain/schemas/{role,permission,policy-binding}.schema.ts
├── domain/policies/{model-access,organization-role,tenant-boundary}.policy.ts
├── application/services/authorize-action.service.ts
├── infrastructure/persistence/drizzle/{schema,policy-binding.repository}.ts
├── presentation/http/guards/resource-permission.guard.ts
└── tests/unit/resource-policy.spec.ts
```

Tenancy se valida en Application y se refuerza en consultas SQL; PostgreSQL RLS como defensa adicional si se habilita y prueba con el **rol efectivo de la app**. Registrar explícitamente operaciones cross-tenant denegadas, sin filtrar existencia de recursos privados. Policies privadas por defecto.

### B3. `api-credentials/`, `quotas/` y `usage-ledger/`

```text
src/modules/api-credentials/
├── api-credentials.module.ts
├── domain/schemas/{api-key,api-key-scope}.schema.ts
├── application/ports/api-key.repository.port.ts
├── application/services/{issue-api-key,rotate-api-key,revoke-api-key,list-api-keys}.service.ts
├── infrastructure/persistence/drizzle/{schema,api-key.repository}.ts
├── presentation/http/controllers/api-credentials.controller.ts
└── presentation/http/dto/{create-api-key.request,api-key.response,api-key-created.response}.dto.ts

src/modules/quotas/
├── quotas.module.ts
├── domain/schemas/{token-quota,budget-reservation}.schema.ts
├── domain/policies/tenant-budget.policy.ts
├── application/ports/quota-reservation.repository.port.ts
├── application/services/{reserve-inference-budget,settle-budget,refund-budget,set-quota}.service.ts
├── infrastructure/persistence/drizzle/{schema,quota-reservation.repository}.ts
├── presentation/http/controllers/quotas.controller.ts
└── presentation/http/dto/{quota.response,update-quota.request}.dto.ts

src/modules/usage-ledger/
├── usage-ledger.module.ts
├── domain/schemas/{usage-entry,model-price-estimate}.schema.ts
├── application/services/{record-inference-usage,list-usage,calculate-usage-estimate}.service.ts
├── infrastructure/persistence/drizzle/{schema,usage-entry.repository}.ts
├── presentation/http/controllers/usage.controller.ts
└── presentation/http/dto/{list-usage.query,usage-summary.response}.dto.ts
```

La reserva de presupuesto debe ser **atómica e idempotente**; posterior conciliación basada en tokens reales. Never usar solo rate-limit por IP como cuota de tokens. Al fallar Valkey, aplicar política definida: rechazar nuevos requests de inferencia con respuesta recuperable si no se puede garantizar cuota; no emitir tokens gratis por error.

### B4. Modelos, GPU y despliegues

```text
src/modules/model-catalog/
├── model-catalog.module.ts
├── domain/schemas/{model,model-revision,model-capability,model-license}.schema.ts
├── application/services/{register-model,validate-model-manifest,list-models}.service.ts
├── application/ports/model-catalog.repository.port.ts
├── infrastructure/persistence/drizzle/{schema,model-catalog.repository}.ts
├── presentation/http/controllers/model-catalog.controller.ts
└── presentation/http/dto/{register-model.request,model.response,list-models.query}.dto.ts

src/modules/gpu-nodes/
├── gpu-nodes.module.ts
├── domain/schemas/{gpu-node,gpu-device,gpu-heartbeat}.schema.ts
├── application/ports/gpu-metrics-reader.port.ts
├── application/services/{register-gpu-node,record-gpu-heartbeat,list-gpu-nodes}.service.ts
├── infrastructure/metrics/dcgm-gpu-metrics.adapter.ts
├── infrastructure/persistence/drizzle/{schema,gpu-node.repository}.ts
├── presentation/http/controllers/gpu-nodes.controller.ts
└── presentation/http/dto/{gpu-node.response,gpu-capacity.response}.dto.ts

src/modules/model-deployments/
├── model-deployments.module.ts
├── domain/
│   ├── schemas/{deployment,deployment-revision,deployment-configuration}.schema.ts
│   ├── entities/deployment.entity.ts           # estados e invariantes, NO CRUD ceremonial
│   ├── policies/deployment-compatibility.policy.ts
│   └── errors/illegal-deployment-transition.error.ts
├── application/
│   ├── ports/{deployment.repository,runtime-provisioner,runtime-health}.port.ts
│   └── services/
│       ├── register-deployment.service.ts
│       ├── validate-deployment.service.ts
│       ├── activate-deployment.service.ts
│       ├── stop-deployment.service.ts
│       ├── rollback-deployment.service.ts
│       └── reconcile-deployment.service.ts
├── infrastructure/
│   ├── persistence/drizzle/{schema,deployment.repository}.ts
│   ├── runtime/vllm-health.adapter.ts
│   ├── runtime/approved-deployment-runner.adapter.ts
│   └── workers/deployment-reconciler.consumer.ts
├── presentation/http/
│   ├── controllers/model-deployments.controller.ts
│   ├── dto/
│   │   ├── register-deployment.request.dto.ts
│   │   ├── configure-deployment.request.dto.ts
│   │   ├── deployment.response.dto.ts
│   │   ├── list-deployments.query.dto.ts
│   │   └── deployment-status.response.dto.ts
│   └── docs/register-deployment.request.doc.ts
└── tests/{unit,integration}/
```

**Seguridad del provisioner:** UI/HTTP **no ejecutan `docker run`, `compose up` arbitrarios**, comandos de shell ni montan `/var/run/docker.sock`. El primer MVP opera un runtime vLLM predefinido por Compose con perfiles aprobados. Si se habilita despliegue dinámico, añadir un **agente host dedicado**, autenticado por mTLS/Unix socket restringido, allowlist de modelos/flags/volúmenes, reconciliación de `desired_state` vs `observed_state`, y auditoría; requiere threat model y pruebas antes de producción. `gpu-nodes` puede ser read-only al inicio.

### B5. Inferencia, routing, admission control

```text
src/modules/inference/
├── inference.module.ts
├── domain/
│   ├── schemas/{inference-request,inference-result,model-capability}.schema.ts
│   └── errors/{model-unavailable,upstream-timeout,client-aborted}.error.ts
├── application/
│   ├── ports/{inference-runtime,stream-event-sink}.port.ts
│   ├── services/{create-chat-completion,list-serving-models,cancel-inference}.service.ts
│   └── types/inference-command.type.ts
├── infrastructure/
│   ├── vllm/
│   │   ├── vllm-openai.adapter.ts
│   │   ├── vllm-stream.decoder.ts
│   │   ├── vllm-capabilities.adapter.ts
│   │   └── vllm-health.adapter.ts
│   └── http/upstream-http.client.ts
├── presentation/http/
│   ├── controllers/openai-compatible.controller.ts
│   ├── dto/
│   │   ├── create-chat-completion.request.dto.ts
│   │   ├── create-completion.request.dto.ts
│   │   ├── chat-completion.response.dto.ts
│   │   ├── inference-error.response.dto.ts
│   │   └── list-serving-models.response.dto.ts
│   └── streaming/
│       ├── sse-stream.writer.ts
│       ├── stream-disconnect.handler.ts
│       └── completion-event.mapper.ts
└── tests/{unit,contract,integration}/

src/modules/request-routing/
├── request-routing.module.ts
├── domain/policies/{routing,endpoint-health,circuit-breaker}.policy.ts
├── application/ports/runtime-pool.port.ts
├── application/services/{select-runtime,mark-runtime-degraded}.service.ts
├── infrastructure/persistence/drizzle/{schema,runtime-pool.repository}.ts
└── tests/unit/routing-policy.spec.ts

src/modules/admission-control/
├── admission-control.module.ts
├── domain/schemas/{admission-ticket,queue-policy}.schema.ts
├── application/ports/admission-store.port.ts
├── application/services/{acquire-inference-slot,release-inference-slot}.service.ts
├── infrastructure/valkey/atomic-admission.adapter.ts
└── tests/integration/concurrent-admission.spec.ts
```

API pública compatible: `/v1/models`, `/v1/chat/completions`, `/v1/completions`. `/v1/embeddings` y `/v1/responses` se incorporan **solo tras verificar soporte** en runtime, modelo y SDK. `/v1` autentica **API key de proyecto/organización**, mientras `/api/v1` opera sesiones de consola. Streams por POST deben manejar `AbortSignal`, backpressure, límites, timeouts, métricas de TTFT y cancelación upstream. No prometer que el streaming del browser usa `EventSource` para un POST; usar `fetch` + lector de stream compatible SSE.

### B6. Benchmarks, experimentos, playground, auditoría, archivos

```text
src/modules/benchmarks/
├── benchmarks.module.ts
├── domain/schemas/{benchmark-run,benchmark-dataset,benchmark-metric}.schema.ts
├── application/ports/{benchmark-runner,benchmark.repository}.port.ts
├── application/services/{schedule-benchmark,cancel-benchmark,get-benchmark-result}.service.ts
├── infrastructure/workers/benchmark-run.consumer.ts
├── infrastructure/runners/vllm-bench.adapter.ts
├── infrastructure/persistence/drizzle/{schema,benchmark.repository}.ts
├── presentation/http/controllers/benchmarks.controller.ts
└── presentation/http/dto/{create-benchmark.request,benchmark-run.response}.dto.ts

src/modules/experiments/
├── experiments.module.ts
├── domain/schemas/{experiment,candidate-configuration,experiment-comparison}.schema.ts
├── application/services/{create-experiment,compare-candidates,promote-candidate,rollback-experiment}.service.ts
├── infrastructure/persistence/drizzle/{schema,experiment.repository}.ts
├── presentation/http/controllers/experiments.controller.ts
└── presentation/http/dto/{create-experiment.request,experiment.response,comparison.response}.dto.ts

src/modules/playground/
├── playground.module.ts
├── domain/schemas/{playground-session,preset,prompt-version}.schema.ts
├── application/services/{create-playground-session,list-playground-sessions,save-prompt-preset}.service.ts
├── infrastructure/persistence/drizzle/{schema,playground.repository}.ts
├── presentation/http/controllers/playground.controller.ts
└── presentation/http/dto/{create-session.request,preset.response}.dto.ts

src/modules/notifications/
├── notifications.module.ts
├── application/services/{send-security-email,send-incident-notification}.service.ts
├── infrastructure/email/smtp-notification.adapter.ts
├── infrastructure/workers/notification.consumer.ts
└── templates/{otp-code,security-alert,invitation}.mjml

src/modules/audit/
├── audit.module.ts
├── domain/schemas/audit-event.schema.ts
├── application/services/{record-audit-event,list-audit-events}.service.ts
├── infrastructure/persistence/drizzle/{schema,audit.repository}.ts
├── presentation/http/controllers/audit.controller.ts
└── presentation/http/dto/{list-audit-events.query,audit-event.response}.dto.ts

src/modules/artifacts/                    # HABILITAR SOLO CON UPLOADS/DATASETS
├── artifacts.module.ts
├── domain/schemas/{artifact,upload-session}.schema.ts
├── application/ports/{object-store,malware-scanner}.port.ts
├── application/services/{request-upload,finalize-upload,delete-artifact}.service.ts
├── infrastructure/storage/rustfs-s3.adapter.ts
├── infrastructure/security/clamav-scanner.adapter.ts
├── infrastructure/persistence/drizzle/{schema,artifact.repository}.ts
├── presentation/http/controllers/artifacts.controller.ts
└── presentation/http/dto/{request-upload.request,upload-session.response}.dto.ts

src/modules/system/
├── system.module.ts
├── application/services/{get-system-readiness,get-installation-status}.service.ts
├── presentation/http/controllers/{health,system-admin}.controller.ts
└── presentation/http/dto/system-readiness.response.dto.ts
```

Si RustFS se habilita: URLs prefirmadas de corta vida, tipo/tamaño/checksum limitado, objetos en cuarentena, validación de pertenencia, malware scan antes de publicar, políticas de expiración y limpieza de uploads huérfanos. No servir arbitrariamente archivos subidos bajo el mismo origen de la consola sin controles.

## C. Repo 2 — `apps/inferra-web/` — Preact + Vite

```text
inferra-web/
├── AGENTS.md
├── README.md
├── .editorconfig
├── .gitignore
├── .gitleaks.toml
├── .npmrc
├── .env.example                          # SOLO configuración pública no secreta
├── .github/
│   ├── CODEOWNERS
│   └── workflows/{ci,security,release-oci}.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml                    # packages: []
├── tsconfig.json
├── vite.config.ts
├── biome.json
├── vitest.config.ts
├── playwright.config.ts
├── index.html
├── Containerfile.runtime                 # solo `dist` + servidor estático mínimo
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── robots.txt
├── scripts/
│   ├── verify-api-contracts.mjs
│   ├── check-bundle-budget.mjs
│   └── audit-public-env.mjs
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── app.tsx
│   │   ├── routes.tsx
│   │   ├── providers/
│   │   │   ├── query.provider.tsx
│   │   │   ├── auth.provider.tsx
│   │   │   ├── theme.provider.tsx
│   │   │   └── error.provider.tsx
│   │   ├── layouts/
│   │   │   ├── public.layout.tsx
│   │   │   ├── auth.layout.tsx
│   │   │   ├── console.layout.tsx
│   │   │   └── settings.layout.tsx
│   │   ├── guards/
│   │   │   ├── authenticated-route.tsx
│   │   │   ├── organization-route.tsx
│   │   │   └── capability-route.tsx
│   │   └── boundaries/
│   │       ├── route-error.boundary.tsx
│   │       └── route-suspense.boundary.tsx
│   ├── services/
│   │   ├── http/
│   │   │   ├── api-client.ts
│   │   │   ├── api-error.ts
│   │   │   ├── csrf-client.ts
│   │   │   └── request-id.ts
│   │   ├── auth/
│   │   │   ├── session-client.ts
│   │   │   ├── oauth-redirect.ts
│   │   │   └── otp-client.ts
│   │   ├── inference/
│   │   │   ├── chat-stream.client.ts
│   │   │   ├── sse-frame.parser.ts
│   │   │   └── abortable-request.ts
│   │   ├── runtime-config/
│   │   │   ├── public-runtime-config.ts
│   │   │   └── public-runtime-config.schema.ts
│   │   └── observability/
│   │       ├── browser-rum.ts
│   │       └── trace-context.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login.page.tsx
│   │   │   │   ├── register.page.tsx
│   │   │   │   ├── email-otp.page.tsx
│   │   │   │   ├── verify-email.page.tsx
│   │   │   │   ├── recover-account.page.tsx
│   │   │   │   ├── oauth-complete.page.tsx
│   │   │   │   ├── mfa-challenge.page.tsx
│   │   │   │   └── session-expired.page.tsx
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── oauth-provider-buttons.tsx
│   │   │   │   ├── otp-code-input.tsx
│   │   │   │   └── password-strength.tsx
│   │   │   ├── hooks/{use-session,use-request-otp,use-complete-oauth}.ts
│   │   │   ├── services/auth.api.ts
│   │   │   └── auth.query-keys.ts
│   │   ├── onboarding/
│   │   │   ├── pages/{welcome,create-organization,connect-runtime}.page.tsx
│   │   │   └── components/{setup-progress,gpu-preflight-status}.tsx
│   │   ├── dashboard/
│   │   │   ├── pages/dashboard.page.tsx
│   │   │   ├── components/{kpi-grid,latency-sparkline,health-overview}.tsx
│   │   │   ├── hooks/use-dashboard-data.ts
│   │   │   └── services/dashboard.api.ts
│   │   ├── playground/
│   │   │   ├── pages/{playground,playground-history}.page.tsx
│   │   │   ├── components/
│   │   │   │   ├── chat-message.tsx
│   │   │   │   ├── model-picker.tsx
│   │   │   │   ├── prompt-editor.tsx
│   │   │   │   ├── generation-settings.tsx
│   │   │   │   ├── streaming-output.tsx
│   │   │   │   └── compare-completions.tsx
│   │   │   ├── hooks/{use-chat-stream,use-playground-session}.ts
│   │   │   ├── services/playground.api.ts
│   │   │   └── playground.query-keys.ts
│   │   ├── models/
│   │   │   ├── pages/{models-list,model-details,register-model}.page.tsx
│   │   │   ├── components/{model-card,model-capabilities,model-license-warning}.tsx
│   │   │   ├── hooks/use-models.ts
│   │   │   └── services/models.api.ts
│   │   ├── deployments/
│   │   │   ├── pages/{deployments-list,create-deployment,deployment-details}.page.tsx
│   │   │   ├── components/{deployment-status,configuration-form,rollback-dialog}.tsx
│   │   │   ├── hooks/{use-deployments,use-deployment-actions}.ts
│   │   │   └── services/deployments.api.ts
│   │   ├── gpu-nodes/
│   │   │   ├── pages/{gpu-list,gpu-details}.page.tsx
│   │   │   ├── components/{vram-chart,gpu-utilization-card}.tsx
│   │   │   └── services/gpu-nodes.api.ts
│   │   ├── api-keys/
│   │   │   ├── pages/api-keys.page.tsx
│   │   │   ├── components/{create-api-key-dialog,api-key-once-view,scopes-editor}.tsx
│   │   │   └── services/api-keys.api.ts
│   │   ├── usage/
│   │   │   ├── pages/{usage,quotas}.page.tsx
│   │   │   ├── components/{usage-timeseries,token-breakdown,budget-alerts}.tsx
│   │   │   └── services/usage.api.ts
│   │   ├── benchmarks/
│   │   │   ├── pages/{benchmark-list,new-benchmark,benchmark-detail}.page.tsx
│   │   │   ├── components/{benchmark-config-form,ttft-chart,throughput-chart}.tsx
│   │   │   └── services/benchmarks.api.ts
│   │   ├── experiments/
│   │   │   ├── pages/{experiments-list,compare-experiment}.page.tsx
│   │   │   ├── components/{experiment-comparison,select-candidate}.tsx
│   │   │   └── services/experiments.api.ts
│   │   ├── organizations/
│   │   │   ├── pages/{organization-profile,members,invitations,roles}.page.tsx
│   │   │   ├── components/{member-table,invite-member-dialog,role-selector}.tsx
│   │   │   └── services/organizations.api.ts
│   │   ├── security/
│   │   │   ├── pages/{security-settings,active-sessions,mfa,oauth-connections}.page.tsx
│   │   │   ├── components/{mfa-enrollment,session-list,security-event-list}.tsx
│   │   │   └── services/security.api.ts
│   │   ├── audit/
│   │   │   ├── pages/audit-events.page.tsx
│   │   │   └── components/audit-event-table.tsx
│   │   ├── system/
│   │   │   ├── pages/{system-health,storage,backups,updates,settings}.page.tsx
│   │   │   ├── components/{runtime-health,backup-status,service-status}.tsx
│   │   │   └── services/system.api.ts
│   │   └── errors/
│   │       ├── pages/{not-found,forbidden,service-unavailable}.page.tsx
│   │       └── components/retry-request.tsx
│   ├── libs/
│   │   ├── ui/
│   │   │   ├── button/button.tsx
│   │   │   ├── input/input.tsx
│   │   │   ├── dialog/dialog.tsx
│   │   │   ├── table/data-table.tsx
│   │   │   ├── toast/toast.tsx
│   │   │   ├── empty-state/empty-state.tsx
│   │   │   ├── skeleton/skeleton.tsx
│   │   │   ├── form/form-field.tsx
│   │   │   └── status/status-indicator.tsx
│   │   ├── charts/{time-series,percentile-distribution,capacity-chart}.tsx
│   │   ├── accessibility/{focus-manager,live-announcer}.ts
│   │   └── formatting/{duration,tokens,bytes,date-time}.ts
│   └── styles/
│       ├── global.css
│       ├── tokens.css
│       └── themes.css
├── tests/
│   ├── unit/{formatters,query-keys,sse-parser}/
│   ├── components/{login-form,otp-code-input,playground,quota-form}/
│   ├── msw/{handlers,server,fixtures}/
│   ├── contract/{api-browser-schema,sse-events}/
│   ├── e2e/
│   │   ├── auth-login.spec.ts
│   │   ├── auth-otp.spec.ts
│   │   ├── auth-google-stub.spec.ts
│   │   ├── auth-facebook-stub.spec.ts
│   │   ├── auth-mfa.spec.ts
│   │   ├── create-organization.spec.ts
│   │   ├── tenant-isolation.spec.ts
│   │   ├── models-and-deployments.spec.ts
│   │   ├── playground-stream.spec.ts
│   │   ├── api-keys.spec.ts
│   │   ├── benchmark-report.spec.ts
│   │   ├── session-expiry.spec.ts
│   │   └── keyboard-accessibility.spec.ts
│   ├── accessibility/{axe-critical-routes,focus-traps}.spec.ts
│   └── visual/{login,dashboard,playground}.spec.ts
└── docs/
    ├── route-map.md
    ├── ux-user-journeys.md
    ├── design-tokens.md
    └── browser-security.md
```

### C1. Rutas/páginas (URL → archivo y permiso)

| Ruta | Página | Permiso/estado |
|---|---|---|
| `/login` | `auth/pages/login.page.tsx` | Pública, Google/Facebook/contraseña/OTP |
| `/register` | `auth/pages/register.page.tsx` | Pública si registro habilitado |
| `/login/otp` | `auth/pages/email-otp.page.tsx` | Pública, flujo challenge |
| `/auth/complete` | `auth/pages/oauth-complete.page.tsx` | Finalización controlada de OAuth |
| `/mfa/challenge` | `auth/pages/mfa-challenge.page.tsx` | Challenge temporal |
| `/onboarding` | `onboarding/pages/welcome.page.tsx` | Admin inicial |
| `/app/:org_slug/dashboard` | `dashboard/pages/dashboard.page.tsx` | `metrics:read` |
| `/app/:org_slug/playground` | `playground/pages/playground.page.tsx` | `inference:invoke` |
| `/app/:org_slug/models` | `models/pages/models-list.page.tsx` | `models:read` |
| `/app/:org_slug/models/new` | `models/pages/register-model.page.tsx` | `models:write` |
| `/app/:org_slug/deployments` | `deployments/pages/deployments-list.page.tsx` | `deployments:read` |
| `/app/:org_slug/deployments/new` | `deployments/pages/create-deployment.page.tsx` | `deployments:write` + MFA |
| `/app/:org_slug/gpus` | `gpu-nodes/pages/gpu-list.page.tsx` | `infrastructure:read` |
| `/app/:org_slug/api-keys` | `api-keys/pages/api-keys.page.tsx` | `credentials:manage` |
| `/app/:org_slug/usage` | `usage/pages/usage.page.tsx` | `usage:read` |
| `/app/:org_slug/quotas` | `usage/pages/quotas.page.tsx` | `quotas:manage` |
| `/app/:org_slug/benchmarks` | `benchmarks/pages/benchmark-list.page.tsx` | `benchmarks:read` |
| `/app/:org_slug/benchmarks/new` | `benchmarks/pages/new-benchmark.page.tsx` | `benchmarks:run` |
| `/app/:org_slug/experiments` | `experiments/pages/experiments-list.page.tsx` | `experiments:read` |
| `/app/:org_slug/members` | `organizations/pages/members.page.tsx` | `members:manage` |
| `/app/:org_slug/audit` | `audit/pages/audit-events.page.tsx` | `audit:read` |
| `/account/security` | `security/pages/security-settings.page.tsx` | Dueño de sesión |
| `/account/sessions` | `security/pages/active-sessions.page.tsx` | Dueño de sesión |
| `/admin/system` | `system/pages/system-health.page.tsx` | `instance:admin` |
| `/admin/backups` | `system/pages/backups.page.tsx` | `instance:admin` |

**Notas frontend:** `app/` solo shell/router/providers; `features/` negocio visual; `services/` transport/parsing; `libs/ui/` UI realmente reutilizable. La navegación no es control de seguridad: backend repite TODAS las comprobaciones. Query: server state; RHF: formularios; Signals: estado efímero/local. El navegador solo recibe configuración pública. Contratos HTTP browser-safe generados desde backend vía release/OpenAPI, no duplicados a mano.

## D. Repo 3 — `inferra-deploy/` — distribución instalable

```text
inferra-deploy/
├── AGENTS.md
├── README.md
├── LICENSE
├── .gitignore
├── .gitleaks.toml
├── .github/
│   ├── CODEOWNERS
│   └── workflows/{compose-lint,release,deploy-staging,deploy-production}.yml
├── install.sh                             # asistente interactivo idempotente
├── upgrade.sh                             # digest aprobado, drain, rollback
├── verify.sh                              # servicios, versión, GPU, TLS, backup
├── status.sh
├── uninstall.sh                           # no borra datos sin --destroy-data confirmado
├── release-manifest.yaml                 # imágenes @sha256, compatibilidad mínima
├── environments/
│   ├── local.env.example
│   ├── staging.env.example
│   └── production.env.example
├── compose/
│   ├── compose.yaml                       # EL ÚNICO Compose funcional
│   └── Caddyfile
├── provisioning/
│   ├── scripts/
│   │   ├── preflight-host.sh
│   │   ├── preflight-gpu.sh
│   │   ├── preflight-model.sh
│   │   ├── configure-secrets.sh
│   │   ├── verify-image-signatures.sh
│   │   ├── run-migrations.sh
│   │   ├── bootstrap-instance.sh
│   │   ├── smoke-after-rollout.sh
│   │   └── rollback-release.sh
│   ├── model-profiles/
│   │   ├── small-qwen-nvidia.yaml
│   │   ├── medium-qwen-nvidia.yaml
│   │   └── cpu-demo.yaml
│   ├── model-manifests/
│   │   └── approved-models.yaml           # modelo+revisión+licencia+checksums
│   └── gpu/
│       ├── nvidia-container-toolkit.md
│       ├── gpu-compatibility-matrix.md
│       └── vllm-troubleshooting.md
├── configuration/
│   ├── app.defaults.yaml
│   ├── retention.defaults.yaml
│   └── public-runtime-config.example.json
├── observability/
│   ├── otel-collector/otel-collector.yaml
│   ├── prometheus/
│   │   ├── prometheus.yaml
│   │   ├── recording-rules.yaml
│   │   ├── slo-burn-rates.yaml
│   │   ├── gpu-alerts.yaml
│   │   └── tests/{slo-burn-rates,gpu-alerts}.test.yaml
│   ├── alertmanager/
│   │   ├── alertmanager.yaml
│   │   └── route-tests.yaml
│   ├── alloy/config.alloy
│   ├── loki/loki.yaml
│   ├── tempo/tempo.yaml
│   ├── grafana/
│   │   ├── provisioning/datasources/datasources.yaml
│   │   ├── provisioning/dashboards/dashboards.yaml
│   │   └── dashboards/
│   │       ├── api-overview.json
│   │       ├── gpu-and-vram.json
│   │       ├── llm-inference.json
│   │       ├── tenants-and-quotas.json
│   │       └── benchmark-comparison.json
│   └── blackbox/blackbox.yaml
├── backup/
│   ├── pgbackrest/
│   │   ├── pgbackrest.conf.example
│   │   ├── schedule.md
│   │   └── retention.md
│   ├── rustfs/replication-and-export.md    # opcional; off-host obligatorio
│   ├── offsite-backup.md
│   ├── restore-postgres.sh
│   ├── restore-objects.sh
│   └── restore-drill.sh                    # SOLO entorno aislado
├── policies/
│   ├── compose-security.rego
│   ├── signature-verification.md
│   ├── secret-handling.md
│   └── runtime-egress.md
├── operations/
│   ├── slos.md
│   ├── capacity-and-gpu.md
│   ├── incident-severity.md
│   ├── incident-response.md
│   ├── disaster-recovery.md
│   └── runbooks/
│       ├── high-ttft.md
│       ├── oom-gpu.md
│       ├── inference-errors.md
│       ├── postgres-unavailable.md
│       ├── valkey-backlog.md
│       ├── oauth-provider-outage.md
│       └── backup-restore.md
├── tests/
│   ├── compose/validate-all-environments.sh
│   ├── security/no-public-data-ports.sh
│   ├── security/verify-signature-deny.sh
│   ├── smoke/stream-chat.sh
│   ├── smoke/login-email-otp.sh
│   └── dr/restore-isolated.sh
└── docs/
    ├── install-linux-nvidia.md
    ├── install-offline.md
    ├── hardware-requirements.md
    ├── smtp-and-oauth-setup.md
    ├── configure-domain-and-tls.md
    ├── upgrade-and-rollback.md
    └── troubleshooting.md
```

### D1. Servicios del **único** `compose/compose.yaml`

| Servicio | Perfil | Red(es) | Exposición externa |
|---|---|---|---|
| `caddy` | core | `edge`, `backend` | solo 80/443 |
| `web` | core | `edge` | ninguna (vía Caddy) |
| `api` | core | `edge`, `backend`, `observability` | ninguna |
| `worker` | core | `backend`, `observability` | ninguna |
| `outbox` | core | `backend`, `observability` | ninguna |
| `postgres` | core | `backend` | ninguna |
| `valkey` | core | `backend` | ninguna |
| `vllm` | `gpu` | `backend`, `observability` | ninguna, GPU compatible |
| `cpu-demo` | `cpu-demo` | `backend` | ninguna, no vLLM de GPU |
| `migration` | `tools` | `backend` | one-shot, no restart |
| `platform-setup` | `tools` | `backend` | one-shot, no restart |
| `otel-collector` | `observability` | `observability` | ninguna |
| `prometheus` | `observability` | `observability` | ninguna |
| `alloy` | `observability` | `observability` | ninguna |
| `loki` | `observability` | `observability` | ninguna |
| `tempo` | `observability` | `observability` | ninguna |
| `grafana` | `observability` | `observability`, `edge` | autenticación, vía Caddy privado |
| `alertmanager` | `observability` | `observability` | ninguna |
| `blackbox-exporter` | `observability` | `observability` | ninguna |
| `dcgm-exporter` | `gpu`, `observability` | `observability` | ninguna |
| `rustfs` | `storage` | `backend` | ninguna |
| `clamav` | `storage` | `backend` | ninguna |
| `mailpit` | `email-dev` | `backend` | local únicamente |
| `benchmark-runner` | `benchmark` | `backend`, `observability` | aislado de tráfico ordinario |

**Hardening:** `read_only`, `cap_drop: [ALL]`, `no-new-privileges`, `tmpfs` sinexec donde proceda, non-root, recursos acotados, volúmenes exclusivos y health checks. Excepciones necesarias para PostgreSQL, GPU/driver, Alloy/DCGM y Caddy **justificadas por servicio**; no aplicar `read_only` indiscriminadamente donde rompa persistencia. Imágenes por digest OCI firmado, secretos 0600 en host (o mecanismo secret-file equivalente). Se restringe acceso administrador al reverse proxy y a Grafana; Caddy no expone paneles internos sin control.

**Instalación objetivo:** `./install.sh --profile gpu --domain ai.ejemplo.com` → preflight hardware/TLS → secretos → verificación de imágenes → herramientas `migrate` y `platform-setup` → servicios → smoke. Este comando **no está implementado** en este entregable de arquitectura.

## E. Repo 4 — `platform-ops/` — Ansible agnóstico al producto

```text
platform-ops/
├── AGENTS.md
├── README.md
├── ansible.cfg
├── requirements.yml
├── .github/workflows/{lint,ansible-molecule}.yml
├── inventories/
│   ├── example.ini
│   └── group_vars/all.example.yaml
├── playbooks/
│   ├── prepare-linux-host.yml
│   ├── harden-ssh.yml
│   ├── firewall.yml
│   ├── install-docker-engine.yml
│   ├── install-nvidia-toolkit.yml
│   ├── configure-storage.yml
│   ├── configure-backup-target.yml
│   └── verify-host-readiness.yml
├── roles/
│   ├── linux_base/{tasks,handlers,defaults,meta}/
│   ├── ssh_hardening/{tasks,handlers,defaults,meta}/
│   ├── firewall/{tasks,handlers,defaults,meta}/
│   ├── docker_host/{tasks,handlers,defaults,meta}/
│   ├── rootless_podman_host/{tasks,handlers,defaults,meta}/
│   ├── nvidia_container_toolkit/{tasks,defaults,meta}/
│   ├── system_backup/{tasks,defaults,meta}/
│   └── node_monitoring/{tasks,defaults,meta}/
├── tests/
│   ├── molecule/
│   ├── inventory-validation/
│   └── security-baseline/
└── docs/
    ├── supported-hosts.md
    ├── host-hardening.md
    └── nvidia-gpu-validation.md
```

Cada rol usado debe incluir `meta/argument_specs.yml` cuando acepte parámetros. No introducir dominios, modelos o secretos de Inferra dentro de `platform-ops`. La ruta Docker es primaria; Rootless Podman es objetivo de compatibilidad que se certificará específicamente, sobre todo en GPU.

## F. Repo 5 — `prod-local/` — simulación realista del entorno

```text
prod-local/
├── AGENTS.md
├── README.md
├── .gitignore
├── .github/workflows/lab-verify.yml
├── lab.yaml                             # ruta a compose real y perfiles de prueba
├── scripts/
│   ├── up.sh
│   ├── down.sh
│   ├── reset-test-data.sh                # solo ambiente de prueba
│   ├── smoke.sh
│   └── collect-evidence.sh
├── fixtures/
│   ├── organizations.yaml
│   ├── users.yaml
│   ├── models.example.yaml
│   ├── prompt-set.jsonl
│   └── quotas.yaml
├── stubs/
│   ├── google-oidc/
│   ├── facebook-oauth/
│   ├── fake-vllm/
│   └── fake-smtp/
├── scenarios/
│   ├── onboarding-happy-path.yaml
│   ├── otp-replay.yaml
│   ├── cross-tenant-idors.yaml
│   ├── gpu-oom.yaml
│   ├── vllm-timeout.yaml
│   ├── request-cancel.yaml
│   ├── redis-unavailable.yaml
│   ├── postgres-restart.yaml
│   ├── model-roll-back.yaml
│   └── restore-on-new-host.yaml
├── suites/
│   ├── smoke/
│   ├── integration/
│   ├── security/
│   ├── chaos/
│   └── restore/
└── evidence/
    ├── README.md
    └── .gitignore                       # resultados sensibles nunca en Git
```

No duplicar `compose.yaml`; invocar el mismo archivo desde `inferra-deploy` con variables del laboratorio. La evidencia final debe incluir configuración efectiva, hashes OCI, logs redactados, reportes, versiones del driver y estado real de GPU.

## G. Matriz controller → caso de uso → DTO → endpoint

Base administrativa `/api/v1` (sesiones browser, RBAC por recurso y organización); gateway de inferencia `/v1` (API key). Lista mínima de rutas planificadas — nombres de negocio/`operationId` semánticos:

| Controller | Operación HTTP | Caso de uso | DTO principal |
|---|---|---|---|
| IdentityController | `POST /auth/register` | registerAccount | register-account.request.dto.ts |
| IdentityController | `POST /auth/password/login` | authenticatePassword | authenticate-password.request.dto.ts |
| IdentityController | `POST /auth/otp/request` | requestEmailOtp | request-email-otp.request.dto.ts |
| IdentityController | `POST /auth/otp/verify` | verifyEmailOtp | verify-email-otp.request.dto.ts |
| OAuthController | `GET /auth/oauth/:provider/start` | beginOAuthLogin | start-oauth.query.dto.ts |
| OAuthController | `GET /auth/oauth/:provider/callback` | completeOAuthLogin | oauth-callback.query.dto.ts |
| SessionsController | `GET /auth/me` | getCurrentSession | session.response.dto.ts |
| SessionsController | `GET /auth/sessions` | listSessions | list-sessions.response.dto.ts |
| SessionsController | `POST /auth/sessions/revoke` | revokeSession | revoke-session.request.dto.ts |
| MfaController | `POST /auth/mfa/totp/enroll` | enrollTotp | enroll-totp.response.dto.ts |
| MfaController | `POST /auth/mfa/totp/verify` | verifyTotp | verify-totp.request.dto.ts |
| OrganizationsController | `GET/POST /organizations` | list/createOrganizations | create-organization.request.dto.ts |
| MembersController | `POST /organizations/:id/invitations` | inviteMember | invite-member.request.dto.ts |
| ApiCredentialsController | `POST /api-keys` | issueApiKey | create-api-key.request.dto.ts |
| ApiCredentialsController | `POST /api-keys/:id/rotate` | rotateApiKey | api-key-created.response.dto.ts |
| ModelCatalogController | `GET/POST /models` | list/registerModels | register-model.request.dto.ts |
| GpuNodesController | `GET /gpu-nodes` | listGpuNodes | gpu-node.response.dto.ts |
| ModelDeploymentsController | `POST /deployments` | registerDeployment | register-deployment.request.dto.ts |
| ModelDeploymentsController | `POST /deployments/:id/activate` | activateDeployment | deployment.response.dto.ts |
| ModelDeploymentsController | `POST /deployments/:id/stop` | stopDeployment | deployment.response.dto.ts |
| ModelDeploymentsController | `POST /deployments/:id/rollback` | rollbackDeployment | deployment.response.dto.ts |
| OpenAiCompatibleController | `GET /v1/models` | listServingModels | list-serving-models.response.dto.ts |
| OpenAiCompatibleController | `POST /v1/chat/completions` | createChatCompletion | create-chat-completion.request.dto.ts |
| OpenAiCompatibleController | `POST /v1/completions` | createCompletion | create-completion.request.dto.ts |
| QuotasController | `GET/PATCH /quotas` | get/setQuota | update-quota.request.dto.ts |
| UsageController | `GET /usage/summary` | calculateUsageEstimate | usage-summary.response.dto.ts |
| PlaygroundController | `POST /playground/sessions` | createPlaygroundSession | create-session.request.dto.ts |
| BenchmarksController | `POST /benchmarks` | scheduleBenchmark | create-benchmark.request.dto.ts |
| BenchmarksController | `GET /benchmarks/:id` | getBenchmarkResult | benchmark-run.response.dto.ts |
| ExperimentsController | `POST /experiments` | createExperiment | create-experiment.request.dto.ts |
| ExperimentsController | `POST /experiments/:id/promote` | promoteCandidate | experiment.response.dto.ts |
| AuditController | `GET /audit/events` | listAuditEvents | list-audit-events.query.dto.ts |
| ArtifactsController | `POST /artifacts/uploads` | requestUpload | request-upload.request.dto.ts |
| SystemHealthController | `GET /health/live` y `GET /health/ready` | getSystemReadiness | system-readiness.response.dto.ts |

Para entidades con operaciones largas, devolver `202 Accepted` + job ID; soportar `Idempotency-Key` donde haya efectos repetibles por reintento; paginación determinista, límites, `Problem Details` (RFC 9457) y OpenAPI diff. Las rutas de salud deben revelar solo el mínimo permitido sin autenticación.

## H. Modelo de datos PostgreSQL y propiedad por módulo

No definir una tabla compartida gigante. Ubicar cada `schema.ts` Drizzle en `infrastructure/persistence/drizzle/` de su módulo; el migrador importa su registry y versiona SQL, nunca copia SQL schemas a `domain`.

| Bounded context | Tablas lógicas |
|---|---|
| identity | `users`, `external_identities`, `sessions`, `otp_challenges`, `mfa_devices`, `recovery_codes` |
| organizations | `organizations`, `organization_members`, `invitations` |
| authorization | `role_bindings`, `permission_overrides` (solo si RBAC estático no basta) |
| api-credentials | `api_keys`, `api_key_rotations` |
| model-catalog | `models`, `model_revisions`, `model_capabilities`, `model_licenses` |
| gpu-nodes | `gpu_nodes`, `gpu_devices`, `node_heartbeats` (si se requiere persistencia) |
| model-deployments | `deployments`, `deployment_revisions`, `deployment_events` |
| inference/request-routing | `runtime_pools`, `runtime_endpoints`, `routing_policies` |
| quotas | `quota_policies`, `budget_reservations` |
| usage-ledger | `usage_entries`, `token_price_assumptions` |
| playground | `playground_sessions`, `prompt_presets`, `prompt_revisions` (opt-in retención) |
| benchmarks | `benchmark_runs`, `benchmark_datasets`, `benchmark_metrics` |
| experiments | `experiments`, `experiment_candidates`, `experiment_decisions` |
| audit | `audit_events`, `audit_export_jobs` |
| artifacts | `artifacts`, `upload_sessions`, `artifact_scan_results` (opcional) |
| shared event reliability | `outbox_events`, `processed_events`, `dead_letter_jobs` cuando se requiera |

**Constraints:** FK + unique scopes (`organization_id`, alias, provider identity), índices según EXPLAIN real, tokens y hashes nunca expuestos, expiración/retención, auditoría con controles de alteración. Concurrencia OTP y presupuestos protegidos a nivel de DB/transacción, no exclusivamente en memoria Node.

## I. Gates de seguridad / DevSecOps / operación

### Seguridad por capa

- **Reverse proxy:** Caddy TLS, HTTPS obligatorio, security headers, rutas internas no expuestas, tamaño/cuerpo máximo, proxy streaming sin buffer indebido.
- **Identity:** Argon2id, OTP single-use, OAuth PKCE/state y validación de identidad, MFA/TOTP y recovery codes, cookies HttpOnly/Secure, CSRF apropiado, sesión revocable.
- **Authorization:** scope, organización, recurso, rol, capacidad, job ownership. Negar por defecto. Pruebas negativas cross-tenant.
- **API keys:** almacenar prefijo + hash, mostrar secreto una vez, permisos mínimos, caducidad/revocación/rotación y rate limits por key.
- **Inference:** controlar tamaño de prompt/outputs, tokens máximos, concurrencia, egress upstream, modelos permitidos, sanitización de logs; gestionar abortos/timeout/502/429/503.
- **Provisioning:** no Docker socket en API, no shell arbitrary, no importar rutas/volúmenes desde requests; aprobar perfiles y revisions.
- **Objetos RustFS:** bucket privado, presign temporal, verificación checksum, cuarentena/scan, expiración, no servir contenido activo inseguro bajo dominio principal.
- **Host:** firewall, SSH hardening, parches, credenciales separadas, auditd/journald, rootless cuando viable, GPU sin `privileged` genérico.
- **Supply chain:** pin lockfiles, build reproducible, SBOM Syft, Trivy/Grype/CodeQL/Gitleaks, imagen OCI por digest, Cosign antes de pull, provenance sin sobreafirmar SLSA.
- **Datos:** RPO/RTO explícitos, cifrado de backups, pgBackRest + WAL/PITR, copias fuera del host, restore drill aislado.

### Observabilidad

- Core: OTel spans con `traceparent`, logs JSON Pino redactados, métricas con labels de baja cardinalidad, DCGM cuando haya NVIDIA.
- Stack Compose opt-in operativo: OTel Collector, Prometheus, Loki, Tempo, Grafana, Alloy, Alertmanager, Blackbox.
- SLO medibles: tasa de éxito de inferencia, TTFT p95, errores 5xx, cola de admisión, discrepancias de cuotas, salud PostgreSQL/Valkey/GPU.
- Reglas alertas con `runbook_url`, `promtool check rules` + `promtool test rules` (casos positivos y negativos) + ensayo de entrega, inhibición y resolución.
- No registrar prompts, respuestas, cookies, OTP, emails, tokens, paths de documentos ni IDs personales en etiquetas de Prometheus.

### Calidad verificable

| Nivel | Runner/archivos | Gate |
|---|---|---|
| Lint | Biome en cada app | formato y reglas sin excepciones ciegas |
| Tipos | `tsc --noEmit` | TS strict sin `any` |
| Unit | Vitest | políticas, OTP, cuotas, routing, SSE parser |
| Integration | Vitest + PG/Valkey reales | transacciones, locks, constraints, jobs |
| BDD | Cucumber | aceptación de reglas con Application Services |
| API E2E | Playwright API | HTTP real, cookies, authz, SSE, errores |
| Web E2E | Playwright | journeys críticos, focus, keyboard, auth |
| Contratos | OpenAPI export+diff, browser DTOs | no breaking no aprobado |
| GPU | vLLM bench + carga reproducible | TTFT/TPOT/goodput/VRAM y baseline |
| SRE | promtool, alert delivery, restore drill | SLO y RPO/RTO evidenciados |
| Seguridad | Gitleaks, Trivy, CodeQL, ZAP, manual | SSRF/IDOR/CSRF/bruteforce/race tests |
| Supply chain | SBOM, Cosign verify fail-closed | el mismo digest staging→producción |

## J. Ejemplo completo de ownership de una solicitud

Flujo para `POST /v1/chat/completions`:

1. `inference/presentation/http/controllers/openai-compatible.controller.ts` valida request Zod y `ApiKeyGuard` + contexto de organización.
2. `api-credentials` valida API key hasheada, scopes y modelo autorizado; el gateway nunca delega auth al runtime.
3. `quotas` ejecuta `reserveInferenceBudget` atómico antes de reservar GPU.
4. `admission-control` adquiere ticket tenant/pool; `request-routing` elige runtime saludable.
5. `inference/application/services/create-chat-completion.service.ts` coordina usando el port `inference-runtime.port.ts`.
6. `inference/infrastructure/vllm/vllm-openai.adapter.ts` ejecuta HTTP interno a instancia vLLM; `sse-stream.writer.ts` devuelve chunks.
7. Al terminar/cancelar: cerrar upstream, liberar ticket, `settleBudget`/`refundBudget`, `recordInferenceUsage`, traza y auditoría sin prompt crudo.
8. Métricas etiquetadas por `model_family`, `status_class` y `runtime_pool` **acotados**, no IDs de usuario ni prompt.

## K. Roadmap por oleadas (sin carpetas zombie)

| Oleada | Entregable | Carpetas nuevas principales |
|---|---|---|
| 0 Foundation | repos, health, DB, valkey, app shell, Compose, CI | `bootstrap`, `database`, `system`, `app`, `deploy` |
| 1 Identity | contraseña + OTP + OAuth Google/Facebook + MFA, tenancy, RBAC | `identity`, `organizations`, `authorization`, `auth`, `security` |
| 2 First token | vLLM preconfigurado, API key, modelos, stream, playground | `inference`, `api-credentials`, `model-catalog`, `playground` |
| 3 Operations | uso, cuotas, métricas, alertas, backups, GPU view | `usage-ledger`, `quotas`, `gpu-nodes`, `observability` |
| 4 S+ | admission control, routing, benchmarking, experiments, A/B | `request-routing`, `admission-control`, `benchmarks`, `experiments` |
| 5 Enterprise optional | RustFS, uploads, multi-node, provisioner seguro, offline package | `artifacts`, agentes/provisioner, offline installer |

**Tarea de alta prioridad:** construir `Foundation + Identity + vLLM predefinido + una inferencia con streaming + una cuota atómica + tests cross-tenant + observabilidad básica` antes de dynamic orchestration.

## L. Documentación y skills de las entradas revisadas

Fuentes de referencia del ZIP, usadas como base de diseño:

- `review_skills/precision-skill-reading/SKILL.md` y `review_skills/vigilio-auto-senior/SKILL.md` (protocolo lectura y evidencia).
- `review_skills/platform-repository-workspace/SKILL.md` + `references/canonical-contract.md`.
- `review_skills/platform-compose-vps-delivery/SKILL.md` + `references/canonical-contract.md`.
- `review_skills/node-nest-build-feature/SKILL.md` + `references/feature-patterns.md`.
- `review_skills/node-nest-security/SKILL.md`, `node-nest-testing/SKILL.md`, `node-nest-persistence/SKILL.md`.
- `review_skills/web-mfe-build-feature/SKILL.md` + `references/feature-architecture.md`, `web-mfe-testing/SKILL.md`.
- `review_skills/platform-observability-sre/SKILL.md`, `software-supply-chain-security/SKILL.md`, `platform-resilience-disaster-recovery/SKILL.md`.
- `review_docs/platform/architecture/{repository-boundaries,workspace-strategy}.md`.
- `review_docs/platform/compose/cloud-neutral-vps-delivery.md`.
- `review_docs/stacks/backend/nestjs/http/semantic-dtos-and-pagination.md`.
- `review_docs/technology/versions.md` (baseline documentada 2026-11-01, NO garantía de lockfile).

Quedan pendientes antes de escribir código: instalar/inspeccionar repos consumidores reales y lockfiles; comprobar compatibilidad concreta NestJS/Preact/vLLM/NVIDIA del hardware de destino; pruebas reales CI/Compose/GPU; firmar ADR del provisioner dinámico. **Estado tests: NOT_RUN.** Esta entrega es arquitectura, no implementación.
