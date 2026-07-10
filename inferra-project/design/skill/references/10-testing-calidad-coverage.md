# 10 — Testing completo: Unit, Integration, BDD, API/Web E2E, GPU y DevSecOps

## Principio de trazabilidad

Las 163 operaciones y 71 páginas ya están en el inventario de diseño con rutas unit/integración/API E2E y unit/browser/journey respectivamente. **Las filas describen pruebas futuras, no los resultados.** Cada PR debe fallar si se agrega una ruta sin owner, DTO, permiso, especificación y test pertinente. No crear 1.632 archivos vacíos: escribir tests y código por feature real, actualizar manifiesto después.

### Pirámide (ajustada a riesgo)

| Nivel | Runner propuesto | Qué demuestra | Ejemplos críticos |
|---|---|---|---|
| Unit | Vitest | invariantes puras y services con fake ports | OTP expiración, role escalation, quotas reservation, routing weights, SSE parser |
| Integration | Vitest + PG/Valkey/RustFS reales | constraints, SQL scope, locks, outbox/idempotencia | 2 verify OTP concurrentes, settle ledger twice, `FOR UPDATE SKIP LOCKED` |
| Contract | schema+OpenAPI diff + consumer tests | request/response/error/SSE wire, DTO browser-safe | versionado, OAS 3.1 real, OpenAI compatibility, pagination `{count,next,previous,results}` |
| API E2E | Playwright API/Nest real | auth, status, tenant, job, SSE | `POST /auth/...`, GET cross-tenant, 401/403/409/429/503 |
| Browser E2E | Playwright Chromium/Firefox/WebKit | navegación, formularios, streaming, permisos, dispositivos | login OTP/social stub, creación de key once-only, abort, deployment wizard |
| BDD | Cucumber/Gherkin | reglas críticas de negocio con escenario legible | último owner, single-use OTP, quota race, benchmark promote/rollback |
| Security | ZAP + pruebas adversarias automatizadas | IDOR/BOLA, CSRF, SSRF, headers, secrets, dependencies | malformed headers, OAuth callback, object download quarantine |
| Load | k6, vLLM bench u otras herramientas verificadas | latency, throughput, goodput, p95 y overload | 1/10/100/1000 clientes condicionados a hardware, no prometer capacidad fija |
| Chaos/DR | prod-local, fault injection, pgBackRest restore | servicio degradado, recuperación, rollback | kill vLLM/worker, PG crash, missing WAL, signed image rejected |
| UX/a11y | axe, teclado manual, reader manual, visual diff | interfaces funcionales y accesibles | focus/dialog, zoom/reflow, dark mode, feedback de errores |

## Cobertura y gates

- **Cobertura funcional target:** 100 % de rutas/operaciones implementadas vinculadas a tests de contrato/permiso; 100 % de casos de uso críticos tienen éxitos, errores y negativos. No equivale a test de línea.
- **Baseline de código sugerido:** backend y lógica frontend `lines/statements/functions >=85 %`, `branches >=80 %`. Cambios de auth, MFA, quota, permission, tenancy, SSE parser/ledger aspiran `branches >=95 %` con pruebas adversarias, pero no declarar cumplimiento hasta medir cobertura en Vitest; excluir generated y fixtures justificados.
- **Mutation:** subset crítico de OTP replay/quotas/permissions/SSE con *0 mutantes supervivientes de riesgo alto*; thresholds se aprueban con evidencia.
- **Tests deterministas:** fake clock, random seed, unique test tenants, isolate DB, fake OAuth server, Mailpit, stub vLLM con SSE fragmentada, no `sleep` arbitrarios, fixtures sin PII real.
- **Cero tests descubiertos** en suite obligatoria = FAIL/BLOCKED, jamás PASS por runner vacío. Flaky test requiere owner/ticket, no omitir permanentemente.

## Matriz detallada de seguridad y fallos

| Feature | Unit | Integration | API E2E | Browser | BDD | Release gate |
|---|---|---|---|---|---|---|
| Register/password | password strength/hash/anti-enumeración | unique email, session PG | 200/400/401/429 + CSRF | form, email pending/error | registro verificado | SMTP real smoke opt-in |
| Google/Facebook | state/nonce/PKCE, provider sub link policy | unique subject, replay | callback spoof/provider unavailable | OAuth fake redirect → callback | social linking | externo real smoke si habilitado |
| OTP/MFA | TTL, attempts, backup code single-use | 2 concurrent consumes exactly 1 success | old/replay/429/expired | OTP resend/focus/error | otp-single-use.feature | audit trail sin secretos |
| Org/RBAC | último owner, roles y object policy | SQL tenant scope | IDOR 403/404 no leak | org switch/cache purge | cross-tenant.feature | authz matrix |
| API keys | scope/hash/once-only rotate | revocation and uniqueness | Bearer scope, revoked/expired | create/reveal/copy | rotation/step-up | logs scrub |
| Inference | SSE parser, abort, settlement | lease/usage PG+Valkey + stub | JSON/SSE `[DONE]`, 429/503/abort | stream/stop/error | stream-abort-settlement.feature | GPU smoke if GPU profile |
| GPU/deploy | state machine, profile preflight | job/outbox idempotent | role, 202/409, no arbitrary cmd | wizard/live/rollback | transitions.feature | host preflight |
| Benchmarks | percentile/throughput/quality | run/dataset revision | start/cancel/result | chart/progress/export | reproducibility.feature | dedicated GPU run |
| Artifacts | mime/hash/scope/quarantine | S3+AV | presign/scan/download/SSRF | upload/progress | quarantine.feature | no public bucket |
| Backups | step-up admin authorization | pgBackRest/WAL | status only; no arbitrary restore | audit/status | restore-drill.feature | external restore actual |
| Observability | logs scrub, label cardinality | collector/promtool | traceparent propagation | degraded ops feedback | no business BDD | alerts delivery test |
| Webhooks | HMAC/timestamp/URL policy | retries, poison/DNS rebinding | SSRF/anti-replay/revocation | config/test route | webhook-ssrf.feature | egress restrictions |

## Ejemplos BDD ejecutables a desarrollar

```gherkin
Feature: OTP de correo se consume una sola vez
  Scenario: Dos verificaciones concurrentes del mismo challenge
    Given existe un challenge OTP sin utilizar de la cuenta "ana@example.test"
    When se verifican simultáneamente dos solicitudes con el mismo código
    Then exactamente una solicitud crea una sesión válida
    And el challenge queda consumido en PostgreSQL
    And el código no aparece en logs ni eventos

Feature: Aislamiento entre organizaciones
  Scenario: Una API key no accede al modelo ajeno
    Given la empresa A tiene una API key con permiso de inferencia
    And la empresa B tiene un modelo privado desplegado
    When la empresa A solicita el modelo privado de B
    Then la solicitud es denegada sin filtrar metadatos
    And no se reserva cuota ni se llama a vLLM

Feature: Streaming abort y conciliación de cuota
  Scenario: Un cliente cancela una respuesta a mitad de generación
    Given una inferencia autorizada con reserva de tokens
    When el cliente cierra la conexión SSE después de dos fragmentos
    Then se cancela la solicitud upstream
    And se libera el lease de GPU
    And el ledger concilia el consumo real una sola vez
```

No usar strings reales/PII ni usuarios de producción en fixtures. Steps llaman capas reales; no hacer BDD exclusivamente a mocks que siempre devuelven success.

## Ejecución de CI por fases

1. PR backend: Biome → TypeScript strict → Vitest unit+coverage → PG/Valkey integration → Cucumber → Playwright API+security → OpenAPI diff → dependency/SAST/secrets → OCI candidate.
2. PR frontend: Biome → TypeScript → Vitest components MSW+coverage → generated-contract check → Playwright (3 browsers) → axe/keyboard/visual → bundle budget → OCI candidate.
3. Deploy: shell/YAML/Compose config de perfiles → conftest → promtool rules (positive/negative) → image CVE/signature verification → lab install smoke.
4. Release: GPU compat & serving benchmark con hardware reservado → restore drill aislado → staging upgrade → signed same-digest promotion → production smoke + rollback plan.

**Evidencia por suite:** comando exacto, versión/digest, exit code, tests descubiertos/pasados/fallidos, coverage JSON, trace/playwright JUnit, datasets, environment, fecha y owner. Si no hay hardware GPU/SMTP social real/host DR, reportar `NOT_RUN` o `BLOCKED` según razón.
