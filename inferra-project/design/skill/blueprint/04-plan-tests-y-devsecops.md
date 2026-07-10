# Plan de cobertura: unit, integración, API E2E, browser E2E, BDD y DevSecOps

## Principio de cobertura completa

- **Cobertura funcional objetivo: 100 % de las 163 operaciones inventariadas** vinculadas a controller, caso de uso, DTO, permisos, unit y contrato API E2E. La matriz CSV describe la prueba prevista; **no son 163 PASS ejecutados**.
- **Cobertura de navegación objetivo: 100 % de las 71 rutas** con `route-access.spec.ts` parametrizado (public/private/tenant/instance/403/404) y tests de journeys de alto riesgo. No convertir 71 rutas en 71 builds.
- **Coverage de código (umbrales propuestos de adopción):** backend 85 % statements/lines/functions y 80 % branches, baseline Vigilio; para auth, permission, quota, IDOR y streaming: aspirar a 95 % branches + tests negativos/concurrencia. El umbral no certifica seguridad ni elimina el threat model. Frontend 85/80 sobre lógica crítica, excluyendo vendor/generated justificadamente. Subir progresivamente según baseline medido, no bajar thresholds para aprobar.
- **Mutation testing:** incluir subset de OTP replay, quota reservation, RBAC y SSE parser. Objetivo de supervivientes críticos **0**; no afirmar cobertura sin ejecutarlo.
- **BDD:** escenarios de negocio por riesgo; no duplicar casos CRUD triviales en Gherkin. Si endpoint GET no participa en una regla de negocio, `bdd_tests` vacío justificado en matriz.
- **Data plane GPU:** suite simulada PR (siempre) y suite GPU real dedicada (nightly/release), métricas TTFT, TPOT, p95/p99, throughput, goodput, VRAM, errores y fairness.
- **Preflight E2E:** readiness real PG/Valkey/stub, fixtures deterministas, sin `sleep`, aislamiento tenant, clock inyectado, limpieza.

## Matriz de riesgos y capa propietaria

| Riesgo | Unit | Integración (real) | API E2E/contract | Browser E2E | BDD | Evidencia |
|---|---|---|---|---|---|---|
| DTO Zod y pagination | válido/inválido/límites | orden/filtro/count SQL | 400 y shape `{count,next,previous,results}` | formulario error/loading | No por CRUD simple | Vitest + Playwright |
| Login/password | hash + lockout + anti-enumeración | sesiones PG | 200/401/429/CSRF | login, redirect | auth/session-refresh-reuse | redacted JSON |
| Google/Facebook | state/nonce/PKCE, link policy | identidad única | callback spoof, replay, error provider | stub redirige/recupera | social-provider-linking | CI con proveedor fake, smoke real opt-in |
| Email OTP | expiración/attempts/hash single-use | consumo atómico paralelo PG | OTP viejo, replay, rate limit | solicitud/verify/reenvío | otp-single-use | resultado concurrente 1 success |
| MFA/step-up | política y recovery codes | códigos one-time PG | 401/403 paso sensible | enrollment y recovery | mfa-step-up | no códigos en logs |
| Multiempresa | ABAC/RBAC y último owner | SQL tenant-scoped/RLS si adoptado | IDOR cross-tenant 403/404 | org switching / cache purge | tenant-authorization | mismatch no filtra nombres |
| API key | scope, hash, expiry | rotation+reuse PG | Bearer wrong scope/revoke | once-only reveal | api-key-rotation | no plaintext persisted |
| Cuotas | reserva, settled/refund | atomicidad carreras PG | 429 vs 503 fail-closed | cuota restante | concurrency-budget | zero overspend |
| Inferencia SSE | parse chunks/abort | stub/upstream HTTP | OpenAI wire / stream [DONE] | streaming, abort/reconnect | stream-abort-settlement | trace abort upstream |
| Routing/fairness | selección healthy, weights | lease store, failover | fallback sin fuga org | políticas | fair-routing | per-tenant goodput |
| Deployments | transiciones/compatibilidad | job+outbox idempotente | comandos step-up 202/409 | rollback flow | deployment-transitions | logs + desired/observed |
| Benchmark | metodología y cálculo percentiles | persist runs/datasets | run/cancel/status/reports | progress+chart | reproducible-comparison | hardware/model digest |
| Artefactos RustFS | MIME/bytes/checksum/permissions | S3+ClamAV reales en perfil | upload→scan→download, SSRF | progress/error/scan | quarantine-before-download | objeto no público pre-scan |
| Backups/DR | guard admin+approval | pgBackRest + WAL | status/verify sin restore HTTP | revisión/readiness | backup-restore-drill | restore aislado RPO/RTO |
| Observabilidad | redacción/cardinalidad | OTel Collector/Loki/Tempo | traceparent y no PII | browser error | No (instrumentación) | promtool + dashboards |
| Webhooks | URL allowlist, firma y anti-SSRF | DNS rebind, retry | targets bloqueados y firma | canal/test | webhook-ssrf | no egress prohibido |

## Semántica de coverage

- `85 %` **no equivale** a “coverage completo” funcional. Cobertura se complementa con requisitos trazados, pruebas adversarias, propiedad SQL y fallos externos.
- Los cambios que añaden un endpoint o una ruta deben modificar manifiesto y matrices en el mismo PR (gate de cero huérfanos).
- Cuando una feature es futura, sus tests también tienen estado `NOT_RUN`. No usar `PASS` antes de ejecutar runner real.

## CI gate propuesto por repositorio

**inferra-impl:** `biome ci` → `tsc --noEmit` → Vitest unit + coverage → PostgreSQL/Valkey integration → Cucumber → Playwright API/security → OpenAPI export/diff → arquitectura/DTO browser-safe → SAST/SCA/secrets → build OCI+SBOM+signature.

**inferra-web:** `biome ci` → `tsc` → Vitest component/unit + coverage (MSW) → contrato browser-safe → Playwright (Chromium/Firefox/WebKit) → axe/teclado/visual revisado → bundle budget/CSP → OCI SBOM+firma.

**inferra-deploy:** YAML/Compose `config --quiet` por ambiente y perfil → conftest → promtool → Trivy → verifica firma digest → staging migración one-shot → smoke y rollback test.

**platform-ops:** ansible-lint/syntax-check → Molecule/host-compatibility → host hardening audit; no credenciales de producción en CI de apps.

**prod-local:** BDD/e2e integral con Compose real → escenarios fallos y recuperación → `operational-evidence.json` sin PII, tiempos RTO/RPO reales o `NOT_RUN`.

## Biome, TypeScript y pnpm

- `biome.json`: reglas de formato e imports ordenados, diagnóstico de complejidad, `noExplicitAny`, `noUnusedVariables`, no supresión general; overrides por generated cuando haya razón documentada.
- TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` si dependencias y tipos lo permiten; validar todos los datos externos con Zod.
- `pnpm-workspace.yaml` **en cada repo de aplicación**, `packages: []`, `engineStrict: true`, `verifyStoreIntegrity: true`, `strictDepBuilds: true`, `dangerouslyAllowAllBuilds: false`, `minimumReleaseAge: 1440`, `allowBuilds` explícito según lockfile, `--frozen-lockfile` CI.
- CI con CODEOWNERS, commits protegidos, revisión security para auth/RBAC/data-plane, dependencias y secreto scanning, SBOM Syft, Trivy, Cosign keyless OIDC, promoción mismo digest, rollback y aprobación humana.
- vLLM, GPU, RustFS, PostgreSQL y Valkey no deben escuchar puertos públicos; Caddy TLS y reverse proxy; ninguna API HTTP ejecuta shell o Docker socket.

## Gates de seguridad no negociables

1. `Auth`: Google OIDC valida issuer/audience/signature/state/nonce, Facebook Graph OAuth valida state/provider ID, OTP hash one-time TTL; linked identities por ID de proveedor y confirmación de usuario. Todos opcionales al instalar offline.
2. `Sessions`: Secure HttpOnly SameSite con rotación de refresh, reuse detection; CSRF en mutaciones cookie; sesiones revocables.
3. `Authorization`: checks tenant+recurso dentro del service y SQL, step-up para operaciones GPU, costos, secrets y backups; instance admins no equivalen org admins.
4. `Gateway`: antes de conectar vLLM verifica API key/scope, modelo, cuota atómica, lease de concurrencia y policy; abort/unwind ante desconexión; no registra prompts.
5. `Supply chain`: SBOM firmado, digests, licencias/revisiones de modelos, checksum de pesos, never unpickle remoto sin revisión y allowlist de repos/modelos.
6. `Uploads`: RustFS privado, cuarentena/scan, short-lived presign, quota/checksum/content-type y protección contra XSS al descargar; si el endpoint RustFS es privado, browser usa proxy Caddy de subida *con scope restringido* o carga por backend, no URL inaccesible.
7. `Observabilidad`: logs/traces métricas sin prompts/API keys/PII, métricas low-cardinality, dashboards con control de acceso, retención y backup.
8. `DR`: copias en host separado, WAL/PITR y drills; backup no equivale a volumen Docker.

## Estados de evidencia actuales

| Gate | Estado | Motivo |
|---|---|---|
| Lectura local de blueprints y skills prioritarias | PASS | Documentos existentes en `/mnt/data`, revisados para este diseño |
| Trazabilidad estática manifiesto→árbol→CSV | PASS tras ejecutar `scripts/validate_architecture.py` | Validador incluye 163 endpoints, 71 páginas y referencias existentes |
| Repos de aplicaciones/clases/runtime | NOT_RUN | No se generó software real |
| Biome + TypeScript | NOT_RUN | Sin package/lock reales ni src |
| Vitest unit/integration/coverage | NOT_RUN | Sin código ni DB/Valkey de prueba |
| Playwright API/Web/BDD | NOT_RUN | Sin app ejecutable |
| Compose real, GPU, vLLM, firma OCI | NOT_RUN | Sin despliegue ni hardware habilitado |
| Restore drill PostgreSQL/RustFS | NOT_RUN | Sin backup real ni infraestructura independiente |
