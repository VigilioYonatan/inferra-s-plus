# Auditoría final de Inferra S+ v2 — 2026-11-09T06:30:59.924977+00:00

**Dictamen: PARCIAL / NO CERTIFICABLE EN PRODUCCIÓN.** No confundir estructura estática con comportamiento certificado.

## Fuente y objetivo

- Fuente: `inferra-s-plus-source.zip`; skills y docs Vigilio de la conversación; objetivo Compose self-hosted, sin AWS/K8s/Terraform.
- Proyecto ampliado en copia, sin modificar los ZIP de origen.
- Paquete: `inferra-s-plus-upgraded.zip`, sujeto a verificación de CRC, extracción y hash en el paso de publicación.

## Inventario

- Módulos backend: 24.
- Controllers: 28.
- Decoradores de método HTTP en controllers: 116.
- Rutas frontend: 72.
- Referencias `PlannedPage`: 0.
- Otras vistas de alcance explícitamente limitado: 3.
- Tests agregados: {"backend_unit": 15, "backend_integration": 2, "backend_api_e2e": 4, "backend_bdd_features": 3, "frontend_unit": 3, "frontend_browser_e2e": 2}.

## Controles observados

- `node /mnt/data/check_inferra_v2.cjs`: parsing TS/TSX e imports relativos de 255 archivos antes de cierre: **PASS**. No equivale a typecheck.
- `bash -n inferra-deploy/scripts/*.sh`: **PASS**.
- `yaml.safe_load` en workflows, Compose y configuraciones YAML: **PASS** (sintaxis YAML, no semántica Docker/Prometheus).
- ZIP: comprobación completa después de empaquetar registrada por script de entrega.
- `tsc -p tsconfig.build.json --noEmit`: **BLOCKED** al no existir paquetes ni `@types/node`; no se informa como PASS.
- npm registry: **EAI_AGAIN** (no se pueden instalar o resolver dependencias ni generar locks).
- Docker y NVIDIA runtime: **UNAVAILABLE**; Compose config/runtime **NOT_RUN**.
- Biome, Vitest+coverage, Playwright API/UI, Cucumber BDD, pipeline CI, promtool rule tests y pruebas de hardware: **NOT_RUN**.

## P0/P1 conocidos de la distribución (bloqueos reales)

1. Sin `apps/inferra-impl/pnpm-lock.yaml` ni `apps/inferra-web/pnpm-lock.yaml`, construcciones frozen no pasan. Generación en estación conectada + revisión de auditoría requerida.
2. No existe evidencia de build/typecheck real, integridad de migraciones aplicadas, pruebas de database concurrency ni coverage.
3. No se cerraron todos los requerimientos del blueprint (163 endpoints originalmente planeados) ni las vistas avanzadas de estado no disponible.
4. Integración OAuth Google/Facebook, SMTP, GPU/vLLM y RustFS sobre host real sin validar.
5. PgBackRest PITR, restore drill completo, alert receiver real, signing con digest reales y reglas promtool ejecutadas faltan.
6. Pruebas autenticadas entre 2 tenants diferentes, abuso y sesiones, soak/load/chaos, hardware concurrency y pruebas accesibilidad WCAG 2.2 AA sin demostrar.
7. `platform-ops` no ofrece aún un playbook Ansible de host hardening; hay un script de inspección, no equivalencia probada.

## Regla de promoción

Prohibido anunciar 100 % o instalar con datos reales antes de comprobar migraciones, 2-tenant IDOR, OTP replay, session family rotation, SSE abort, quotas race, restore drill, firma OCI y receptor real de alertas. Revisar `inferra-deploy/docs/production-release-gates.md`.
