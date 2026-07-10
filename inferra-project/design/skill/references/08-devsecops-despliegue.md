# 08 — DevSecOps desde PR hasta producción self-hosted

## Target operativo

Distribución instalable desde `inferra-deploy` con **un único** `compose/compose.yaml` parametrizable por perfiles (`core`, `gpu`, `cpu-demo`, `observability`, `artifacts`, `tools`, `benchmark` según Compose real). CI genera imágenes firmadas de `inferra-impl` e `inferra-web`; usuario final **no necesita Node ni clonar repo backend/frontend**. `platform-ops` da soporte Ansible opcional del host, con roles genéricos reutilizables. `prod-local` ejercita **ese mismo Compose** en laboratorio real.

## Estructura mínima de deploy

```text
inferra-deploy/
├── compose/compose.yaml               # única definición staging/production/lab
├── compose/Caddyfile                  # TLS/edge/gateway SSE/web
├── install.sh                         # preflight+secrets+bootstrap+verify
├── upgrade.sh                         # manifest de release + backup + migration + smoke
├── rollback.sh                        # imágenes previas + compatibilidad DB
├── verify.sh                          # readiness, permisos, GPU, API, TLS
├── status.sh                          # health/redacción/snapshot
├── release-manifest.yaml              # digests OCI + constraints
├── provisioning/                     # comprobar GPU, recursos, dominio, certificado, perfiles
├── observability/                    # promtool, dashboards, alertas, OTel, Alloy
├── backup/                           # pgBackRest PITR, objetos/secrets, restore drill
├── policies/                         # OPA/Conftest, no secrets, exposición, security
├── tests/                            # Compose static/smoke/security/recovery
└── docs/                             # install, offline, upgrade, DR, FAQ, troubleshooting
```

## Instalador senior, idempotente y seguro

1. Detecta Linux/kernel/arquitectura, Docker Engine+Compose plugin con versiones conocidas, espacio/permiso/FS, DNS, ports 80/443, disponibilidad SMTP/OAuth opt-in, acelerador NVIDIA/driver/runtime GPU/CUDA si perfil GPU; no presume soporte de GPU por detectar `nvidia-smi` únicamente.
2. Valida release manifest (imágenes por `@sha256:...`), firmas Cosign y SBOM/atestation según flujo. En modo air-gapped, paquete local con firmas y claves/verificación offline configurada; no ofrecer falso keyless online sin red.
3. Inicializa carpetas de datos fuera del source checkout, propietario/permisos restrictivos, claves generadas con RNG fuerte, config validada por schema y secreto fuera de Git; `bootstrap token` de un uso para primer owner.
4. Valida Compose con `docker compose ... config --quiet` por ambiente/perfil; no confiar en un único `config` con defaults. Comprueba que secretos no terminan en `docker inspect`/logs/config renderizado cuando estrategia los evita.
5. Configura Caddy HTTPS y backend/observability private, aplica migrations **one-shot**, levanta healthchecked servicios, verifica HTTP readiness y endpoint autenticado de prueba, captura evidencias.
6. Revierte configuración si bootstrap falla sin borrar volúmenes productivos ni credenciales; presenta diagnósticos seguros.
7. `upgrade` hace preflight, compatibilidad schema expand-contract, snapshot/PITR, pull digest verificado, migrate job, rollout controlado, smoke y rollback de imagen si falla. Rollback de esquema DB destructivo no se promete automático.

## Compose hardening y redes

- Sólo Caddy escucha 80/443 públicos, con TLS y security headers; admin/metrics restringidos adicionalmente por auth/red privada.
- Redes: `edge` (proxy/web/API), `backend` (API/PG/Valkey/vLLM/RustFS), `observability` (Collector/Prometheus/Grafana/Loki/Tempo/Alloy); segmentar acceso según necesidad.
- Defaults en contenedores propios: `read_only:true`, UID/GID non-root, `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, `tmpfs` noexec/nosuid, pids/mem/CPU limits, healthchecks, log rotation, seccomp/AppArmor donde compatible; excepciones GPU/DB/metrics justificadas y probadas. No aplicar `read_only` ciegamente a PostgreSQL que necesita volumen write.
- Ningún `docker.sock` montado en NestJS API. Provisioning del host se hace vía agente aislado con interfaces allowlisted, tokens cortos, identidad de host, permisos mínimos y auditoría, o mediante intervención operator CLI.
- Una imagen backend Distroless glibc non-root para los entrypoints `api`, `worker`, `outbox`, `migrate`, `platform-setup`; front imagen runtime solo `dist/`, sin NPM_TOKEN en capas. vLLM requiere imagen/driver/GPU específicos y excepciones documentadas.
- CSP/COOP/Referrer-Policy/HSTS tras preflight, cookies Secure/HttpOnly/SameSite y SSE buffering disabled donde aplique; no inyectar secretos OAuth al build frontend.

## CI/CD separados por repo (branch protegida)

| Repo | Gates PR | Release / Producción |
|---|---|---|
| `inferra-impl` | `pnpm biome ci`, `pnpm typecheck`, unit coverage, PG+Valkey integration, Cucumber BDD, Playwright API/security, OpenAPI diff, secret/SAST/SCA | BuildKit, SBOM, scanner CVE, firma OCI, image digest y provenance con evidencia real |
| `inferra-web` | Biome, typecheck, Vitest unit/components, browser-safe contracts, Playwright Chromium/Firefox/WebKit, accessibility, visual, bundle budget, CSP | Build estático sin secretos, misma firma/digest, smoke frontend |
| `inferra-deploy` | shellcheck/shfmt, YAML lint, Compose config por perfiles, Conftest, promtool check/test rules, docs links, Trivy, negative fixture sin firma | verificar Cosign antes pull, staged install/upgrade/rollback, smoke |
| `platform-ops` | ansible-lint, syntax check, Molecule/VM matrix, host policies y permisos | aprobación para hosts, audit trail, no secretos persistidos en Git |
| `prod-local` | orquestación E2E Compose real, fault injection, cross-tenant, restore ensayado | smoke de release, RPO/RTO, decisión go/no-go |

**PnPM hardening Vigilio:** `pnpm-workspace.yaml` con `packages: []` por repo Node, `engineStrict:true`, `preferFrozenLockfile:true`, `verifyStoreIntegrity:true`, `strictDepBuilds:true`, `dangerouslyAllowAllBuilds:false`, `minimumReleaseAge:1440`, `allowBuilds` explícito tras revisar scripts. En CI `--frozen-lockfile`, imágenes base y GitHub Actions pinneadas por digest/commit SHA completo, permisos workflow mínimos, CODEOWNERS/security review requerida.

**Biome:** una configuración por aplicación Node, no ESLint/Prettier paralelos. Exigir import sorting/format/lint, no `any` injustificado, no variables muertas, supresiones justificadas y **typecheck TS separado** (`strict` y `noUncheckedIndexedAccess`; evaluar `exactOptionalPropertyTypes` según compatibilidad). Biome no detecta vulnerabilidades por sí mismo.

**Supply chain:** Syft SBOM SPDX/CycloneDX; Trivy/Grype HIGH/CRITICAL con gestión explícita OpenVEX con vencimiento para false positives; Cosign keyless por OIDC cuando online y trusted, verificación antes de pull; promoción del **mismo digest** staging→production. No declarar SLSA L2/L3 salvo builder/provenance/host admission verificables.

## Ambientes y controles

- `dev`: fuentes y tests rápidos; servicios en Compose aislado.
- `prod-local`: mismo Compose, DNS fake, SMTP Mailpit, OAuth stub controlado, vLLM stub/real GPU según host, datos sintéticos; pruebas de upgrade y restore.
- `staging`: producto empaquetado como producción, dominio propio, sin datos personales productivos; smoke, snapshots y promociones firmadas.
- `production`: host endurecido, TLS real, copias externas, alert receiver activo, runbooks y on-call, capacidad y GPU verificada; cambios audibles con approvals.
- `offline`: paquete OCI firmado, secretos locales, sin Google/Facebook, SMTP local/configurable; estado deshabilitado visible. Si falta GPU, CPU demo limitado sin benchmark S+.

## Hardening del host

SSH por claves, firewall puertos mínimos, actualizaciones de seguridad, auditd/fail2ban según amenaza, hora/NTP, cuentas de servicio, restricciones sudo, permisos Docker, fs/volúmenes cifrados si aplica, vigilancia disco/temperatura/GPU, procesos de backup aislados, red de egress con allowlists para model imports/webhooks. Docker group concede privilegios altos; nunca incluir usuarios API/web allí.

## Gate para marcar producción

TLS y DNS reales; sin puertos internos expuestos; imágenes firmadas/verificadas; backups **externos** y restore drill exitoso; alertas realmente entregadas; incident runbooks y owner; permisos de org validados E2E; GPUs/preflight; smoke y rollback; pruebas de versión actual. Si no se verifican, estado `NOT_RUN` o `BLOCKED`, no "Production Ready".
