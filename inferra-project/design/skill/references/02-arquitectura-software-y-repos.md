# 02 — Arquitectura de software, repositorios y módulos

## Contexto C4 textual

```text
Browser (Preact) / SDKs / Integraciones
              |
       HTTPS / Caddy edge
          /             \
   /api/v1 (web)     /v1 (SDK keys)
          \             /
           NestJS Control Plane
 auth/tenancy + use cases + policies + quotas
     |       |       |          \
 PostgreSQL Valkey  Workers       Inference Runtime Port
     |       |       |                    |
  outbox    leases   jobs      Runtime Router / Circuit Breaker
                                            |
                                     vLLM (GPU privada)

 RustFS S3 compatible (solo al activar artifacts/datasets)
 OTel/Prometheus/Loki/Tempo/Grafana transversal
```

**Frontera:** sólo Caddy expone 80/443; `api`, DB, Valkey, RustFS, dashboards y vLLM viven en redes privadas; endpoints administrativos restringidos además por roles/step-up. El tráfico de inferencia pasa por gateway para cuota/autorización, no por el frontend directamente a vLLM.

## Cinco repos de nivel 1 Vigilio

```text
inferra-workspace/                         # Coordinación local sin package.json ni lockfile
├── apps/inferra-impl/                     # NestJS + Drizzle + jobs + API docs + tests propios
├── apps/inferra-web/                      # Preact + Vite, frontend de administración
├── inferra-deploy/                        # compose/compose.yaml único, Caddy, dashboards, instalador
├── platform-ops/                          # Ansible host-neutral, hardening Linux y driver/GPU preflight
├── prod-local/                            # pruebas Compose reales, fault injection, restores aislados
├── workspace.yaml                         # mapa de SHAs/repos, NO package manager
└── versions.yaml                          # herramientas/CLI con checksum cuando corresponda
```

Cinco repositorios Git independientes con `CODEOWNERS`, lockfiles solo en repos Node, CI/release independientes. El directorio local coordinador puede usar submódulos documentados o clonado script, nunca `.git` anidados huérfanos. No crear `contracts/` genérico manual para DTOs; contrato HTTP lo posee la feature NestJS y es entregado al navegador mediante artefacto browser-safe generado/versionado.

## Módulos backend (ownership; no son microservicios)

1. **Identity and Accounts:** identity, organizations, authorization y api-credentials.
2. **AI Serving:** model-catalog, model-imports, model-deployments, gpu-nodes, inference, playground, request-routing, admission-control.
3. **Consumption:** quotas, usage-ledger, cost-estimates.
4. **Quality & Research:** benchmarks, experiments, datasets.
5. **Operations:** observability-queries, artifacts, audit, alerts, notifications, webhooks, jobs, backups, system.

Los módulos están inventariados 1:1 en `blueprint/architecture-manifest.json`; no introducir carpetas vacías para satisfacer un diagrama. Cada módulo: `domain/` (schemas/policies), `application/` (services/ports/types), `infrastructure/` (adapters/repositories), `presentation/http/` (controllers/dto/docs) y tests según riesgo. El domain no depende de HTTP/NestJS/Drizzle; Application usa ports y comandos de negocio sin controllers; Infrastructure implementa ports.

## Ejemplo de flujo end-to-end en código

```text
POST /v1/chat/completions
  -> Auth ApiKeyGuard           # hash, scope y tenant
  -> PermissionPolicy          # acceso al deployment/modelo
  -> CreateChatCompletionService
      -> QuotaReservationPort   # reservar tokens y lease de concurrencia
      -> InferenceRouterPort    # healthy placement, anti-cross-tenant
      -> InferenceRuntimePort   # vLLM OpenAI adapter
  -> SseStreamWriter            # chunk, backpressure, abort upstream
  -> UsageLedgerPort            # asentar / devolver reserva idempotentemente
  -> TelemetryPort              # ttft, tpot, status, trace; sin prompt
```

`valkey` falla → bloquear nuevas reservas bajo política fail-closed o usar fallback transaccional probado; nunca ignorar limitadores para "mantener servicio". `AbortController` propaga la cancelación a upstream y libera leases en `finally` más reconciliador para crashes, con TTL y ledger durable.

## Integración y dependencia entre módulos

- Identity suministra `principal` + sesión; Authorization resuelve permisos efectivos y versión de permisos.
- Organizations suministra org/membresía; todo repositorio tenant-aware exige `organization_id` autorizado.
- Catalog define modelo/revisión/capacidades/licencia; Deployments aplica state machine; GPU Nodes suministra estado real a scheduler.
- Inference consume interfaces de catálogo, quota, routing, ledger; no importa repositories SQL de esas features.
- Benchmarks invocan un runner aislado, no reutilizan credenciales de cliente ni contaminar producción.
- Artifacts exporta objeto por ports, no se usa como filesystem global; webhooks no reciben contenido de prompts.
- `system` es responsable de status, setup y configuración global; no es una colección de utilidades indiscriminadas.

## Estado, consistencia, errores y eventos

- **DB canonical:** PostgreSQL; `organization_id`, owner y unique constraints en relaciones críticas. Ledger append-only con idempotency, reconciliación y retención definida.
- **Caché/colas:** Valkey no es fuente de verdad de usuarios o tokens facturados; su pérdida degrada capacidad, no confiere acceso.
- **Outbox:** write de negocio + evento en transacción; publicador after commit; consumidores con inbox/processed_events.
- **Errors:** API admin `application/problem+json`, taxonomía estable, status 401/403/404/409/412/429/503; API OpenAI respeta formato error compatible sin prometer coincidencia universal.
- **Jobs:** `202` con job persistido y estado `queued/running/succeeded/failed/cancelled`; resultado observable y cancelación semántica.
- **State machines:** deployment y benchmark con reglas de transición; idempotencia ante doble-click/retry y error parcial.

## ADRs iniciales obligatorios

`ADR-001 Compose-VPS/5 repos`; `ADR-002 NestJS modular + ports`; `ADR-003 runtime vLLM aislado`; `ADR-004 sesión web segura vs API keys`; `ADR-005 PostgreSQL + Valkey + outbox`; `ADR-006 control de cuotas y conciliación`; `ADR-007 RustFS opcional`; `ADR-008 GPU/provisioner sin Docker socket HTTP`; `ADR-009 contrato OpenAPI browser-safe`; `ADR-010 retención/privacidad`, con status `PROPOSED` hasta revisión humana donde sea material.

## Extensibilidad medida

Las nuevas plataformas de inferencia (otro motor CPU/GPU), almacenamiento u OAuth se integran como adapters, sin duplicar controllers. Extraer servicio físico o introducir controladores multi-host solo tras perf/capacity ADR, presupuesto de conexiones, failure domains y pruebas. Un monolito modular es la opción inicial deliberada, no una deuda arquitectónica.
