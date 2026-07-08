# Inferra S+ — Código fuente ampliado (rama de entrega)

## Estado de ingeniería

**Entrega parcial técnicamente ampliada, no certificada para producción.** Esta distribución proviene de `inferra-s-plus-source.zip` con cambios funcionales a NestJS, Preact y observabilidad; se conservaron las fronteras de cinco repositorios para `compose-vps`. No se creó un proyecto nuevo de cero.

### Inventario actual

- **Backend:** 24 módulos (`alerts, api-credentials, artifacts, audit, benchmarks, cost-estimates, datasets, experiments, gpu-nodes, identity, inference, instance-admin, model-catalog, model-deployments, model-imports, notifications, observability-queries, organizations, playground, quotas, request-routing, system, usage-ledger, webhooks`), 28 controllers, aproximadamente 116 métodos HTTP declarados (no todos constituyen funcionalidades totalmente verificadas).
- **Frontend:** 72 rutas registradas, 0 vistas `PlannedPage`. Algunas vistas avanzadas muestran límites explícitos donde no existe operación operativa real.
- **Tests incluidos:** {"backend_unit": 15, "backend_integration": 2, "backend_api_e2e": 4, "backend_bdd_features": 3, "frontend_unit": 3, "frontend_browser_e2e": 2}. Coverage real NO MEDIDO.
- **Deployment:** un `inferra-deploy/compose/compose.yaml`, Caddy, PostgreSQL, Valkey, vLLM GPU opt-in, Grafana/Prometheus/Loki/Tempo/OTel, Alloy, DCGM y RustFS opcionales; no AWS, Kubernetes ni Terraform.

## Funcionalidades ampliadas en esta entrega

1. **Identidad:** registro/email-OTP público corregido; sesiones con rotación/familia y detección de reutilización; cierre global; step-up de contraseña y TOTP para claves API; OAuth Google y Facebook con verificación de email por OTP para nuevas cuentas Facebook; MFA y account linking con límites.
2. **Gestión:** invitaciones, roles globales de instancia separados de permisos de organización, datasets vinculados a artefactos, experimentos sobre benchmarks del propio tenant, importación de modelos como trabajo de revisión manual, administración de modelos/versiones, cambios seguros de parámetros de despliegue.
3. **Serving:** chat SSE; `/v1/completions`; `/v1/embeddings` condicionado al runtime/modelo; API keys; cuotas y admisión por modelo; errores genéricos ante upstream, backpressure y cancelación; consumo conciliado.
4. **Observabilidad:** lecturas de DCGM, histogramas de latencia y errores, resumen de costos estimados on-prem, preferencias de notificaciones, alertas y múltiples paneles UI conectados.
5. **Benchmarks:** streaming con TTFT p50/p95, TPOT p95, latencia p50/p95/p99, throughput, VRAM pico opcional y fallos explícitos; resultados nunca inventados.
6. **Webhooks:** HTTPS allowlist, DNS IPv4 público, TLS/host pinning, secreto AES-GCM, HMAC de eventos, outbox y reintentos, evento `model.registered` atómico con persistencia de modelo.
7. **DevSecOps:** un workflow raíz adicional para distribución de código, políticas de lockfiles frozen, hardening de Compose, script de verificación de imágenes firmadas, test declarativo de alertas, Alloy privado, preflight y procedimiento de upgrade bajo autorización.

## Instalación (en host Linux confiable)

1. Genera y **revisa** ambos `pnpm-lock.yaml` con `scripts/generate-reviewed-lockfiles.sh`, usando Node.js 24 y pnpm 10 en una máquina con acceso autorizado al registro npm. **No están incluidos** porque en el entorno de generación `registry.npmjs.org` respondió `EAI_AGAIN`; jamás se fabricaron resoluciones de dependencias.
2. Configura `inferra-deploy/.env` a partir de `.env.example`, `chmod 600`; genera secretos aleatorios; configura SMTP privado o corporativo y, opcionalmente, OAuth Google/Facebook.
3. Revisa la documentación de despliegue, las imágenes, el modelo y licencia; para GPU prepara drivers, NVIDIA Container Toolkit y revisa VRAM.
4. **Desarrollo/laboratorio:** `inferra-deploy/scripts/prepare-bootstrap.sh` y `inferra-deploy/scripts/install.sh` (requiere Docker Engine+Compose, dependencias resolubles y Dockerfiles con lockfiles reales).
5. **Producción:** no usar hasta superar `inferra-deploy/docs/production-release-gates.md`; imagen firmada por digest, backup PITR externo y restore drill, pruebas de autenticación, E2E, GPU y observabilidad/alertas con receptor real.

## Restricciones conocidas y no fingidas

- Dependencias npm no instaladas, `pnpm-lock.yaml` faltantes. El build Docker queda bloqueado deliberadamente por `--frozen-lockfile` hasta generar los locks verdaderos.
- Sin Docker Engine ni hardware NVIDIA ni SMTP/OAuth externos en este entorno: no se ejecutaron builds, contenedores, migraciones PostgreSQL, Vitest, Playwright, Cucumber, benchmarks GPU ni recuperación de backups.
- Los endpoints/pantallas del blueprint inicial exceden las operaciones funcionales reales: no se han terminado las 163 operaciones ni se ha realizado un pentest externo.
- pg_dump+restic existe como backup de base, pero **pgBackRest PITR y restauración aislada automatizada semanal no están implementados/probados**. Alertmanager por defecto no entrega alertas fuera del servicio, requiere un receptor real.
- El flujo de despliegue GPU administra perfiles aprobados; no se permite acceso del navegador/backend al socket Docker. La importación de pesos solicitada se pone bajo revisión del operador y no descarga pesos arbitrarios.
- Tres vistas específicas conservan información de «no disponible» en lugar de ofrecer acciones falsas: apps/inferra-web/src/features/deployments/pages/deployment-logs.page.tsx, apps/inferra-web/src/features/artifacts/pages/artifact-detail.page.tsx, apps/inferra-web/src/features/api-keys/pages/api-key-details.page.tsx.
- No se declara 100 % de cobertura, 100 % de funciones ni certificación de producción.

## Evidencias

`AUDIT_REPORT.md` registra la auditoría efectuada y los controles pendientes. `DELIVERY_MANIFEST.json` contiene rutas y SHA-256 del código fuente. Para comparar con la visión completa consulta `design/skill/` y el blueprint.
