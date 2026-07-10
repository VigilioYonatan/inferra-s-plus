# 11 — Roadmap, milestones, DoD y criterios de aceptación

## Regla de orden

No crear 1.632 stubs vacíos. Implementar *vertical slices* completas y testeadas: pantalla ↔ controller ↔ service ↔ domain ↔ adapter ↔ DB/runtime ↔ observabilidad ↔ tests. Cada fase construye un artefacto instalable/medible, sin dar por activo lo que solo está en manifiesto. El roadmap refleja fases del blueprint `M1`, `M2`, `M3`, `S+`; la secuencia operativa prioriza primero setup seguro + login y después LLM real.

### F0 — Foundations y decisiones

- [ ] Repos Git 5 + coord root, owners, CODEOWNERS, branch protection, README/AGENTS.
- [ ] Lockfiles Node/Preact/Nest/Drizzle/Valkey/Biome, dependency compatibility y docs version owner.
- [ ] Compose único, Caddy, PG, Valkey, salud, config validated, secrets, scripts preflight, local lab.
- [ ] ADR topología, control/data plane, identity, objeto y backup; threat model inicial.
- [ ] Unit+integration/contract/E2E scaffold real con al menos una spec fallando al romper behavior (no runner vacío).
- **Criterio salida:** instalación demo core sin GPU con healthchecks y un login bootstrap seguro (no password default); `compose config` local/staging/prod y smoke reales.

### M1 — Identity, org y shell web

- [ ] Register policy (privado por defecto), password/forgot/reset, email verify, OTP challenge + verify, Google OIDC, Facebook OAuth (si configurados), TOTP/recovery.
- [ ] Session revocation/CSRF, login risk/rate limits, organization create/invite/roles/members, último owner y object policy.
- [ ] UI login/register, OTP, account security/sessions/connections, onboarding, dashboard shell, global states.
- [ ] Environments Mailpit/OAuth stub, BDD OTP replay, authz cross-tenant, browser e2e, audit.
- **Criterio salida:** create account → login → MFA → org → invite → logout; negativos OAuth/OTP/IDOR verdes; sin exposición de secretos.

### M2 — Primer inference serving de extremo a extremo

- [ ] Model catalog/manifest/licensing, runtime profiles allowlisted, vLLM preflight y primer modelo GPU healthy.
- [ ] API keys scope/reveal once/rotate/revoke, OpenAI chat/completions JSON+SSE, streaming abort y upstream policy.
- [ ] Admission control baseline, atomic quotas/reservation, usage ledger idempotente, Playground web y usage panels.
- [ ] GPU metrics and TTFT, dashboards; end-to-end SDK → Nest gateway → vLLM.
- **Criterio salida:** autorización por modelo+org, primera generación real, 429/503 razonados, cancelación y usage consistency, tests GPU smoke separados.

### M3 — Operación, imports y resiliencia

- [ ] Model imports allowlisted/revision/digest, deployment actions/rollback definidos, GPU management, job status, notifications.
- [ ] OTel/Pino/DCGM, Prometheus/Grafana/Loki/Tempo, SLO+burn-rate rules, Promtool, alert receiver test.
- [ ] Secure backup pgBackRest PITR external, WAL, restore drill con RPO/RTO real, offline install, upgrade rollback.
- [ ] RustFS+ClamAV solo si datasets/artifacts están activados; webhooks firma/anti-SSRF.
- [ ] Security DAST, signed digest OCI, SBOM, staging→prod same digest, incident runbooks.
- **Criterio salida:** instalación end-user reproducible, perfil prod sin ports internos, restore drill y alert routing probados.

### S+ — Optimización medible

- [ ] Routing weighted/healthy/fallback scoped, tenant fairness, budgets por carga, scheduler y leases probados.
- [ ] Benchmark Lab: dataset/version/licencia, TTFT/TPOT/goodput/VRAM y calidad de resultado.
- [ ] Experimentos A/B y promoción/rollback con thresholds, repeatability y reportes exportables.
- [ ] Multi-GPU/profile tuning si hardware y modelo compatible; escenario capacidad 100/1000 clientes con supuestos.
- [ ] Benchmarks baseline vs candidato con misma GPU/digest/carga, intervalos y tradeoffs.
- **Criterio salida:** mejora reproducible bajo carga definida y prueba de no regresión en seguridad/calidad; no exigir mejora universal en todos los modelos.

## Definition of Done por feature

| Capa | Condición necesaria |
|---|---|
| Producto | Actor, flujo, errores, owner, visibilidad y criterio aceptación definidos |
| Dominio | Invariantes, policy y concurrencia descritas y testeadas |
| API | DTO Zod, query/params/body, success/error statuses, OpenAPI, operationId estable |
| Auth | Guard + tenant/resource/scope + tests cross-tenant/no credential |
| Datos | Migración, rollback strategy, transacción, índices/explain según riesgo |
| Async | Outbox+idempotency+retry/DLQ cuando aplica, shutdown estable |
| UI | carga, vacío, errores, conflict, 403, accesibilidad, responsive |
| Observabilidad | logs redactados + traces/metrics con labels safe y runbook si nuevo fallo |
| Testing | unit/integration/E2E/BDD según matriz; coverage real; no flaky/runner vacío |
| Platform | Compose profile/preflight/rollback y secrets si la feature lo afecta |
| Quality | Biome/typecheck/contract diff/security scan green si ejecutado |
| Evidencia | links reports, comandos, hashes, reviewer independiente, estados veraces |

## No-Go automáticos de release

- OAuth/OTP callback vulnerable, IDOR, API key de tenant cruzado, shell/docker socket accesible desde API, vLLM públicamente expuesto, secreto en frontend/logs, cuota ilimitada ante falla, imagen sin firma verificada, cambios irreversibles sin backup, migración no compatible, OpenAPI breaking sin aprobación, restore crítico no probado o alert routing roto.

## Monitoreo de cobertura por fase

El manifesto contiene rutas planificadas por fase; **no** se aprueban automáticamente todas las fases porque sus entradas existan en CSV. El contador de rutas implementadas sale de OpenAPI/route registry real, reconciliado con el manifiesto. Un MVP válido puede tener solo 38 operaciones M1 si todas sus reglas son verificables; el resto permanece planificado.
