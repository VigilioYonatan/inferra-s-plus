# Arquitectura de archivos sincronizada y comentada — INFERra

> **ESTADO: DISEÑO / NO_IMPLEMENTADO**. Este árbol describe archivos futuros; no se crearon cientos de stubs vacíos. Cada **archivo** tiene comentario `#` que explica ownership o verificación; `M1/M2/M3/S+` son fases. Los directorios se derivan de archivos con dueño real.

**Fuente de verdad:** `architecture-manifest.json` (trazabilidad, no configuración ejecutable). Se deriva de `inferra-mapa-apis-y-paginas-senior.md`: **163 operaciones HTTP y 71 páginas**; los dos CSV se generan desde el mismo manifiesto. No debe mantenerse una copia manual de rutas en varios docs.

**Precedencia de contrato corregida:** para endpoints/páginas prevalece el mapa más reciente sobre las tablas de ejemplo del primer blueprint; se usa `O = /api/v1/organizations/{organization_id}` y `A = /api/v1`. Para salud, `GET /api/v1/system/health/live|ready` solo internos; `GET /v1/models` es API-key-scoped. Para Compose, existe un único archivo.

**Criterio pragmático DDD:** servicios de lectura simples podrán agruparse al implementarse mediante ADR + actualización de manifiesto, sin cambiar operationId/contrato ni dejar rutas huérfanas. Los nombres aquí son ownership esperado, **no obligación de crear clases sin comportamiento**.

**IMPORTANTE:** una línea `#` es comentario del **árbol documental**, no sintaxis válida dentro de `.ts` o `.tsx`. En archivos reales corresponde `//`/`/** */`; YAML/Shell admiten `#`.

## Árbol completo (archivo → explicación)

### workspace/  (5 archivos)

```text
├── docs/
│   └── repository-ownership.md   # Ownership, equipos y dependencias entre repositorios [Foundation | config]
├── .gitignore   # Ignora checkouts temporales, tooling y outputs [Foundation | config]
├── README.md   # Cómo clonar los cinco repos y probar sincronización documental [Foundation | config]
├── versions.yaml   # Pins y hashes SHA256 de herramientas CLI; no paquetes Node [Foundation | config]
└── workspace.yaml   # Referencias Git, SHA, ownership y origen de cada repo [Foundation | config]
```

### inferra-impl/  (1115 archivos)

```text
├── .github/
│   ├── workflows/
│   │   ├── ci.yml   # Biome, TS, unit, integration, BDD, E2E API y cobertura [Foundation | base]
│   │   ├── openapi-compatibility.yml   # Exporta OpenAPI, rechaza cambios breaking no aprobados [Foundation | base]
│   │   ├── release-oci.yml   # Construye y firma imagen OCI, SBOM y provenance sin secretos [Foundation | base]
│   │   └── security.yml   # SAST, secret scan, CVE/SBOM y policy checks [Foundation | base]
│   ├── CODEOWNERS   # Revisores obligatorios de auth, inferencia y seguridad [Foundation | base]
│   └── dependabot.yml   # Actualización de dependencias controlada y versionada [Foundation | base]
├── docs/
│   ├── adr/
│   │   ├── 0001-modular-monolith.md   # ADR de DDD pragmático y límites [Foundation | base]
│   │   ├── 0002-control-data-plane.md   # ADR de exposición a clientes y vLLM privado [Foundation | base]
│   │   ├── 0003-session-oauth-mfa.md   # ADR de OTP, OAuth y sesiones rotadas [Foundation | base]
│   │   ├── 0004-atomic-quota-reservations.md   # ADR de reserva de tokens y consistencia [Foundation | base]
│   │   └── 0005-runtime-provisioning.md   # ADR provisioning de modelos sin docker.sock API [Foundation | base]
│   ├── api/
│   │   ├── error-catalog.md   # Código de error estable y condición de recuperación [Foundation | base]
│   │   ├── openai-compatibility-matrix.md   # Qué endpoints y campos soporta el runtime real [Foundation | base]
│   │   └── openapi.generated.json   # Artefacto OpenAPI generado, no editado a mano [Foundation | base]
│   ├── architecture/
│   │   ├── architecture-context.md   # Diagrama C4 de contextos y trust boundaries [Foundation | base]
│   │   ├── control-vs-data-plane.md   # Límites NestJS vs vLLM y cancelación [Foundation | base]
│   │   ├── data-classification.md   # Retención, privacidad y clasificación de prompts [Foundation | base]
│   │   ├── dependency-rules.md   # Reglas de import entre capas, Nx no requerido [Foundation | base]
│   │   └── tenant-isolation.md   # Contrato de tenancy y política de denegación [Foundation | base]
│   ├── decisions/
│   │   └── benchmark-methodology.md   # Control de warm-up, cache, GPU, p95 y goodput [Foundation | base]
│   └── threat-models/
│       ├── auth-sessions.md   # Threat model de OTP, OAuth, CSRF y MFA [Foundation | base]
│       ├── inference-data.md   # Threat model de prompts, modelos y streaming [Foundation | base]
│       ├── model-supply-chain.md   # Licencias, confianza y modelos maliciosos [Foundation | base]
│       └── object-upload.md   # Threat model de RustFS, presign y malware [Foundation | base]
├── scripts/
│   ├── check-browser-contracts.mjs   # Rechaza drift entre contrato y consumidor web [Foundation | base]
│   ├── check-env.mjs   # Valida configuración esperada sin imprimir secretos [Foundation | base]
│   ├── check-migrations.mjs   # Valida migraciones sin destruir datos [Foundation | base]
│   ├── export-openapi.mjs   # Exporta contrato NestJS/Swagger para CI [Foundation | base]
│   ├── openapi-diff.mjs   # Comparación breaking contra contrato publicado [Foundation | base]
│   ├── publish-browser-contracts.mjs   # Genera artefacto browser-safe desde DTOs propietarios [Foundation | base]
│   ├── smoke-api.mjs   # Smoke de health y rutas críticas contra instancia efímera [Foundation | base]
│   └── validate-architecture.mjs   # Verifica imports por capas, ciclos, rutas y ownership [Foundation | base]
├── src/
│   ├── bootstrap/
│   │   ├── http.bootstrap.ts   # Headers TLS/proxy, CORS/CSRF, body size y routing [Foundation | base]
│   │   ├── openapi.bootstrap.ts   # OpenAPI 3.1 documentado; publicación protegida [Foundation | base]
│   │   ├── shutdown.bootstrap.ts   # Graceful shutdown y cancelación de streaming [Foundation | base]
│   │   ├── telemetry.bootstrap.ts   # Inicializa OpenTelemetry antes de NestJS [Foundation | base]
│   │   └── worker.bootstrap.ts   # Instrumentación y shutdown de workers [Foundation | base]
│   ├── config/
│   │   ├── database.config.ts   # Pool, TLS, timeout y conexiones de PostgreSQL [Foundation | base]
│   │   ├── env.schema.ts   # Zod fail-fast de las variables por proceso [Foundation | base]
│   │   ├── env.service.ts   # Acceso tipado a configuración permitida [Foundation | base]
│   │   ├── inference.config.ts   # Allowlist de hosts, timeouts y capacidades vLLM [Foundation | base]
│   │   ├── jobs.config.ts   # Concurrencia y reintentos acotados de BullMQ [Foundation | base]
│   │   ├── oauth.config.ts   # Issuer, redirect allowlist y providers opt-in [Foundation | base]
│   │   ├── sessions.config.ts   # Cookies, TTL, rotación y protección de sesión [Foundation | base]
│   │   └── telemetry.config.ts   # Sampleo, redacción y atribución tenant low-cardinality [Foundation | base]
│   ├── database/
│   │   ├── seeds/
│   │   │   └── seed-demo-models.ts   # Datos demo idempotentes, nunca producción [Foundation | base]
│   │   ├── database.module.ts   # Provider SQL y lifecycle del pool [Foundation | base]
│   │   ├── drizzle.client.ts   # Cliente Drizzle tipado [Foundation | base]
│   │   ├── drizzle.pool.ts   # Pool de conexiones y timeouts [Foundation | base]
│   │   └── migrate.ts   # Executor DDL transaccional y locks de migración [Foundation | base]
│   ├── modules/
│   │   ├── admission-control/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── admission-control.repository.port.ts   # Contrato de persistencia admission-control; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   │   └── capacity-lease-store.port.ts   # Puerto externo capacity-lease-store para pruebas y adaptadores [M2 | port]
│   │   │   │   └── services/
│   │   │   │       └── get-admission-metrics.service.ts   # Caso de uso getAdmissionMetrics; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── overload-response.policy.ts   # Invariante/policy de negocio: overload-response; sin dependencia de HTTP [M2 | domain]
│   │   │   │   │   └── tenant-fairness.policy.ts   # Invariante/policy de negocio: tenant-fairness; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── admission-decision.schema.ts   # Zod canónico y tipo inferido del dominio admission-decision; contratos no duplicados [M2 | domain]
│   │   │   │       └── capacity-lease.schema.ts   # Zod canónico y tipo inferido del dominio capacity-lease; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── capacity-lease-store.adapter.ts   # Adaptador real de capacity-lease-store, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── admission-control.repository.ts   # Queries y transactions tenant-scoped de admission-control [M2 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de admission-control; migración revisada [M2 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── admission-metrics.controller.ts   # Controller HTTP AdmissionMetricsController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── admission-control.doc.ts   # Esquema OpenAPI 3.1 de admission-control, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── admission-control-params.dto.ts   # Zod de UUIDs/path para recursos de admission-control [M2 | dto]
│   │   │   │           ├── admission-control-public.response.dto.ts   # Proyección HTTP sin secretos de admission-control, Zod + OpenAPI [M2 | dto]
│   │   │   │           └── get-admission-metrics.query.dto.ts   # Zod de entrada para GET O/admission-metrics; valid/invalid/bounds [S+ | dto]
│   │   │   └── admission-control.module.ts   # Nest module: wiring de dominio, services, controllers y ports para admission-control [M2 | module]
│   │   ├── alerts/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── alertmanager-adapter.port.ts   # Puerto externo alertmanager-adapter para pruebas y adaptadores [M3 | port]
│   │   │   │   │   └── alerts.repository.port.ts   # Contrato de persistencia alerts; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── acknowledge-alert.service.ts   # Caso de uso acknowledgeAlert; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── list-organization-alerts.service.ts   # Caso de uso listOrganizationAlerts; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── alert-visibility.policy.ts   # Invariante/policy de negocio: alert-visibility; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── alert-acknowledgement.schema.ts   # Zod canónico y tipo inferido del dominio alert-acknowledgement; contratos no duplicados [M3 | domain]
│   │   │   │       └── alert.schema.ts   # Zod canónico y tipo inferido del dominio alert; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── alertmanager-adapter.adapter.ts   # Adaptador real de alertmanager-adapter, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── alerts.repository.ts   # Queries y transactions tenant-scoped de alerts [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de alerts; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── alerts.controller.ts   # Controller HTTP AlertsController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── alerts.doc.ts   # Esquema OpenAPI 3.1 de alerts, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── acknowledge-alert.request.dto.ts   # Zod de entrada para POST /alerts/{alert_id}/acknowledge; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── alerts-params.dto.ts   # Zod de UUIDs/path para recursos de alerts [M3 | dto]
│   │   │   │           ├── alerts-public.response.dto.ts   # Proyección HTTP sin secretos de alerts, Zod + OpenAPI [M3 | dto]
│   │   │   │           └── list-organization-alerts.query.dto.ts   # Zod de entrada para GET O/alerts; valid/invalid/bounds [M3 | dto]
│   │   │   └── alerts.module.ts   # Nest module: wiring de dominio, services, controllers y ports para alerts [M3 | module]
│   │   ├── api-credentials/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── api-credentials.repository.port.ts   # Contrato de persistencia api-credentials; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   │   └── token-hasher.port.ts   # Puerto externo token-hasher para pruebas y adaptadores [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-api-key-metadata.service.ts   # Caso de uso getApiKeyMetadata; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── get-api-key-usage.service.ts   # Caso de uso getApiKeyUsage; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── issue-api-key.service.ts   # Caso de uso issueApiKey; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── list-api-keys.service.ts   # Caso de uso listApiKeys; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── revoke-api-key.service.ts   # Caso de uso revokeApiKey; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       └── rotate-api-key.service.ts   # Caso de uso rotateApiKey; policy, transacción, puertos y métricas [M2 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── api-key-rotation.policy.ts   # Invariante/policy de negocio: api-key-rotation; sin dependencia de HTTP [M2 | domain]
│   │   │   │   │   └── api-key-visibility.policy.ts   # Invariante/policy de negocio: api-key-visibility; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── api-key-scope.schema.ts   # Zod canónico y tipo inferido del dominio api-key-scope; contratos no duplicados [M2 | domain]
│   │   │   │       └── api-key.schema.ts   # Zod canónico y tipo inferido del dominio api-key; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── token-hasher.adapter.ts   # Adaptador real de token-hasher, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── api-credentials.repository.ts   # Queries y transactions tenant-scoped de api-credentials [M2 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de api-credentials; migración revisada [M2 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── api-credentials.controller.ts   # Controller HTTP ApiCredentialsController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── api-credentials.doc.ts   # Esquema OpenAPI 3.1 de api-credentials, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── api-credentials-params.dto.ts   # Zod de UUIDs/path para recursos de api-credentials [M2 | dto]
│   │   │   │           ├── api-credentials-public.response.dto.ts   # Proyección HTTP sin secretos de api-credentials, Zod + OpenAPI [M2 | dto]
│   │   │   │           ├── get-api-key-usage.query.dto.ts   # Zod de entrada para GET /api-keys/{api_key_id}/usage; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── issue-api-key.request.dto.ts   # Zod de entrada para POST O/api-keys; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── list-api-keys.query.dto.ts   # Zod de entrada para GET O/api-keys; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── revoke-api-key.request.dto.ts   # Zod de entrada para POST /api-keys/{api_key_id}/revoke; valid/invalid/bounds [M2 | dto]
│   │   │   │           └── rotate-api-key.request.dto.ts   # Zod de entrada para POST /api-keys/{api_key_id}/rotate; valid/invalid/bounds [M2 | dto]
│   │   │   └── api-credentials.module.ts   # Nest module: wiring de dominio, services, controllers y ports para api-credentials [M2 | module]
│   │   ├── artifacts/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── artifacts.repository.port.ts   # Contrato de persistencia artifacts; sin ORM acoplado a aplicación [S+ | port]
│   │   │   │   │   ├── clamav-scanner.port.ts   # Puerto externo clamav-scanner para pruebas y adaptadores [S+ | port]
│   │   │   │   │   └── rustfs-s3.port.ts   # Puerto externo rustfs-s3 para pruebas y adaptadores [S+ | port]
│   │   │   │   └── services/
│   │   │   │       ├── archive-artifact.service.ts   # Caso de uso archiveArtifact; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── complete-artifact-upload.service.ts   # Caso de uso completeArtifactUpload; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-artifact-metadata.service.ts   # Caso de uso getArtifactMetadata; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── issue-artifact-download.service.ts   # Caso de uso issueArtifactDownload; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── list-artifacts.service.ts   # Caso de uso listArtifacts; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       └── request-artifact-upload.service.ts   # Caso de uso requestArtifactUpload; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── object-quarantine.policy.ts   # Invariante/policy de negocio: object-quarantine; sin dependencia de HTTP [S+ | domain]
│   │   │   │   │   └── upload-quota.policy.ts   # Invariante/policy de negocio: upload-quota; sin dependencia de HTTP [S+ | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── artifact.schema.ts   # Zod canónico y tipo inferido del dominio artifact; contratos no duplicados [S+ | domain]
│   │   │   │       ├── download-grant.schema.ts   # Zod canónico y tipo inferido del dominio download-grant; contratos no duplicados [S+ | domain]
│   │   │   │       └── upload-session.schema.ts   # Zod canónico y tipo inferido del dominio upload-session; contratos no duplicados [S+ | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── clamav-scanner.adapter.ts   # Adaptador real de clamav-scanner, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   │   └── rustfs-s3.adapter.ts   # Adaptador real de rustfs-s3, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   ├── persistence/
│   │   │   │   │   └── drizzle/
│   │   │   │   │       ├── artifacts.repository.ts   # Queries y transactions tenant-scoped de artifacts [S+ | db]
│   │   │   │   │       └── schema.ts   # Tablas, índices y constraints de artifacts; migración revisada [S+ | db]
│   │   │   │   ├── security/
│   │   │   │   │   └── clamav-scanner.adapter.ts   # Scan antes de publicar objeto en RustFS; cuarentena [M3 | special]
│   │   │   │   └── storage/
│   │   │   │       └── rustfs-s3.adapter.ts   # S3 RustFS con checksum, TTL y bucket privado [M3 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── artifacts.controller.ts   # Controller HTTP ArtifactsController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── artifacts.doc.ts   # Esquema OpenAPI 3.1 de artifacts, derivado de DTO sin copiar modelo [S+ | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── archive-artifact.request.dto.ts   # Zod de entrada para POST /artifacts/{artifact_id}/archive; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── artifacts-params.dto.ts   # Zod de UUIDs/path para recursos de artifacts [S+ | dto]
│   │   │   │           ├── artifacts-public.response.dto.ts   # Proyección HTTP sin secretos de artifacts, Zod + OpenAPI [S+ | dto]
│   │   │   │           ├── complete-artifact-upload.request.dto.ts   # Zod de entrada para POST /artifacts/{artifact_id}/complete; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── issue-artifact-download.request.dto.ts   # Zod de entrada para POST /artifacts/{artifact_id}/download; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── list-artifacts.query.dto.ts   # Zod de entrada para GET O/artifacts; valid/invalid/bounds [S+ | dto]
│   │   │   │           └── request-artifact-upload.request.dto.ts   # Zod de entrada para POST O/artifacts/uploads; valid/invalid/bounds [S+ | dto]
│   │   │   └── artifacts.module.ts   # Nest module: wiring de dominio, services, controllers y ports para artifacts [S+ | module]
│   │   ├── audit/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── audit-exporter.port.ts   # Puerto externo audit-exporter para pruebas y adaptadores [M3 | port]
│   │   │   │   │   └── audit.repository.port.ts   # Contrato de persistencia audit; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-audit-event.service.ts   # Caso de uso getAuditEvent; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-audit-events.service.ts   # Caso de uso listAuditEvents; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── request-audit-export.service.ts   # Caso de uso requestAuditExport; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── audit-immutability.policy.ts   # Invariante/policy de negocio: audit-immutability; sin dependencia de HTTP [M3 | domain]
│   │   │   │   │   └── audit-redaction.policy.ts   # Invariante/policy de negocio: audit-redaction; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── audit-event.schema.ts   # Zod canónico y tipo inferido del dominio audit-event; contratos no duplicados [M3 | domain]
│   │   │   │       └── audit-export.schema.ts   # Zod canónico y tipo inferido del dominio audit-export; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── audit-exporter.adapter.ts   # Adaptador real de audit-exporter, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── audit.repository.ts   # Queries y transactions tenant-scoped de audit [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de audit; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── audit.controller.ts   # Controller HTTP AuditController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── audit.doc.ts   # Esquema OpenAPI 3.1 de audit, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── audit-params.dto.ts   # Zod de UUIDs/path para recursos de audit [M3 | dto]
│   │   │   │           ├── audit-public.response.dto.ts   # Proyección HTTP sin secretos de audit, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── get-audit-event.query.dto.ts   # Zod de entrada para GET /audit-events/{audit_event_id}; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-audit-events.query.dto.ts   # Zod de entrada para GET O/audit-events; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── request-audit-export.request.dto.ts   # Zod de entrada para POST O/audit-exports; valid/invalid/bounds [M3 | dto]
│   │   │   └── audit.module.ts   # Nest module: wiring de dominio, services, controllers y ports para audit [M3 | module]
│   │   ├── authorization/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   └── authorization.repository.port.ts   # Contrato de persistencia authorization; sin ORM acoplado a aplicación [M1 | port]
│   │   │   │   └── services/
│   │   │   │       ├── list-available-roles.service.ts   # Caso de uso listAvailableRoles; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       └── list-organization-permissions.service.ts   # Caso de uso listOrganizationPermissions; policy, transacción, puertos y métricas [M1 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── anti-privilege-escalation.policy.ts   # Invariante/policy de negocio: anti-privilege-escalation; sin dependencia de HTTP [M1 | domain]
│   │   │   │   │   ├── resource-permission.policy.ts   # Invariante/policy de negocio: resource-permission; sin dependencia de HTTP [M1 | domain]
│   │   │   │   │   └── tenant-boundary.policy.ts   # Invariante/policy de negocio: tenant-boundary; sin dependencia de HTTP [M1 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── permission.schema.ts   # Zod canónico y tipo inferido del dominio permission; contratos no duplicados [M1 | domain]
│   │   │   │       ├── policy-binding.schema.ts   # Zod canónico y tipo inferido del dominio policy-binding; contratos no duplicados [M1 | domain]
│   │   │   │       └── role.schema.ts   # Zod canónico y tipo inferido del dominio role; contratos no duplicados [M1 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── authorization.repository.ts   # Queries y transactions tenant-scoped de authorization [M1 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de authorization; migración revisada [M1 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── authorization.controller.ts   # Controller HTTP AuthorizationController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── authorization.doc.ts   # Esquema OpenAPI 3.1 de authorization, derivado de DTO sin copiar modelo [M1 | openapi]
│   │   │   │       ├── dto/
│   │   │   │       │   ├── authorization-params.dto.ts   # Zod de UUIDs/path para recursos de authorization [M1 | dto]
│   │   │   │       │   ├── authorization-public.response.dto.ts   # Proyección HTTP sin secretos de authorization, Zod + OpenAPI [M1 | dto]
│   │   │   │       │   ├── list-available-roles.query.dto.ts   # Zod de entrada para GET O/roles; valid/invalid/bounds [M1 | dto]
│   │   │   │       │   └── list-organization-permissions.query.dto.ts   # Zod de entrada para GET O/permissions; valid/invalid/bounds [M1 | dto]
│   │   │   │       └── guards/
│   │   │   │           └── resource-permission.guard.ts   # Permiso sobre recurso y tenant; deny-by-default [M1 | special]
│   │   │   └── authorization.module.ts   # Nest module: wiring de dominio, services, controllers y ports para authorization [M1 | module]
│   │   ├── backups/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── backups.repository.port.ts   # Contrato de persistencia backups; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   │   └── pgbackrest-status.port.ts   # Puerto externo pgbackrest-status para pruebas y adaptadores [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-backup-metadata.service.ts   # Caso de uso getBackupMetadata; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-backups.service.ts   # Caso de uso listBackups; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── request-backup.service.ts   # Caso de uso requestBackup; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── verify-backup.service.ts   # Caso de uso verifyBackup; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── backup-owner-approval.policy.ts   # Invariante/policy de negocio: backup-owner-approval; sin dependencia de HTTP [M3 | domain]
│   │   │   │   │   └── restore-cli-only.policy.ts   # Invariante/policy de negocio: restore-cli-only; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── backup-check.schema.ts   # Zod canónico y tipo inferido del dominio backup-check; contratos no duplicados [M3 | domain]
│   │   │   │       └── backup-record.schema.ts   # Zod canónico y tipo inferido del dominio backup-record; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── pgbackrest-status.adapter.ts   # Adaptador real de pgbackrest-status, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   ├── persistence/
│   │   │   │   │   └── drizzle/
│   │   │   │   │       ├── backups.repository.ts   # Queries y transactions tenant-scoped de backups [M3 | db]
│   │   │   │   │       └── schema.ts   # Tablas, índices y constraints de backups; migración revisada [M3 | db]
│   │   │   │   └── pgbackrest/
│   │   │   │       └── backup-status.adapter.ts   # Solo estado/verify; RESTORE NO vía HTTP [M3 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── backups.controller.ts   # Controller HTTP BackupsController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── backups.doc.ts   # Esquema OpenAPI 3.1 de backups, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── backups-params.dto.ts   # Zod de UUIDs/path para recursos de backups [M3 | dto]
│   │   │   │           ├── backups-public.response.dto.ts   # Proyección HTTP sin secretos de backups, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── list-backups.query.dto.ts   # Zod de entrada para GET /system/backups; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── request-backup.request.dto.ts   # Zod de entrada para POST /system/backups/run; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── verify-backup.request.dto.ts   # Zod de entrada para POST /system/backups/{backup_id}/verify; valid/invalid/bounds [M3 | dto]
│   │   │   └── backups.module.ts   # Nest module: wiring de dominio, services, controllers y ports para backups [M3 | module]
│   │   ├── benchmarks/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── artifact-export.port.ts   # Puerto externo artifact-export para pruebas y adaptadores [S+ | port]
│   │   │   │   │   ├── benchmark-runner.port.ts   # Puerto externo benchmark-runner para pruebas y adaptadores [S+ | port]
│   │   │   │   │   └── benchmarks.repository.port.ts   # Contrato de persistencia benchmarks; sin ORM acoplado a aplicación [S+ | port]
│   │   │   │   └── services/
│   │   │   │       ├── cancel-benchmark-run.service.ts   # Caso de uso cancelBenchmarkRun; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── create-benchmark-run.service.ts   # Caso de uso createBenchmarkRun; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── export-benchmark-report.service.ts   # Caso de uso exportBenchmarkReport; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-benchmark-results.service.ts   # Caso de uso getBenchmarkResults; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-benchmark-run.service.ts   # Caso de uso getBenchmarkRun; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── list-benchmark-runs.service.ts   # Caso de uso listBenchmarkRuns; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── start-benchmark-run.service.ts   # Caso de uso startBenchmarkRun; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       └── stream-benchmark-events.service.ts   # Caso de uso streamBenchmarkEvents; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── benchmark-reproducibility.policy.ts   # Invariante/policy de negocio: benchmark-reproducibility; sin dependencia de HTTP [S+ | domain]
│   │   │   │   │   └── concurrency-limit.policy.ts   # Invariante/policy de negocio: concurrency-limit; sin dependencia de HTTP [S+ | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── benchmark-result.schema.ts   # Zod canónico y tipo inferido del dominio benchmark-result; contratos no duplicados [S+ | domain]
│   │   │   │       ├── benchmark-run.schema.ts   # Zod canónico y tipo inferido del dominio benchmark-run; contratos no duplicados [S+ | domain]
│   │   │   │       └── benchmark-workload.schema.ts   # Zod canónico y tipo inferido del dominio benchmark-workload; contratos no duplicados [S+ | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── artifact-export.adapter.ts   # Adaptador real de artifact-export, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   │   └── benchmark-runner.adapter.ts   # Adaptador real de benchmark-runner, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   ├── persistence/
│   │   │   │   │   └── drizzle/
│   │   │   │   │       ├── benchmarks.repository.ts   # Queries y transactions tenant-scoped de benchmarks [S+ | db]
│   │   │   │   │       └── schema.ts   # Tablas, índices y constraints de benchmarks; migración revisada [S+ | db]
│   │   │   │   └── workers/
│   │   │   │       └── benchmark-runner.consumer.ts   # Ejecutor de benchmark aislado con dataset fijo, warmup y caps [M3 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── benchmarks.controller.ts   # Controller HTTP BenchmarksController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── benchmarks.doc.ts   # Esquema OpenAPI 3.1 de benchmarks, derivado de DTO sin copiar modelo [S+ | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── benchmarks-params.dto.ts   # Zod de UUIDs/path para recursos de benchmarks [S+ | dto]
│   │   │   │           ├── benchmarks-public.response.dto.ts   # Proyección HTTP sin secretos de benchmarks, Zod + OpenAPI [S+ | dto]
│   │   │   │           ├── cancel-benchmark-run.request.dto.ts   # Zod de entrada para POST /benchmarks/{benchmark_id}/cancel; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── create-benchmark-run.request.dto.ts   # Zod de entrada para POST O/benchmarks; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── export-benchmark-report.request.dto.ts   # Zod de entrada para POST /benchmarks/{benchmark_id}/exports; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── list-benchmark-runs.query.dto.ts   # Zod de entrada para GET O/benchmarks; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── start-benchmark-run.request.dto.ts   # Zod de entrada para POST /benchmarks/{benchmark_id}/start; valid/invalid/bounds [S+ | dto]
│   │   │   │           └── stream-benchmark-events.query.dto.ts   # Zod de entrada para GET /benchmarks/{benchmark_id}/events; valid/invalid/bounds [S+ | dto]
│   │   │   └── benchmarks.module.ts   # Nest module: wiring de dominio, services, controllers y ports para benchmarks [S+ | module]
│   │   ├── cost-estimates/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── cost-calculator.port.ts   # Puerto externo cost-calculator para pruebas y adaptadores [M3 | port]
│   │   │   │   │   └── cost-estimates.repository.port.ts   # Contrato de persistencia cost-estimates; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-cost-estimates.service.ts   # Caso de uso getCostEstimates; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── update-cost-assumptions.service.ts   # Caso de uso updateCostAssumptions; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── cost-estimate-labeling.policy.ts   # Invariante/policy de negocio: cost-estimate-labeling; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── cost-assumption.schema.ts   # Zod canónico y tipo inferido del dominio cost-assumption; contratos no duplicados [M3 | domain]
│   │   │   │       └── estimated-cost.schema.ts   # Zod canónico y tipo inferido del dominio estimated-cost; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── cost-calculator.adapter.ts   # Adaptador real de cost-calculator, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── cost-estimates.repository.ts   # Queries y transactions tenant-scoped de cost-estimates [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de cost-estimates; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── cost-estimates.controller.ts   # Controller HTTP CostEstimatesController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── cost-estimates.doc.ts   # Esquema OpenAPI 3.1 de cost-estimates, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── cost-estimates-params.dto.ts   # Zod de UUIDs/path para recursos de cost-estimates [M3 | dto]
│   │   │   │           ├── cost-estimates-public.response.dto.ts   # Proyección HTTP sin secretos de cost-estimates, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── get-cost-estimates.query.dto.ts   # Zod de entrada para GET O/cost-estimates; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── update-cost-assumptions.request.dto.ts   # Zod de entrada para PATCH O/cost-assumptions; valid/invalid/bounds [S+ | dto]
│   │   │   └── cost-estimates.module.ts   # Nest module: wiring de dominio, services, controllers y ports para cost-estimates [M3 | module]
│   │   ├── datasets/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── dataset-parser.port.ts   # Puerto externo dataset-parser para pruebas y adaptadores [S+ | port]
│   │   │   │   │   └── datasets.repository.port.ts   # Contrato de persistencia datasets; sin ORM acoplado a aplicación [S+ | port]
│   │   │   │   └── services/
│   │   │   │       ├── archive-dataset.service.ts   # Caso de uso archiveDataset; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── create-dataset.service.ts   # Caso de uso createDataset; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-dataset.service.ts   # Caso de uso getDataset; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── list-datasets.service.ts   # Caso de uso listDatasets; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       └── validate-dataset.service.ts   # Caso de uso validateDataset; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── dataset-license.policy.ts   # Invariante/policy de negocio: dataset-license; sin dependencia de HTTP [S+ | domain]
│   │   │   │   │   └── dataset-validation.policy.ts   # Invariante/policy de negocio: dataset-validation; sin dependencia de HTTP [S+ | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── dataset-revision.schema.ts   # Zod canónico y tipo inferido del dominio dataset-revision; contratos no duplicados [S+ | domain]
│   │   │   │       └── dataset.schema.ts   # Zod canónico y tipo inferido del dominio dataset; contratos no duplicados [S+ | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── dataset-parser.adapter.ts   # Adaptador real de dataset-parser, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── datasets.repository.ts   # Queries y transactions tenant-scoped de datasets [S+ | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de datasets; migración revisada [S+ | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── datasets.controller.ts   # Controller HTTP DatasetsController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── datasets.doc.ts   # Esquema OpenAPI 3.1 de datasets, derivado de DTO sin copiar modelo [S+ | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── archive-dataset.request.dto.ts   # Zod de entrada para POST /datasets/{dataset_id}/archive; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── create-dataset.request.dto.ts   # Zod de entrada para POST O/datasets; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── datasets-params.dto.ts   # Zod de UUIDs/path para recursos de datasets [S+ | dto]
│   │   │   │           ├── datasets-public.response.dto.ts   # Proyección HTTP sin secretos de datasets, Zod + OpenAPI [S+ | dto]
│   │   │   │           ├── list-datasets.query.dto.ts   # Zod de entrada para GET O/datasets; valid/invalid/bounds [S+ | dto]
│   │   │   │           └── validate-dataset.request.dto.ts   # Zod de entrada para POST /datasets/{dataset_id}/validate; valid/invalid/bounds [S+ | dto]
│   │   │   └── datasets.module.ts   # Nest module: wiring de dominio, services, controllers y ports para datasets [S+ | module]
│   │   ├── experiments/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── experiment-compare.port.ts   # Puerto externo experiment-compare para pruebas y adaptadores [S+ | port]
│   │   │   │   │   └── experiments.repository.port.ts   # Contrato de persistencia experiments; sin ORM acoplado a aplicación [S+ | port]
│   │   │   │   └── services/
│   │   │   │       ├── cancel-experiment.service.ts   # Caso de uso cancelExperiment; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── create-experiment.service.ts   # Caso de uso createExperiment; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-experiment-comparison.service.ts   # Caso de uso getExperimentComparison; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-experiment.service.ts   # Caso de uso getExperiment; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── list-experiments.service.ts   # Caso de uso listExperiments; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── promote-experiment-candidate.service.ts   # Caso de uso promoteExperimentCandidate; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── rollback-experiment-promotion.service.ts   # Caso de uso rollbackExperimentPromotion; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       └── run-experiment.service.ts   # Caso de uso runExperiment; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── promotion-gate.policy.ts   # Invariante/policy de negocio: promotion-gate; sin dependencia de HTTP [S+ | domain]
│   │   │   │   │   └── rollback-eligibility.policy.ts   # Invariante/policy de negocio: rollback-eligibility; sin dependencia de HTTP [S+ | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── candidate.schema.ts   # Zod canónico y tipo inferido del dominio candidate; contratos no duplicados [S+ | domain]
│   │   │   │       ├── experiment.schema.ts   # Zod canónico y tipo inferido del dominio experiment; contratos no duplicados [S+ | domain]
│   │   │   │       └── promotion.schema.ts   # Zod canónico y tipo inferido del dominio promotion; contratos no duplicados [S+ | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── experiment-compare.adapter.ts   # Adaptador real de experiment-compare, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── experiments.repository.ts   # Queries y transactions tenant-scoped de experiments [S+ | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de experiments; migración revisada [S+ | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── experiments.controller.ts   # Controller HTTP ExperimentsController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── experiments.doc.ts   # Esquema OpenAPI 3.1 de experiments, derivado de DTO sin copiar modelo [S+ | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── cancel-experiment.request.dto.ts   # Zod de entrada para POST /experiments/{experiment_id}/cancel; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── create-experiment.request.dto.ts   # Zod de entrada para POST O/experiments; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── experiments-params.dto.ts   # Zod de UUIDs/path para recursos de experiments [S+ | dto]
│   │   │   │           ├── experiments-public.response.dto.ts   # Proyección HTTP sin secretos de experiments, Zod + OpenAPI [S+ | dto]
│   │   │   │           ├── list-experiments.query.dto.ts   # Zod de entrada para GET O/experiments; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── promote-experiment-candidate.request.dto.ts   # Zod de entrada para POST /experiments/{experiment_id}/promote; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── rollback-experiment-promotion.request.dto.ts   # Zod de entrada para POST /experiments/{experiment_id}/rollback; valid/invalid/bounds [S+ | dto]
│   │   │   │           └── run-experiment.request.dto.ts   # Zod de entrada para POST /experiments/{experiment_id}/run; valid/invalid/bounds [S+ | dto]
│   │   │   └── experiments.module.ts   # Nest module: wiring de dominio, services, controllers y ports para experiments [S+ | module]
│   │   ├── gpu-nodes/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── dcgm-metrics-reader.port.ts   # Puerto externo dcgm-metrics-reader para pruebas y adaptadores [M3 | port]
│   │   │   │   │   └── gpu-nodes.repository.port.ts   # Contrato de persistencia gpu-nodes; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── drain-gpu-node.service.ts   # Caso de uso drainGpuNode; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-gpu-node-metrics.service.ts   # Caso de uso getGpuNodeMetrics; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-gpu-node.service.ts   # Caso de uso getGpuNode; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-gpu-nodes.service.ts   # Caso de uso listGpuNodes; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── undrain-gpu-node.service.ts   # Caso de uso undrainGpuNode; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── node-drain-eligibility.policy.ts   # Invariante/policy de negocio: node-drain-eligibility; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── gpu-capacity.schema.ts   # Zod canónico y tipo inferido del dominio gpu-capacity; contratos no duplicados [M3 | domain]
│   │   │   │       ├── gpu-device.schema.ts   # Zod canónico y tipo inferido del dominio gpu-device; contratos no duplicados [M3 | domain]
│   │   │   │       └── gpu-node.schema.ts   # Zod canónico y tipo inferido del dominio gpu-node; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── dcgm-metrics-reader.adapter.ts   # Adaptador real de dcgm-metrics-reader, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── gpu-nodes.repository.ts   # Queries y transactions tenant-scoped de gpu-nodes [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de gpu-nodes; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── gpu-nodes.controller.ts   # Controller HTTP GpuNodesController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── gpu-nodes.doc.ts   # Esquema OpenAPI 3.1 de gpu-nodes, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── drain-gpu-node.request.dto.ts   # Zod de entrada para POST /gpu-nodes/{node_id}/drain; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── get-gpu-node-metrics.query.dto.ts   # Zod de entrada para GET /gpu-nodes/{node_id}/metrics; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── gpu-nodes-params.dto.ts   # Zod de UUIDs/path para recursos de gpu-nodes [M3 | dto]
│   │   │   │           ├── gpu-nodes-public.response.dto.ts   # Proyección HTTP sin secretos de gpu-nodes, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── list-gpu-nodes.query.dto.ts   # Zod de entrada para GET /gpu-nodes; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── undrain-gpu-node.request.dto.ts   # Zod de entrada para POST /gpu-nodes/{node_id}/undrain; valid/invalid/bounds [S+ | dto]
│   │   │   └── gpu-nodes.module.ts   # Nest module: wiring de dominio, services, controllers y ports para gpu-nodes [M3 | module]
│   │   ├── identity/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── argon2id-password.port.ts   # Puerto externo argon2id-password para pruebas y adaptadores [M1 | port]
│   │   │   │   │   ├── facebook-oauth.port.ts   # Puerto externo facebook-oauth para pruebas y adaptadores [M1 | port]
│   │   │   │   │   ├── google-oidc.port.ts   # Puerto externo google-oidc para pruebas y adaptadores [M1 | port]
│   │   │   │   │   ├── identity.repository.port.ts   # Contrato de persistencia identity; sin ORM acoplado a aplicación [M1 | port]
│   │   │   │   │   ├── otp-hash.port.ts   # Puerto externo otp-hash para pruebas y adaptadores [M1 | port]
│   │   │   │   │   ├── session-cookie.port.ts   # Puerto externo session-cookie para pruebas y adaptadores [M1 | port]
│   │   │   │   │   └── smtp-mailer.port.ts   # Puerto externo smtp-mailer para pruebas y adaptadores [M1 | port]
│   │   │   │   └── services/
│   │   │   │       ├── authenticate-password.service.ts   # Caso de uso authenticatePassword; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── begin-o-auth-login.service.ts   # Caso de uso beginOAuthLogin; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── begin-social-identity-link.service.ts   # Caso de uso beginSocialIdentityLink; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── begin-totp-enrollment.service.ts   # Caso de uso beginTotpEnrollment; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── complete-o-auth-login.service.ts   # Caso de uso completeOAuthLogin; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── complete-password-reset.service.ts   # Caso de uso completePasswordReset; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── complete-social-identity-link.service.ts   # Caso de uso completeSocialIdentityLink; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── complete-step-up-authentication.service.ts   # Caso de uso completeStepUpAuthentication; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── confirm-totp-enrollment.service.ts   # Caso de uso confirmTotpEnrollment; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── disable-totp.service.ts   # Caso de uso disableTotp; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── get-current-session.service.ts   # Caso de uso getCurrentSession; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── list-active-sessions.service.ts   # Caso de uso listActiveSessions; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── list-linked-identities.service.ts   # Caso de uso listLinkedIdentities; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── logout-all-sessions.service.ts   # Caso de uso logoutAllSessions; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── logout-current-session.service.ts   # Caso de uso logoutCurrentSession; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── regenerate-recovery-codes.service.ts   # Caso de uso regenerateRecoveryCodes; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── register-account.service.ts   # Caso de uso registerAccount; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── request-email-otp.service.ts   # Caso de uso requestEmailOtp; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── request-password-reset.service.ts   # Caso de uso requestPasswordReset; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── revoke-session.service.ts   # Caso de uso revokeSession; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── rotate-session.service.ts   # Caso de uso rotateSession; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── unlink-social-identity.service.ts   # Caso de uso unlinkSocialIdentity; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── verify-email-otp.service.ts   # Caso de uso verifyEmailOtp; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       └── verify-mfa-challenge.service.ts   # Caso de uso verifyMfaChallenge; policy, transacción, puertos y métricas [M1 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── login-risk.policy.ts   # Invariante/policy de negocio: login-risk; sin dependencia de HTTP [M1 | domain]
│   │   │   │   │   ├── sensitive-action.policy.ts   # Invariante/policy de negocio: sensitive-action; sin dependencia de HTTP [M1 | domain]
│   │   │   │   │   └── social-account-link.policy.ts   # Invariante/policy de negocio: social-account-link; sin dependencia de HTTP [M1 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── identity-provider.schema.ts   # Zod canónico y tipo inferido del dominio identity-provider; contratos no duplicados [M1 | domain]
│   │   │   │       ├── mfa-device.schema.ts   # Zod canónico y tipo inferido del dominio mfa-device; contratos no duplicados [M1 | domain]
│   │   │   │       ├── otp-challenge.schema.ts   # Zod canónico y tipo inferido del dominio otp-challenge; contratos no duplicados [M1 | domain]
│   │   │   │       ├── password-reset.schema.ts   # Zod canónico y tipo inferido del dominio password-reset; contratos no duplicados [M1 | domain]
│   │   │   │       ├── session.schema.ts   # Zod canónico y tipo inferido del dominio session; contratos no duplicados [M1 | domain]
│   │   │   │       └── user.schema.ts   # Zod canónico y tipo inferido del dominio user; contratos no duplicados [M1 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── argon2id-password.adapter.ts   # Adaptador real de argon2id-password, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   │   ├── facebook-oauth.adapter.ts   # Adaptador real de facebook-oauth, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   │   ├── google-oidc.adapter.ts   # Adaptador real de google-oidc, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   │   ├── otp-hash.adapter.ts   # Adaptador real de otp-hash, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   │   ├── session-cookie.adapter.ts   # Adaptador real de session-cookie, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   │   └── smtp-mailer.adapter.ts   # Adaptador real de smtp-mailer, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   ├── crypto/
│   │   │   │   │   └── argon2id-password.adapter.ts   # Hash Argon2id con parámetros auditables y migración de hashes [M1 | special]
│   │   │   │   ├── email/
│   │   │   │   │   └── smtp-mailer.adapter.ts   # Email OTP/invitaciones con límites y retries idempotentes [M1 | special]
│   │   │   │   ├── oauth/
│   │   │   │   │   ├── facebook-oauth.adapter.ts   # Facebook OAuth state, appsecret_proof y proveedor ID [M1 | special]
│   │   │   │   │   └── google-oidc.adapter.ts   # Validación issuer/aud/nonce/PKCE y firma de Google [M1 | special]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── identity.repository.ts   # Queries y transactions tenant-scoped de identity [M1 | db]
│   │   │   │           ├── otp-challenge.repository.ts   # OTP hasheado y consumo único en transacción [M1 | special]
│   │   │   │           ├── schema.ts   # Tablas, índices y constraints de identity; migración revisada [M1 | db]
│   │   │   │           └── session-token.repository.ts   # Hash de refresh token, family y reuse detection atómica [M1 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   ├── identity.controller.ts   # Controller HTTP IdentityController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       │   ├── mfa.controller.ts   # Controller HTTP MfaController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       │   ├── o-auth.controller.ts   # Controller HTTP OAuthController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       │   └── sessions.controller.ts   # Controller HTTP SessionsController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── identity.doc.ts   # Esquema OpenAPI 3.1 de identity, derivado de DTO sin copiar modelo [M1 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── authenticate-password.request.dto.ts   # Zod de entrada para POST /auth/password/login; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── begin-totp-enrollment.request.dto.ts   # Zod de entrada para POST /auth/mfa/totp/enroll; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── complete-password-reset.request.dto.ts   # Zod de entrada para POST /auth/password/recovery/complete; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── complete-step-up-authentication.request.dto.ts   # Zod de entrada para POST /auth/step-up; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── confirm-totp-enrollment.request.dto.ts   # Zod de entrada para POST /auth/mfa/totp/confirm; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── disable-totp.request.dto.ts   # Zod de entrada para POST /auth/mfa/totp/disable; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── identity-params.dto.ts   # Zod de UUIDs/path para recursos de identity [M1 | dto]
│   │   │   │           ├── identity-public.response.dto.ts   # Proyección HTTP sin secretos de identity, Zod + OpenAPI [M1 | dto]
│   │   │   │           ├── list-active-sessions.query.dto.ts   # Zod de entrada para GET /auth/sessions; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── list-linked-identities.query.dto.ts   # Zod de entrada para GET /auth/identities; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── logout-all-sessions.request.dto.ts   # Zod de entrada para POST /auth/logout-all; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── logout-current-session.request.dto.ts   # Zod de entrada para POST /auth/logout; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── regenerate-recovery-codes.request.dto.ts   # Zod de entrada para POST /auth/mfa/recovery-codes/regenerate; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── register-account.request.dto.ts   # Zod de entrada para POST /auth/register; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── request-email-otp.request.dto.ts   # Zod de entrada para POST /auth/otp/request; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── request-password-reset.request.dto.ts   # Zod de entrada para POST /auth/password/recovery/request; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── rotate-session.request.dto.ts   # Zod de entrada para POST /auth/refresh; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── verify-email-otp.request.dto.ts   # Zod de entrada para POST /auth/otp/verify; valid/invalid/bounds [M1 | dto]
│   │   │   │           └── verify-mfa-challenge.request.dto.ts   # Zod de entrada para POST /auth/mfa/challenge/verify; valid/invalid/bounds [M1 | dto]
│   │   │   └── identity.module.ts   # Nest module: wiring de dominio, services, controllers y ports para identity [M1 | module]
│   │   ├── inference/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── inference.repository.port.ts   # Contrato de persistencia inference; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   │   ├── upstream-http.port.ts   # Puerto externo upstream-http para pruebas y adaptadores [M2 | port]
│   │   │   │   │   ├── vllm-openai.port.ts   # Puerto externo vllm-openai para pruebas y adaptadores [M2 | port]
│   │   │   │   │   └── vllm-sse-decoder.port.ts   # Puerto externo vllm-sse-decoder para pruebas y adaptadores [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── create-chat-completion.service.ts   # Caso de uso createChatCompletion; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── create-completion.service.ts   # Caso de uso createCompletion; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── create-embedding.service.ts   # Caso de uso createEmbedding; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── create-response.service.ts   # Caso de uso createResponse; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-serving-model.service.ts   # Caso de uso getServingModel; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       └── list-serving-models.service.ts   # Caso de uso listServingModels; policy, transacción, puertos y métricas [M2 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── data-handling.policy.ts   # Invariante/policy de negocio: data-handling; sin dependencia de HTTP [M2 | domain]
│   │   │   │   │   └── model-invocation-access.policy.ts   # Invariante/policy de negocio: model-invocation-access; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── inference-request.schema.ts   # Zod canónico y tipo inferido del dominio inference-request; contratos no duplicados [M2 | domain]
│   │   │   │       ├── inference-result.schema.ts   # Zod canónico y tipo inferido del dominio inference-result; contratos no duplicados [M2 | domain]
│   │   │   │       └── model-capability.schema.ts   # Zod canónico y tipo inferido del dominio model-capability; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── upstream-http.adapter.ts   # Adaptador real de upstream-http, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   │   ├── vllm-openai.adapter.ts   # Adaptador real de vllm-openai, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   │   └── vllm-sse-decoder.adapter.ts   # Adaptador real de vllm-sse-decoder, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   ├── persistence/
│   │   │   │   │   └── drizzle/
│   │   │   │   │       ├── inference.repository.ts   # Queries y transactions tenant-scoped de inference [M2 | db]
│   │   │   │   │       └── schema.ts   # Tablas, índices y constraints de inference; migración revisada [M2 | db]
│   │   │   │   └── vllm/
│   │   │   │       ├── vllm-openai.adapter.ts   # Transforma request/response OpenAI compatible a vLLM [M3 | special]
│   │   │   │       └── vllm-sse-decoder.ts   # SSE incremental fragmentado + defensas de tamaño [M3 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── open-ai-compatible.controller.ts   # Controller HTTP OpenAiCompatibleController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── inference.doc.ts   # Esquema OpenAPI 3.1 de inference, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       ├── dto/
│   │   │   │       │   ├── create-chat-completion.request.dto.ts   # Zod de entrada para POST /v1/chat/completions; valid/invalid/bounds [M2 | dto]
│   │   │   │       │   ├── create-completion.request.dto.ts   # Zod de entrada para POST /v1/completions; valid/invalid/bounds [M2 | dto]
│   │   │   │       │   ├── create-embedding.request.dto.ts   # Zod de entrada para POST /v1/embeddings; valid/invalid/bounds [S+ | dto]
│   │   │   │       │   ├── create-response.request.dto.ts   # Zod de entrada para POST /v1/responses; valid/invalid/bounds [S+ | dto]
│   │   │   │       │   ├── inference-params.dto.ts   # Zod de UUIDs/path para recursos de inference [M2 | dto]
│   │   │   │       │   ├── inference-public.response.dto.ts   # Proyección HTTP sin secretos de inference, Zod + OpenAPI [M2 | dto]
│   │   │   │       │   └── list-serving-models.query.dto.ts   # Zod de entrada para GET /v1/models; valid/invalid/bounds [M2 | dto]
│   │   │   │       └── streaming/
│   │   │   │           ├── client-abort.handler.ts   # Propaga AbortSignal a vLLM y reembolsa reserva [M3 | special]
│   │   │   │           └── sse-frame.writer.ts   # Streaming OpenAI SSE, chunks + [DONE], sin buffering Caddy [M3 | special]
│   │   │   └── inference.module.ts   # Nest module: wiring de dominio, services, controllers y ports para inference [M2 | module]
│   │   ├── jobs/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── bullmq-job-reader.port.ts   # Puerto externo bullmq-job-reader para pruebas y adaptadores [M3 | port]
│   │   │   │   │   └── jobs.repository.port.ts   # Contrato de persistencia jobs; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-system-job.service.ts   # Caso de uso getSystemJob; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-system-jobs.service.ts   # Caso de uso listSystemJobs; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── stream-system-job-events.service.ts   # Caso de uso streamSystemJobEvents; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── job-detail-redaction.policy.ts   # Invariante/policy de negocio: job-detail-redaction; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── job-event.schema.ts   # Zod canónico y tipo inferido del dominio job-event; contratos no duplicados [M3 | domain]
│   │   │   │       └── system-job.schema.ts   # Zod canónico y tipo inferido del dominio system-job; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── bullmq-job-reader.adapter.ts   # Adaptador real de bullmq-job-reader, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── jobs.repository.ts   # Queries y transactions tenant-scoped de jobs [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de jobs; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── jobs.controller.ts   # Controller HTTP JobsController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── jobs.doc.ts   # Esquema OpenAPI 3.1 de jobs, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── jobs-params.dto.ts   # Zod de UUIDs/path para recursos de jobs [M3 | dto]
│   │   │   │           ├── jobs-public.response.dto.ts   # Proyección HTTP sin secretos de jobs, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── list-system-jobs.query.dto.ts   # Zod de entrada para GET /system/jobs; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── stream-system-job-events.query.dto.ts   # Zod de entrada para GET /system/jobs/{job_id}/events; valid/invalid/bounds [M3 | dto]
│   │   │   └── jobs.module.ts   # Nest module: wiring de dominio, services, controllers y ports para jobs [M3 | module]
│   │   ├── model-catalog/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── model-catalog.repository.port.ts   # Contrato de persistencia model-catalog; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   │   └── model-license-validator.port.ts   # Puerto externo model-license-validator para pruebas y adaptadores [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── archive-model.service.ts   # Caso de uso archiveModel; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-model-capabilities.service.ts   # Caso de uso getModelCapabilities; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── get-model-hardware-compatibility.service.ts   # Caso de uso getModelHardwareCompatibility; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── get-model.service.ts   # Caso de uso getModel; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── list-model-versions.service.ts   # Caso de uso listModelVersions; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-models.service.ts   # Caso de uso listModels; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── register-model-version.service.ts   # Caso de uso registerModelVersion; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── register-model.service.ts   # Caso de uso registerModel; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── update-model-metadata.service.ts   # Caso de uso updateModelMetadata; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       └── validate-model-manifest.service.ts   # Caso de uso validateModelManifest; policy, transacción, puertos y métricas [M2 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── manifest-validity.policy.ts   # Invariante/policy de negocio: manifest-validity; sin dependencia de HTTP [M2 | domain]
│   │   │   │   │   └── model-visibility.policy.ts   # Invariante/policy de negocio: model-visibility; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── model-capability.schema.ts   # Zod canónico y tipo inferido del dominio model-capability; contratos no duplicados [M2 | domain]
│   │   │   │       ├── model-license.schema.ts   # Zod canónico y tipo inferido del dominio model-license; contratos no duplicados [M2 | domain]
│   │   │   │       ├── model-revision.schema.ts   # Zod canónico y tipo inferido del dominio model-revision; contratos no duplicados [M2 | domain]
│   │   │   │       └── model.schema.ts   # Zod canónico y tipo inferido del dominio model; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── model-license-validator.adapter.ts   # Adaptador real de model-license-validator, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── model-catalog.repository.ts   # Queries y transactions tenant-scoped de model-catalog [M2 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de model-catalog; migración revisada [M2 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── model-catalog.controller.ts   # Controller HTTP ModelCatalogController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── model-catalog.doc.ts   # Esquema OpenAPI 3.1 de model-catalog, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── archive-model.request.dto.ts   # Zod de entrada para POST /models/{model_id}/archive; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-model-versions.query.dto.ts   # Zod de entrada para GET /models/{model_id}/versions; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-models.query.dto.ts   # Zod de entrada para GET O/models; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── model-catalog-params.dto.ts   # Zod de UUIDs/path para recursos de model-catalog [M2 | dto]
│   │   │   │           ├── model-catalog-public.response.dto.ts   # Proyección HTTP sin secretos de model-catalog, Zod + OpenAPI [M2 | dto]
│   │   │   │           ├── register-model-version.request.dto.ts   # Zod de entrada para POST /models/{model_id}/versions; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── register-model.request.dto.ts   # Zod de entrada para POST O/models; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── update-model-metadata.request.dto.ts   # Zod de entrada para PATCH /models/{model_id}; valid/invalid/bounds [M2 | dto]
│   │   │   │           └── validate-model-manifest.request.dto.ts   # Zod de entrada para POST O/models/validate; valid/invalid/bounds [M2 | dto]
│   │   │   └── model-catalog.module.ts   # Nest module: wiring de dominio, services, controllers y ports para model-catalog [M2 | module]
│   │   ├── model-deployments/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── approved-runtime-provisioner.port.ts   # Puerto externo approved-runtime-provisioner para pruebas y adaptadores [M2 | port]
│   │   │   │   │   ├── model-deployments.repository.port.ts   # Contrato de persistencia model-deployments; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   │   └── vllm-health.port.ts   # Puerto externo vllm-health para pruebas y adaptadores [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── activate-deployment.service.ts   # Caso de uso activateDeployment; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-deployment-logs.service.ts   # Caso de uso getDeploymentLogs; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-deployment-metrics.service.ts   # Caso de uso getDeploymentMetrics; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-deployment.service.ts   # Caso de uso getDeployment; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── list-approved-runtime-profiles.service.ts   # Caso de uso listApprovedRuntimeProfiles; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── list-deployments.service.ts   # Caso de uso listDeployments; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── register-deployment.service.ts   # Caso de uso registerDeployment; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── rollback-deployment.service.ts   # Caso de uso rollbackDeployment; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── stop-deployment.service.ts   # Caso de uso stopDeployment; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── stream-deployment-events.service.ts   # Caso de uso streamDeploymentEvents; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── deployment-compatibility.policy.ts   # Invariante/policy de negocio: deployment-compatibility; sin dependencia de HTTP [M2 | domain]
│   │   │   │   │   └── state-transitions.policy.ts   # Invariante/policy de negocio: state-transitions; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── deployment-revision.schema.ts   # Zod canónico y tipo inferido del dominio deployment-revision; contratos no duplicados [M2 | domain]
│   │   │   │       ├── deployment.schema.ts   # Zod canónico y tipo inferido del dominio deployment; contratos no duplicados [M2 | domain]
│   │   │   │       └── runtime-profile.schema.ts   # Zod canónico y tipo inferido del dominio runtime-profile; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── approved-runtime-provisioner.adapter.ts   # Adaptador real de approved-runtime-provisioner, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   │   └── vllm-health.adapter.ts   # Adaptador real de vllm-health, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   ├── persistence/
│   │   │   │   │   └── drizzle/
│   │   │   │   │       ├── model-deployments.repository.ts   # Queries y transactions tenant-scoped de model-deployments [M2 | db]
│   │   │   │   │       └── schema.ts   # Tablas, índices y constraints de model-deployments; migración revisada [M2 | db]
│   │   │   │   └── workers/
│   │   │   │       └── deployment-reconciler.consumer.ts   # Reconcile desired/observed sin docker.sock en API [M3 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── model-deployments.controller.ts   # Controller HTTP ModelDeploymentsController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── model-deployments.doc.ts   # Esquema OpenAPI 3.1 de model-deployments, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── activate-deployment.request.dto.ts   # Zod de entrada para POST /deployments/{deployment_id}/activate; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-deployment-metrics.query.dto.ts   # Zod de entrada para GET /deployments/{deployment_id}/metrics; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-approved-runtime-profiles.query.dto.ts   # Zod de entrada para GET /runtime-profiles; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── list-deployments.query.dto.ts   # Zod de entrada para GET O/deployments; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── model-deployments-params.dto.ts   # Zod de UUIDs/path para recursos de model-deployments [M2 | dto]
│   │   │   │           ├── model-deployments-public.response.dto.ts   # Proyección HTTP sin secretos de model-deployments, Zod + OpenAPI [M2 | dto]
│   │   │   │           ├── register-deployment.request.dto.ts   # Zod de entrada para POST O/deployments; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── rollback-deployment.request.dto.ts   # Zod de entrada para POST /deployments/{deployment_id}/rollback; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── stop-deployment.request.dto.ts   # Zod de entrada para POST /deployments/{deployment_id}/stop; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── stream-deployment-events.query.dto.ts   # Zod de entrada para GET /deployments/{deployment_id}/events; valid/invalid/bounds [M3 | dto]
│   │   │   └── model-deployments.module.ts   # Nest module: wiring de dominio, services, controllers y ports para model-deployments [M2 | module]
│   │   ├── model-imports/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── allowlisted-model-downloader.port.ts   # Puerto externo allowlisted-model-downloader para pruebas y adaptadores [M3 | port]
│   │   │   │   │   └── model-imports.repository.port.ts   # Contrato de persistencia model-imports; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── cancel-model-import.service.ts   # Caso de uso cancelModelImport; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-model-import.service.ts   # Caso de uso getModelImport; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-model-imports.service.ts   # Caso de uso listModelImports; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── start-model-import.service.ts   # Caso de uso startModelImport; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── stream-model-import-events.service.ts   # Caso de uso streamModelImportEvents; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── trusted-model-source.policy.ts   # Invariante/policy de negocio: trusted-model-source; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── import-job.schema.ts   # Zod canónico y tipo inferido del dominio import-job; contratos no duplicados [M3 | domain]
│   │   │   │       └── model-import.schema.ts   # Zod canónico y tipo inferido del dominio model-import; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── allowlisted-model-downloader.adapter.ts   # Adaptador real de allowlisted-model-downloader, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── model-imports.repository.ts   # Queries y transactions tenant-scoped de model-imports [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de model-imports; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── model-imports.controller.ts   # Controller HTTP ModelImportsController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── model-imports.doc.ts   # Esquema OpenAPI 3.1 de model-imports, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── cancel-model-import.request.dto.ts   # Zod de entrada para POST /model-imports/{import_id}/cancel; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-model-imports.query.dto.ts   # Zod de entrada para GET O/model-imports; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── model-imports-params.dto.ts   # Zod de UUIDs/path para recursos de model-imports [M3 | dto]
│   │   │   │           ├── model-imports-public.response.dto.ts   # Proyección HTTP sin secretos de model-imports, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── start-model-import.request.dto.ts   # Zod de entrada para POST O/model-imports; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── stream-model-import-events.query.dto.ts   # Zod de entrada para GET /model-imports/{import_id}/events; valid/invalid/bounds [M3 | dto]
│   │   │   └── model-imports.module.ts   # Nest module: wiring de dominio, services, controllers y ports para model-imports [M3 | module]
│   │   ├── notifications/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── notifications.repository.port.ts   # Contrato de persistencia notifications; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   │   └── smtp-notification.port.ts   # Puerto externo smtp-notification para pruebas y adaptadores [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── create-notification-channel.service.ts   # Caso de uso createNotificationChannel; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-notification-channels.service.ts   # Caso de uso listNotificationChannels; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── test-notification-channel.service.ts   # Caso de uso testNotificationChannel; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── update-notification-channel.service.ts   # Caso de uso updateNotificationChannel; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── notification-channel-ownership.policy.ts   # Invariante/policy de negocio: notification-channel-ownership; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── notification-channel.schema.ts   # Zod canónico y tipo inferido del dominio notification-channel; contratos no duplicados [M3 | domain]
│   │   │   │       └── notification-delivery.schema.ts   # Zod canónico y tipo inferido del dominio notification-delivery; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── smtp-notification.adapter.ts   # Adaptador real de smtp-notification, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   ├── persistence/
│   │   │   │   │   └── drizzle/
│   │   │   │   │       ├── notifications.repository.ts   # Queries y transactions tenant-scoped de notifications [M3 | db]
│   │   │   │   │       └── schema.ts   # Tablas, índices y constraints de notifications; migración revisada [M3 | db]
│   │   │   │   └── workers/
│   │   │   │       └── notification.consumer.ts   # Encola y envía notifications con backoff y dedupe [M3 | special]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── notifications.controller.ts   # Controller HTTP NotificationsController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── notifications.doc.ts   # Esquema OpenAPI 3.1 de notifications, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── create-notification-channel.request.dto.ts   # Zod de entrada para POST O/notification-channels; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-notification-channels.query.dto.ts   # Zod de entrada para GET O/notification-channels; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── notifications-params.dto.ts   # Zod de UUIDs/path para recursos de notifications [M3 | dto]
│   │   │   │           ├── notifications-public.response.dto.ts   # Proyección HTTP sin secretos de notifications, Zod + OpenAPI [M3 | dto]
│   │   │   │           ├── test-notification-channel.request.dto.ts   # Zod de entrada para POST /notification-channels/{channel_id}/test; valid/invalid/bounds [M3 | dto]
│   │   │   │           └── update-notification-channel.request.dto.ts   # Zod de entrada para PATCH /notification-channels/{channel_id}; valid/invalid/bounds [M3 | dto]
│   │   │   └── notifications.module.ts   # Nest module: wiring de dominio, services, controllers y ports para notifications [M3 | module]
│   │   ├── observability-queries/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── observability-queries.repository.port.ts   # Contrato de persistencia observability-queries; sin ORM acoplado a aplicación [M3 | port]
│   │   │   │   │   └── prometheus-query.port.ts   # Puerto externo prometheus-query para pruebas y adaptadores [M3 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-error-metrics.service.ts   # Caso de uso getErrorMetrics; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-latency-metrics.service.ts   # Caso de uso getLatencyMetrics; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── get-organization-metrics.service.ts   # Caso de uso getOrganizationMetrics; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── metrics-visibility.policy.ts   # Invariante/policy de negocio: metrics-visibility; sin dependencia de HTTP [M3 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── error-summary.schema.ts   # Zod canónico y tipo inferido del dominio error-summary; contratos no duplicados [M3 | domain]
│   │   │   │       ├── latency-summary.schema.ts   # Zod canónico y tipo inferido del dominio latency-summary; contratos no duplicados [M3 | domain]
│   │   │   │       └── metrics-overview.schema.ts   # Zod canónico y tipo inferido del dominio metrics-overview; contratos no duplicados [M3 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── prometheus-query.adapter.ts   # Adaptador real de prometheus-query, timeout/errores/telemetría [M3 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── observability-queries.repository.ts   # Queries y transactions tenant-scoped de observability-queries [M3 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de observability-queries; migración revisada [M3 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── metrics.controller.ts   # Controller HTTP MetricsController; delega operationIds, DTO, authz y error mapping [M3 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── observability-queries.doc.ts   # Esquema OpenAPI 3.1 de observability-queries, derivado de DTO sin copiar modelo [M3 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── get-error-metrics.query.dto.ts   # Zod de entrada para GET O/metrics/errors; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-latency-metrics.query.dto.ts   # Zod de entrada para GET O/metrics/latency; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-organization-metrics.query.dto.ts   # Zod de entrada para GET O/metrics/overview; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── observability-queries-params.dto.ts   # Zod de UUIDs/path para recursos de observability-queries [M3 | dto]
│   │   │   │           └── observability-queries-public.response.dto.ts   # Proyección HTTP sin secretos de observability-queries, Zod + OpenAPI [M3 | dto]
│   │   │   └── observability-queries.module.ts   # Nest module: wiring de dominio, services, controllers y ports para observability-queries [M3 | module]
│   │   ├── organizations/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── member-mailer.port.ts   # Puerto externo member-mailer para pruebas y adaptadores [M1 | port]
│   │   │   │   │   └── organizations.repository.port.ts   # Contrato de persistencia organizations; sin ORM acoplado a aplicación [M1 | port]
│   │   │   │   └── services/
│   │   │   │       ├── accept-invitation.service.ts   # Caso de uso acceptInvitation; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── change-member-role.service.ts   # Caso de uso changeMemberRole; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── get-organization.service.ts   # Caso de uso getOrganization; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── invite-organization-member.service.ts   # Caso de uso inviteOrganizationMember; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── list-invitations.service.ts   # Caso de uso listInvitations; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── list-my-organizations.service.ts   # Caso de uso listMyOrganizations; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── list-organization-members.service.ts   # Caso de uso listOrganizationMembers; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── register-organization.service.ts   # Caso de uso registerOrganization; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── remove-organization-member.service.ts   # Caso de uso removeOrganizationMember; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── revoke-invitation.service.ts   # Caso de uso revokeInvitation; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       └── update-organization.service.ts   # Caso de uso updateOrganization; policy, transacción, puertos y métricas [M1 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── invitation-acceptance.policy.ts   # Invariante/policy de negocio: invitation-acceptance; sin dependencia de HTTP [M1 | domain]
│   │   │   │   │   └── last-owner-protection.policy.ts   # Invariante/policy de negocio: last-owner-protection; sin dependencia de HTTP [M1 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── invitation.schema.ts   # Zod canónico y tipo inferido del dominio invitation; contratos no duplicados [M1 | domain]
│   │   │   │       ├── member.schema.ts   # Zod canónico y tipo inferido del dominio member; contratos no duplicados [M1 | domain]
│   │   │   │       └── organization.schema.ts   # Zod canónico y tipo inferido del dominio organization; contratos no duplicados [M1 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── member-mailer.adapter.ts   # Adaptador real de member-mailer, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── organizations.repository.ts   # Queries y transactions tenant-scoped de organizations [M1 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de organizations; migración revisada [M1 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   ├── invitations.controller.ts   # Controller HTTP InvitationsController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       │   ├── members.controller.ts   # Controller HTTP MembersController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       │   └── organizations.controller.ts   # Controller HTTP OrganizationsController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── organizations.doc.ts   # Esquema OpenAPI 3.1 de organizations, derivado de DTO sin copiar modelo [M1 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── accept-invitation.request.dto.ts   # Zod de entrada para POST /invitations/accept; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── change-member-role.request.dto.ts   # Zod de entrada para PATCH O/members/{member_id}; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── invite-organization-member.request.dto.ts   # Zod de entrada para POST O/invitations; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── list-invitations.query.dto.ts   # Zod de entrada para GET O/invitations; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── list-my-organizations.query.dto.ts   # Zod de entrada para GET /organizations; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── list-organization-members.query.dto.ts   # Zod de entrada para GET O/members; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── organizations-params.dto.ts   # Zod de UUIDs/path para recursos de organizations [M1 | dto]
│   │   │   │           ├── organizations-public.response.dto.ts   # Proyección HTTP sin secretos de organizations, Zod + OpenAPI [M1 | dto]
│   │   │   │           ├── register-organization.request.dto.ts   # Zod de entrada para POST /organizations; valid/invalid/bounds [M1 | dto]
│   │   │   │           ├── revoke-invitation.request.dto.ts   # Zod de entrada para POST O/invitations/{invitation_id}/revoke; valid/invalid/bounds [M1 | dto]
│   │   │   │           └── update-organization.request.dto.ts   # Zod de entrada para PATCH /organizations/{organization_id}; valid/invalid/bounds [M1 | dto]
│   │   │   └── organizations.module.ts   # Nest module: wiring de dominio, services, controllers y ports para organizations [M1 | module]
│   │   ├── playground/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── generation-stream.port.ts   # Puerto externo generation-stream para pruebas y adaptadores [M2 | port]
│   │   │   │   │   └── playground.repository.port.ts   # Contrato de persistencia playground; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── compare-playground-generations.service.ts   # Caso de uso comparePlaygroundGenerations; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── create-playground-session.service.ts   # Caso de uso createPlaygroundSession; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── delete-playground-session.service.ts   # Caso de uso deletePlaygroundSession; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── generate-playground-completion.service.ts   # Caso de uso generatePlaygroundCompletion; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── get-playground-session.service.ts   # Caso de uso getPlaygroundSession; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── list-playground-sessions.service.ts   # Caso de uso listPlaygroundSessions; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       └── update-playground-session.service.ts   # Caso de uso updatePlaygroundSession; policy, transacción, puertos y métricas [M2 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── session-model-access.policy.ts   # Invariante/policy de negocio: session-model-access; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── playground-message.schema.ts   # Zod canónico y tipo inferido del dominio playground-message; contratos no duplicados [M2 | domain]
│   │   │   │       └── playground-session.schema.ts   # Zod canónico y tipo inferido del dominio playground-session; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── generation-stream.adapter.ts   # Adaptador real de generation-stream, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── playground.repository.ts   # Queries y transactions tenant-scoped de playground [M2 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de playground; migración revisada [M2 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── playground.controller.ts   # Controller HTTP PlaygroundController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── playground.doc.ts   # Esquema OpenAPI 3.1 de playground, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── compare-playground-generations.request.dto.ts   # Zod de entrada para POST /playground/generations/compare; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── create-playground-session.request.dto.ts   # Zod de entrada para POST O/playground/sessions; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── generate-playground-completion.request.dto.ts   # Zod de entrada para POST /playground/sessions/{session_id}/generations; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── list-playground-sessions.query.dto.ts   # Zod de entrada para GET O/playground/sessions; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── playground-params.dto.ts   # Zod de UUIDs/path para recursos de playground [M2 | dto]
│   │   │   │           ├── playground-public.response.dto.ts   # Proyección HTTP sin secretos de playground, Zod + OpenAPI [M2 | dto]
│   │   │   │           └── update-playground-session.request.dto.ts   # Zod de entrada para PATCH /playground/sessions/{session_id}; valid/invalid/bounds [M2 | dto]
│   │   │   └── playground.module.ts   # Nest module: wiring de dominio, services, controllers y ports para playground [M2 | module]
│   │   ├── quotas/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── postgres-reservation-store.port.ts   # Puerto externo postgres-reservation-store para pruebas y adaptadores [M2 | port]
│   │   │   │   │   └── quotas.repository.port.ts   # Contrato de persistencia quotas; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-current-quota-usage.service.ts   # Caso de uso getCurrentQuotaUsage; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── list-quotas.service.ts   # Caso de uso listQuotas; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       └── update-quota.service.ts   # Caso de uso updateQuota; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── atomic-reservation.policy.ts   # Invariante/policy de negocio: atomic-reservation; sin dependencia de HTTP [M2 | domain]
│   │   │   │   │   └── budget-settlement.policy.ts   # Invariante/policy de negocio: budget-settlement; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── quota.schema.ts   # Zod canónico y tipo inferido del dominio quota; contratos no duplicados [M2 | domain]
│   │   │   │       └── token-reservation.schema.ts   # Zod canónico y tipo inferido del dominio token-reservation; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── postgres-reservation-store.adapter.ts   # Adaptador real de postgres-reservation-store, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── atomic-reservation.repository.ts   # Reserva idempotente transaccional con row locking [M3 | special]
│   │   │   │           ├── quotas.repository.ts   # Queries y transactions tenant-scoped de quotas [M2 | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de quotas; migración revisada [M2 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── quotas.controller.ts   # Controller HTTP QuotasController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── quotas.doc.ts   # Esquema OpenAPI 3.1 de quotas, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── get-current-quota-usage.query.dto.ts   # Zod de entrada para GET O/quota-usage; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── list-quotas.query.dto.ts   # Zod de entrada para GET O/quotas; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── quotas-params.dto.ts   # Zod de UUIDs/path para recursos de quotas [M2 | dto]
│   │   │   │           ├── quotas-public.response.dto.ts   # Proyección HTTP sin secretos de quotas, Zod + OpenAPI [M2 | dto]
│   │   │   │           └── update-quota.request.dto.ts   # Zod de entrada para PATCH O/quotas/{quota_id}; valid/invalid/bounds [M3 | dto]
│   │   │   └── quotas.module.ts   # Nest module: wiring de dominio, services, controllers y ports para quotas [M2 | module]
│   │   ├── request-routing/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── request-routing.repository.port.ts   # Contrato de persistencia request-routing; sin ORM acoplado a aplicación [S+ | port]
│   │   │   │   │   └── runtime-health-monitor.port.ts   # Puerto externo runtime-health-monitor para pruebas y adaptadores [S+ | port]
│   │   │   │   └── services/
│   │   │   │       ├── activate-routing-policy.service.ts   # Caso de uso activateRoutingPolicy; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── create-routing-policy.service.ts   # Caso de uso createRoutingPolicy; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── get-routing-policy.service.ts   # Caso de uso getRoutingPolicy; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       ├── list-routing-policies.service.ts   # Caso de uso listRoutingPolicies; policy, transacción, puertos y métricas [S+ | service]
│   │   │   │       └── update-routing-policy.service.ts   # Caso de uso updateRoutingPolicy; policy, transacción, puertos y métricas [S+ | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   ├── fallback-eligibility.policy.ts   # Invariante/policy de negocio: fallback-eligibility; sin dependencia de HTTP [S+ | domain]
│   │   │   │   │   └── healthy-route-selection.policy.ts   # Invariante/policy de negocio: healthy-route-selection; sin dependencia de HTTP [S+ | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── routing-policy.schema.ts   # Zod canónico y tipo inferido del dominio routing-policy; contratos no duplicados [S+ | domain]
│   │   │   │       └── routing-route.schema.ts   # Zod canónico y tipo inferido del dominio routing-route; contratos no duplicados [S+ | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── runtime-health-monitor.adapter.ts   # Adaptador real de runtime-health-monitor, timeout/errores/telemetría [S+ | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── request-routing.repository.ts   # Queries y transactions tenant-scoped de request-routing [S+ | db]
│   │   │   │           └── schema.ts   # Tablas, índices y constraints de request-routing; migración revisada [S+ | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── routing-policies.controller.ts   # Controller HTTP RoutingPoliciesController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── request-routing.doc.ts   # Esquema OpenAPI 3.1 de request-routing, derivado de DTO sin copiar modelo [S+ | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── activate-routing-policy.request.dto.ts   # Zod de entrada para POST /routing-policies/{policy_id}/activate; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── create-routing-policy.request.dto.ts   # Zod de entrada para POST O/routing-policies; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── list-routing-policies.query.dto.ts   # Zod de entrada para GET O/routing-policies; valid/invalid/bounds [S+ | dto]
│   │   │   │           ├── request-routing-params.dto.ts   # Zod de UUIDs/path para recursos de request-routing [S+ | dto]
│   │   │   │           ├── request-routing-public.response.dto.ts   # Proyección HTTP sin secretos de request-routing, Zod + OpenAPI [S+ | dto]
│   │   │   │           └── update-routing-policy.request.dto.ts   # Zod de entrada para PATCH /routing-policies/{policy_id}; valid/invalid/bounds [S+ | dto]
│   │   │   └── request-routing.module.ts   # Nest module: wiring de dominio, services, controllers y ports para request-routing [S+ | module]
│   │   ├── system/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── readiness-probe.port.ts   # Puerto externo readiness-probe para pruebas y adaptadores [M1 | port]
│   │   │   │   │   └── system.repository.port.ts   # Contrato de persistencia system; sin ORM acoplado a aplicación [M1 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-liveness.service.ts   # Caso de uso getLiveness; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── get-readiness.service.ts   # Caso de uso getReadiness; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── get-system-capabilities.service.ts   # Caso de uso getSystemCapabilities; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── get-system-settings.service.ts   # Caso de uso getSystemSettings; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-system-status.service.ts   # Caso de uso getSystemStatus; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       ├── get-system-version.service.ts   # Caso de uso getSystemVersion; policy, transacción, puertos y métricas [M1 | service]
│   │   │   │       └── update-system-settings.service.ts   # Caso de uso updateSystemSettings; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── instance-access.policy.ts   # Invariante/policy de negocio: instance-access; sin dependencia de HTTP [M1 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── instance-setting.schema.ts   # Zod canónico y tipo inferido del dominio instance-setting; contratos no duplicados [M1 | domain]
│   │   │   │       ├── system-capability.schema.ts   # Zod canónico y tipo inferido del dominio system-capability; contratos no duplicados [M1 | domain]
│   │   │   │       └── system-state.schema.ts   # Zod canónico y tipo inferido del dominio system-state; contratos no duplicados [M1 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── readiness-probe.adapter.ts   # Adaptador real de readiness-probe, timeout/errores/telemetría [M1 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── schema.ts   # Tablas, índices y constraints de system; migración revisada [M1 | db]
│   │   │   │           └── system.repository.ts   # Queries y transactions tenant-scoped de system [M1 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   ├── health.controller.ts   # Controller HTTP HealthController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       │   └── system.controller.ts   # Controller HTTP SystemController; delega operationIds, DTO, authz y error mapping [M1 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── system.doc.ts   # Esquema OpenAPI 3.1 de system, derivado de DTO sin copiar modelo [M1 | openapi]
│   │   │   │       ├── dto/
│   │   │   │       │   ├── system-params.dto.ts   # Zod de UUIDs/path para recursos de system [M1 | dto]
│   │   │   │       │   ├── system-public.response.dto.ts   # Proyección HTTP sin secretos de system, Zod + OpenAPI [M1 | dto]
│   │   │   │       │   └── update-system-settings.request.dto.ts   # Zod de entrada para PATCH /system/settings; valid/invalid/bounds [M3 | dto]
│   │   │   │       └── guards/
│   │   │   │           └── instance-admin.guard.ts   # Separación instance admin vs org admin [M3 | special]
│   │   │   └── system.module.ts   # Nest module: wiring de dominio, services, controllers y ports para system [M1 | module]
│   │   ├── usage-ledger/
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── usage-aggregator.port.ts   # Puerto externo usage-aggregator para pruebas y adaptadores [M2 | port]
│   │   │   │   │   └── usage-ledger.repository.port.ts   # Contrato de persistencia usage-ledger; sin ORM acoplado a aplicación [M2 | port]
│   │   │   │   └── services/
│   │   │   │       ├── get-inference-request-summary.service.ts   # Caso de uso getInferenceRequestSummary; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-usage-by-key.service.ts   # Caso de uso getUsageByKey; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-usage-by-model.service.ts   # Caso de uso getUsageByModel; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-usage-export.service.ts   # Caso de uso getUsageExport; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── get-usage-summary.service.ts   # Caso de uso getUsageSummary; policy, transacción, puertos y métricas [M2 | service]
│   │   │   │       ├── get-usage-timeseries.service.ts   # Caso de uso getUsageTimeseries; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       ├── list-inference-requests.service.ts   # Caso de uso listInferenceRequests; policy, transacción, puertos y métricas [M3 | service]
│   │   │   │       └── request-usage-export.service.ts   # Caso de uso requestUsageExport; policy, transacción, puertos y métricas [M3 | service]
│   │   │   ├── domain/
│   │   │   │   ├── policies/
│   │   │   │   │   └── usage-redaction.policy.ts   # Invariante/policy de negocio: usage-redaction; sin dependencia de HTTP [M2 | domain]
│   │   │   │   └── schemas/
│   │   │   │       ├── inference-request-summary.schema.ts   # Zod canónico y tipo inferido del dominio inference-request-summary; contratos no duplicados [M2 | domain]
│   │   │   │       └── usage-entry.schema.ts   # Zod canónico y tipo inferido del dominio usage-entry; contratos no duplicados [M2 | domain]
│   │   │   ├── infrastructure/
│   │   │   │   ├── adapters/
│   │   │   │   │   └── usage-aggregator.adapter.ts   # Adaptador real de usage-aggregator, timeout/errores/telemetría [M2 | adapter]
│   │   │   │   └── persistence/
│   │   │   │       └── drizzle/
│   │   │   │           ├── schema.ts   # Tablas, índices y constraints de usage-ledger; migración revisada [M2 | db]
│   │   │   │           ├── usage-entry.repository.ts   # Libro contable inmutable/conciliación por request_id [M3 | special]
│   │   │   │           └── usage-ledger.repository.ts   # Queries y transactions tenant-scoped de usage-ledger [M2 | db]
│   │   │   ├── presentation/
│   │   │   │   └── http/
│   │   │   │       ├── controllers/
│   │   │   │       │   └── usage.controller.ts   # Controller HTTP UsageController; delega operationIds, DTO, authz y error mapping [M2 | controller]
│   │   │   │       ├── docs/
│   │   │   │       │   └── usage-ledger.doc.ts   # Esquema OpenAPI 3.1 de usage-ledger, derivado de DTO sin copiar modelo [M2 | openapi]
│   │   │   │       └── dto/
│   │   │   │           ├── get-inference-request-summary.query.dto.ts   # Zod de entrada para GET /usage/requests/{request_id}; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-usage-by-key.query.dto.ts   # Zod de entrada para GET O/usage/by-key; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-usage-by-model.query.dto.ts   # Zod de entrada para GET O/usage/by-model; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-usage-export.query.dto.ts   # Zod de entrada para GET /usage/exports/{export_id}; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── get-usage-summary.query.dto.ts   # Zod de entrada para GET O/usage/summary; valid/invalid/bounds [M2 | dto]
│   │   │   │           ├── get-usage-timeseries.query.dto.ts   # Zod de entrada para GET O/usage/timeseries; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── list-inference-requests.query.dto.ts   # Zod de entrada para GET O/usage/requests; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── request-usage-export.request.dto.ts   # Zod de entrada para POST O/usage/exports; valid/invalid/bounds [M3 | dto]
│   │   │   │           ├── usage-ledger-params.dto.ts   # Zod de UUIDs/path para recursos de usage-ledger [M2 | dto]
│   │   │   │           └── usage-ledger-public.response.dto.ts   # Proyección HTTP sin secretos de usage-ledger, Zod + OpenAPI [M2 | dto]
│   │   │   └── usage-ledger.module.ts   # Nest module: wiring de dominio, services, controllers y ports para usage-ledger [M2 | module]
│   │   └── webhooks/
│   │       ├── application/
│   │       │   ├── ports/
│   │       │   │   ├── safe-webhook-sender.port.ts   # Puerto externo safe-webhook-sender para pruebas y adaptadores [S+ | port]
│   │       │   │   └── webhooks.repository.port.ts   # Contrato de persistencia webhooks; sin ORM acoplado a aplicación [S+ | port]
│   │       │   └── services/
│   │       │       ├── create-webhook.service.ts   # Caso de uso createWebhook; policy, transacción, puertos y métricas [S+ | service]
│   │       │       ├── list-webhook-deliveries.service.ts   # Caso de uso listWebhookDeliveries; policy, transacción, puertos y métricas [S+ | service]
│   │       │       ├── list-webhooks.service.ts   # Caso de uso listWebhooks; policy, transacción, puertos y métricas [S+ | service]
│   │       │       ├── rotate-webhook-secret.service.ts   # Caso de uso rotateWebhookSecret; policy, transacción, puertos y métricas [S+ | service]
│   │       │       └── update-webhook.service.ts   # Caso de uso updateWebhook; policy, transacción, puertos y métricas [S+ | service]
│   │       ├── domain/
│   │       │   ├── policies/
│   │       │   │   ├── webhook-egress.policy.ts   # Invariante/policy de negocio: webhook-egress; sin dependencia de HTTP [S+ | domain]
│   │       │   │   └── webhook-signature.policy.ts   # Invariante/policy de negocio: webhook-signature; sin dependencia de HTTP [S+ | domain]
│   │       │   └── schemas/
│   │       │       ├── webhook-delivery.schema.ts   # Zod canónico y tipo inferido del dominio webhook-delivery; contratos no duplicados [S+ | domain]
│   │       │       └── webhook.schema.ts   # Zod canónico y tipo inferido del dominio webhook; contratos no duplicados [S+ | domain]
│   │       ├── infrastructure/
│   │       │   ├── adapters/
│   │       │   │   └── safe-webhook-sender.adapter.ts   # Adaptador real de safe-webhook-sender, timeout/errores/telemetría [S+ | adapter]
│   │       │   ├── persistence/
│   │       │   │   └── drizzle/
│   │       │   │       ├── schema.ts   # Tablas, índices y constraints de webhooks; migración revisada [S+ | db]
│   │       │   │       └── webhooks.repository.ts   # Queries y transactions tenant-scoped de webhooks [S+ | db]
│   │       │   └── workers/
│   │       │       └── webhook-delivery.consumer.ts   # Firmas HMAC, DNS re-resolve, redirects prohibidos, backoff [M3 | special]
│   │       ├── presentation/
│   │       │   └── http/
│   │       │       ├── controllers/
│   │       │       │   └── webhooks.controller.ts   # Controller HTTP WebhooksController; delega operationIds, DTO, authz y error mapping [S+ | controller]
│   │       │       ├── docs/
│   │       │       │   └── webhooks.doc.ts   # Esquema OpenAPI 3.1 de webhooks, derivado de DTO sin copiar modelo [S+ | openapi]
│   │       │       └── dto/
│   │       │           ├── create-webhook.request.dto.ts   # Zod de entrada para POST O/webhooks; valid/invalid/bounds [S+ | dto]
│   │       │           ├── list-webhook-deliveries.query.dto.ts   # Zod de entrada para GET /webhooks/{webhook_id}/deliveries; valid/invalid/bounds [S+ | dto]
│   │       │           ├── list-webhooks.query.dto.ts   # Zod de entrada para GET O/webhooks; valid/invalid/bounds [S+ | dto]
│   │       │           ├── rotate-webhook-secret.request.dto.ts   # Zod de entrada para POST /webhooks/{webhook_id}/rotate-secret; valid/invalid/bounds [S+ | dto]
│   │       │           ├── update-webhook.request.dto.ts   # Zod de entrada para PATCH /webhooks/{webhook_id}; valid/invalid/bounds [S+ | dto]
│   │       │           ├── webhooks-params.dto.ts   # Zod de UUIDs/path para recursos de webhooks [S+ | dto]
│   │       │           └── webhooks-public.response.dto.ts   # Proyección HTTP sin secretos de webhooks, Zod + OpenAPI [S+ | dto]
│   │       └── webhooks.module.ts   # Nest module: wiring de dominio, services, controllers y ports para webhooks [S+ | module]
│   ├── shared/
│   │   ├── data/
│   │   │   └── transaction-manager.port.ts   # Puerto de transacción atómica sin Drizzle acoplado [Foundation | base]
│   │   ├── events/
│   │   │   ├── outbox-dispatcher.ts   # Despacho idempotente de outbox [Foundation | base]
│   │   │   ├── outbox-event.schema.ts   # Evento versionado y compatible [Foundation | base]
│   │   │   └── processed-event.repository.ts   # Deduplicación de consumo en PostgreSQL [Foundation | base]
│   │   ├── http/
│   │   │   ├── decorators/
│   │   │   │   ├── current-principal.decorator.ts   # Principal autenticado y contexto de sesión [Foundation | base]
│   │   │   │   └── idempotency-key.decorator.ts   # Validación de cabecera Idempotency-Key [Foundation | base]
│   │   │   ├── dto/
│   │   │   │   ├── offset-pagination.query.dto.ts   # Zod limit/offset/sort y validación de límites [Foundation | base]
│   │   │   │   ├── paginator.response.dto.ts   # Envelope canónico count/next/previous/results [Foundation | base]
│   │   │   │   └── problem-details.response.dto.ts   # Errores RFC9457 sin datos sensibles [Foundation | base]
│   │   │   ├── filters/
│   │   │   │   └── problem-details.filter.ts   # Mapea errores tipados a Problem Details [Foundation | base]
│   │   │   ├── guards/
│   │   │   │   └── private-by-default.guard.ts   # Por defecto deny; excepciones explícitas [Foundation | base]
│   │   │   ├── interceptors/
│   │   │   │   └── correlation-id.interceptor.ts   # Correlación de request y traza [Foundation | base]
│   │   │   └── pipes/
│   │   │       ├── zod-body.pipe.ts   # Validación y sanitización de body HTTP [Foundation | base]
│   │   │       ├── zod-params.pipe.ts   # Validación UUID y parámetros de path [Foundation | base]
│   │   │       └── zod-query.pipe.ts   # Validación de query HTTP [Foundation | base]
│   │   ├── observability/
│   │   │   ├── logger/
│   │   │   │   └── pino.factory.ts   # JSON logging estructurado y redacción [Foundation | base]
│   │   │   ├── metrics/
│   │   │   │   └── metric-registry.ts   # Registro de métricas estables [Foundation | base]
│   │   │   └── tracing/
│   │   │       └── span-attributes.ts   # Atributos OpenTelemetry de baja cardinalidad [Foundation | base]
│   │   ├── security/
│   │   │   ├── crypto/
│   │   │   │   ├── constant-time-compare.ts   # Comparación de hashes/credenciales sin timing leak [Foundation | base]
│   │   │   │   └── key-derivation.ts   # Derivación HKDF y rotación sin claves en código [Foundation | base]
│   │   │   ├── network/
│   │   │   │   └── ssrf-egress.policy.ts   # Bloquea IP privadas, redirects y destinos no autorizados [Foundation | base]
│   │   │   └── redaction/
│   │   │       └── redact-sensitive-fields.ts   # Redacta headers, prompts, credenciales y PII [Foundation | base]
│   │   └── tenancy/
│   │       ├── tenant-context.ts   # Principal + organización activa validada en servidor [Foundation | base]
│   │       └── tenant-scope.policy.ts   # Scoping/ACL SQL por tenant [Foundation | base]
│   ├── app.module.ts   # Composition root y provider wiring de módulos [Foundation | base]
│   ├── main.ts   # Entrypoint HTTP público protegido por Caddy [Foundation | base]
│   ├── migrate.main.ts   # Entrypoint migraciones one-shot, fuera del arranque HTTP [Foundation | base]
│   ├── outbox.main.ts   # Entrypoint outbox con SKIP LOCKED [Foundation | base]
│   ├── platform-setup.main.ts   # Bootstrap de instance owner con secreto de un uso [Foundation | base]
│   └── worker.main.ts   # Entrypoint BullMQ para jobs idempotentes [Foundation | base]
├── tests/
│   ├── bdd/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── mfa-step-up.feature   # BDD comportamiento observable: mfa-step-up.feature (owner identity) [M1 | bdd]
│   │   │   │   ├── otp-single-use.feature   # BDD comportamiento observable: otp-single-use.feature (owner identity) [M1 | bdd]
│   │   │   │   ├── session-refresh-reuse.feature   # BDD comportamiento observable: session-refresh-reuse.feature (owner identity) [M1 | bdd]
│   │   │   │   └── social-provider-linking.feature   # BDD comportamiento observable: social-provider-linking.feature (owner identity) [M1 | bdd]
│   │   │   ├── benchmark/
│   │   │   │   ├── promotion-rollback.feature   # BDD comportamiento observable: promotion-rollback.feature (owner experiments) [S+ | bdd]
│   │   │   │   └── reproducible-comparison.feature   # BDD comportamiento observable: reproducible-comparison.feature (owner benchmarks) [S+ | bdd]
│   │   │   ├── inference/
│   │   │   │   ├── playground-session-access.feature   # BDD comportamiento observable: playground-session-access.feature (owner playground) [M2 | bdd]
│   │   │   │   └── stream-abort-settlement.feature   # BDD comportamiento observable: stream-abort-settlement.feature (owner inference) [M2 | bdd]
│   │   │   ├── operations/
│   │   │   │   └── backup-restore-drill.feature   # BDD comportamiento observable: backup-restore-drill.feature (owner backups) [M3 | bdd]
│   │   │   ├── optimization/
│   │   │   │   ├── concurrency-budget.feature   # BDD comportamiento observable: concurrency-budget.feature (owner admission-control) [M2 | bdd]
│   │   │   │   └── fair-routing.feature   # BDD comportamiento observable: fair-routing.feature (owner request-routing) [S+ | bdd]
│   │   │   ├── organization/
│   │   │   │   └── invitation-last-owner.feature   # BDD comportamiento observable: invitation-last-owner.feature (owner organizations) [M1 | bdd]
│   │   │   ├── runtime/
│   │   │   │   └── deployment-transitions.feature   # BDD comportamiento observable: deployment-transitions.feature (owner model-deployments) [M2 | bdd]
│   │   │   ├── security/
│   │   │   │   ├── api-key-rotation.feature   # BDD comportamiento observable: api-key-rotation.feature (owner api-credentials) [M2 | bdd]
│   │   │   │   ├── tenant-authorization.feature   # BDD comportamiento observable: tenant-authorization.feature (owner authorization) [M1 | bdd]
│   │   │   │   └── webhook-ssrf.feature   # BDD comportamiento observable: webhook-ssrf.feature (owner webhooks) [S+ | bdd]
│   │   │   └── storage/
│   │   │       └── quarantine-before-download.feature   # BDD comportamiento observable: quarantine-before-download.feature (owner artifacts) [S+ | bdd]
│   │   ├── steps/
│   │   │   ├── auth.steps.ts   # Steps OTP, MFA, sesiones y proveedor social [M1 | bdd]
│   │   │   ├── inference.steps.ts   # Steps streaming y cancelación [M1 | bdd]
│   │   │   ├── operations.steps.ts   # Steps de jobs, backups y despliegues [M1 | bdd]
│   │   │   ├── optimization.steps.ts   # Steps fairness y bench reproducible [M1 | bdd]
│   │   │   ├── storage.steps.ts   # Steps upload en cuarentena [M1 | bdd]
│   │   │   └── tenancy.steps.ts   # Steps de organizaciones y recurso ajeno [M1 | bdd]
│   │   └── support/
│   │       ├── clock.ts   # Tiempo determinista sin sleeps [Foundation | bdd]
│   │       ├── cucumber-report.ts   # Reporte JSON y JUnit libre de datos privados [Foundation | bdd]
│   │       ├── factories.ts   # Fixtures in-memory de BDD [Foundation | bdd]
│   │       └── world.ts   # World sin estado compartido entre escenarios [Foundation | bdd]
│   ├── contract/
│   │   ├── browser-safe-dtos.spec.ts   # No filtrar secretos/imports Node al browser [Foundation | test]
│   │   ├── openai-compatibility.spec.ts   # Wire format OpenAI y errores compatibles [Foundation | test]
│   │   ├── openapi-compatibility.spec.ts   # Asegura operationId únicos y esquema seguro [Foundation | test]
│   │   └── sse-event-contract.spec.ts   # Payload SSE bajo fragmentación y cancelación [Foundation | test]
│   ├── e2e/
│   │   ├── api/
│   │   │   ├── admission-control.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para admission-control [M2 | api-e2e]
│   │   │   ├── alerts.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para alerts [M3 | api-e2e]
│   │   │   ├── api-credentials.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para api-credentials [M2 | api-e2e]
│   │   │   ├── artifacts.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para artifacts [S+ | api-e2e]
│   │   │   ├── audit.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para audit [M3 | api-e2e]
│   │   │   ├── authorization.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para authorization [M1 | api-e2e]
│   │   │   ├── backups.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para backups [M3 | api-e2e]
│   │   │   ├── benchmarks.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para benchmarks [S+ | api-e2e]
│   │   │   ├── cost-estimates.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para cost-estimates [M3 | api-e2e]
│   │   │   ├── datasets.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para datasets [S+ | api-e2e]
│   │   │   ├── experiments.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para experiments [S+ | api-e2e]
│   │   │   ├── gpu-nodes.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para gpu-nodes [M3 | api-e2e]
│   │   │   ├── identity.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para identity [M1 | api-e2e]
│   │   │   ├── inference.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para inference [M2 | api-e2e]
│   │   │   ├── jobs.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para jobs [M3 | api-e2e]
│   │   │   ├── model-catalog.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para model-catalog [M2 | api-e2e]
│   │   │   ├── model-deployments.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para model-deployments [M2 | api-e2e]
│   │   │   ├── model-imports.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para model-imports [M3 | api-e2e]
│   │   │   ├── notifications.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para notifications [M3 | api-e2e]
│   │   │   ├── observability-queries.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para observability-queries [M3 | api-e2e]
│   │   │   ├── organizations.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para organizations [M1 | api-e2e]
│   │   │   ├── playground.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para playground [M2 | api-e2e]
│   │   │   ├── quotas.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para quotas [M2 | api-e2e]
│   │   │   ├── request-routing.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para request-routing [S+ | api-e2e]
│   │   │   ├── system.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para system [M1 | api-e2e]
│   │   │   ├── usage-ledger.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para usage-ledger [M2 | api-e2e]
│   │   │   └── webhooks.api.spec.ts   # HTTP real (status, payload, auth, errores, paginación) para webhooks [S+ | api-e2e]
│   │   └── security/
│   │       ├── admission-control.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en admission-control [M2 | security-e2e]
│   │       ├── alerts.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en alerts [M3 | security-e2e]
│   │       ├── api-credentials.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en api-credentials [M2 | security-e2e]
│   │       ├── artifacts.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en artifacts [S+ | security-e2e]
│   │       ├── audit.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en audit [M3 | security-e2e]
│   │       ├── auth-session.negative.spec.ts   # 401/403, CSRF, refresh replay y fijación [Foundation | test]
│   │       ├── authorization.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en authorization [M1 | security-e2e]
│   │       ├── backups.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en backups [M3 | security-e2e]
│   │       ├── benchmarks.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en benchmarks [S+ | security-e2e]
│   │       ├── cost-estimates.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en cost-estimates [M3 | security-e2e]
│   │       ├── datasets.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en datasets [S+ | security-e2e]
│   │       ├── experiments.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en experiments [S+ | security-e2e]
│   │       ├── gpu-nodes.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en gpu-nodes [M3 | security-e2e]
│   │       ├── identity.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en identity [M1 | security-e2e]
│   │       ├── inference.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en inference [M2 | security-e2e]
│   │       ├── jobs.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en jobs [M3 | security-e2e]
│   │       ├── large-payload.negative.spec.ts   # Rechaza cuerpos excesivos y rate limit [Foundation | test]
│   │       ├── model-catalog.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en model-catalog [M2 | security-e2e]
│   │       ├── model-deployments.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en model-deployments [M2 | security-e2e]
│   │       ├── model-imports.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en model-imports [M3 | security-e2e]
│   │       ├── notifications.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en notifications [M3 | security-e2e]
│   │       ├── observability-queries.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en observability-queries [M3 | security-e2e]
│   │       ├── organizations.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en organizations [M1 | security-e2e]
│   │       ├── playground.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en playground [M2 | security-e2e]
│   │       ├── quotas.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en quotas [M2 | security-e2e]
│   │       ├── request-routing.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en request-routing [S+ | security-e2e]
│   │       ├── ssrf-egress.negative.spec.ts   # Fetch/download/webhook bloquea egress prohibido [Foundation | test]
│   │       ├── system.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en system [M1 | security-e2e]
│   │       ├── tenant-isolation.negative.spec.ts   # IDs ajenos denegados sin filtrar existencia [Foundation | test]
│   │       ├── usage-ledger.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en usage-ledger [M2 | security-e2e]
│   │       └── webhooks.access.spec.ts   # Pruebas negativas: 401/403, tenant ajeno y permisos en webhooks [S+ | security-e2e]
│   ├── fixtures/
│   │   ├── fake-identity-provider.ts   # Simula OAuth y assertions de state/nonce [Foundation | test]
│   │   ├── fake-vllm-server.ts   # Simulador de SSE, abort, 429 y desconexión [Foundation | test]
│   │   ├── stream-chunks.ts   # Chunks SSE fragmentados y [DONE] [Foundation | test]
│   │   ├── tenant-factory.ts   # Fixture tenants A/B y aislamiento [Foundation | test]
│   │   ├── test-clock.ts   # Reloj inyectado para OTP, TTL y idempotencia [Foundation | test]
│   │   └── user-factory.ts   # Fixture identidades y roles sintéticos [Foundation | test]
│   ├── integration/
│   │   ├── admission-control/
│   │   │   └── admission-control.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de admission-control [M2 | integration]
│   │   ├── alerts/
│   │   │   └── alerts.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de alerts [M3 | integration]
│   │   ├── api-credentials/
│   │   │   └── api-credentials.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de api-credentials [M2 | integration]
│   │   ├── artifacts/
│   │   │   └── artifacts.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de artifacts [S+ | integration]
│   │   ├── audit/
│   │   │   └── audit.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de audit [M3 | integration]
│   │   ├── authorization/
│   │   │   └── authorization.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de authorization [M1 | integration]
│   │   ├── backups/
│   │   │   └── backups.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de backups [M3 | integration]
│   │   ├── benchmarks/
│   │   │   └── benchmarks.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de benchmarks [S+ | integration]
│   │   ├── cost-estimates/
│   │   │   └── cost-estimates.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de cost-estimates [M3 | integration]
│   │   ├── datasets/
│   │   │   └── datasets.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de datasets [S+ | integration]
│   │   ├── experiments/
│   │   │   └── experiments.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de experiments [S+ | integration]
│   │   ├── gpu-nodes/
│   │   │   └── gpu-nodes.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de gpu-nodes [M3 | integration]
│   │   ├── identity/
│   │   │   └── identity.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de identity [M1 | integration]
│   │   ├── inference/
│   │   │   └── inference.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de inference [M2 | integration]
│   │   ├── jobs/
│   │   │   └── jobs.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de jobs [M3 | integration]
│   │   ├── model-catalog/
│   │   │   └── model-catalog.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de model-catalog [M2 | integration]
│   │   ├── model-deployments/
│   │   │   └── model-deployments.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de model-deployments [M2 | integration]
│   │   ├── model-imports/
│   │   │   └── model-imports.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de model-imports [M3 | integration]
│   │   ├── notifications/
│   │   │   └── notifications.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de notifications [M3 | integration]
│   │   ├── observability-queries/
│   │   │   └── observability-queries.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de observability-queries [M3 | integration]
│   │   ├── organizations/
│   │   │   └── organizations.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de organizations [M1 | integration]
│   │   ├── playground/
│   │   │   └── playground.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de playground [M2 | integration]
│   │   ├── quotas/
│   │   │   └── quotas.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de quotas [M2 | integration]
│   │   ├── request-routing/
│   │   │   └── request-routing.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de request-routing [S+ | integration]
│   │   ├── system/
│   │   │   └── system.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de system [M1 | integration]
│   │   ├── usage-ledger/
│   │   │   └── usage-ledger.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de usage-ledger [M2 | integration]
│   │   └── webhooks/
│   │       └── webhooks.integration.spec.ts   # PostgreSQL/Valkey real, constraints, races y tenant de webhooks [S+ | integration]
│   ├── load/
│   │   ├── workloads/
│   │   │   └── mixed-inputs.example.jsonl   # Datos sintéticos de longitudes variables [Foundation | test]
│   │   ├── inference-saturation.k6.js   # Throughput, saturación, goodput, TTFT y p95 [Foundation | test]
│   │   ├── inference-smoke.k6.js   # Validación carga ligera y endpoints externos [Foundation | test]
│   │   ├── otp-abuse.k6.js   # Protección anti-bot y límites de OTP [Foundation | test]
│   │   └── tenant-fairness.k6.js   # Prueba concurrente de fairness entre tenants [Foundation | test]
│   └── unit/
│       ├── admission-control/
│       │   └── get-admission-metrics.spec.ts   # Unit de getAdmissionMetrics: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── alerts/
│       │   ├── acknowledge-alert.spec.ts   # Unit de acknowledgeAlert: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── list-organization-alerts.spec.ts   # Unit de listOrganizationAlerts: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── api-credentials/
│       │   ├── get-api-key-metadata.spec.ts   # Unit de getApiKeyMetadata: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── get-api-key-usage.spec.ts   # Unit de getApiKeyUsage: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── issue-api-key.spec.ts   # Unit de issueApiKey: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── list-api-keys.spec.ts   # Unit de listApiKeys: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── revoke-api-key.spec.ts   # Unit de revokeApiKey: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   └── rotate-api-key.spec.ts   # Unit de rotateApiKey: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       ├── artifacts/
│       │   ├── archive-artifact.spec.ts   # Unit de archiveArtifact: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── complete-artifact-upload.spec.ts   # Unit de completeArtifactUpload: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-artifact-metadata.spec.ts   # Unit de getArtifactMetadata: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── issue-artifact-download.spec.ts   # Unit de issueArtifactDownload: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── list-artifacts.spec.ts   # Unit de listArtifacts: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   └── request-artifact-upload.spec.ts   # Unit de requestArtifactUpload: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── audit/
│       │   ├── get-audit-event.spec.ts   # Unit de getAuditEvent: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-audit-events.spec.ts   # Unit de listAuditEvents: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── request-audit-export.spec.ts   # Unit de requestAuditExport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── authorization/
│       │   ├── list-available-roles.spec.ts   # Unit de listAvailableRoles: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   └── list-organization-permissions.spec.ts   # Unit de listOrganizationPermissions: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       ├── backups/
│       │   ├── get-backup-metadata.spec.ts   # Unit de getBackupMetadata: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-backups.spec.ts   # Unit de listBackups: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── request-backup.spec.ts   # Unit de requestBackup: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── verify-backup.spec.ts   # Unit de verifyBackup: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── benchmarks/
│       │   ├── cancel-benchmark-run.spec.ts   # Unit de cancelBenchmarkRun: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── create-benchmark-run.spec.ts   # Unit de createBenchmarkRun: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── export-benchmark-report.spec.ts   # Unit de exportBenchmarkReport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-benchmark-results.spec.ts   # Unit de getBenchmarkResults: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-benchmark-run.spec.ts   # Unit de getBenchmarkRun: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── list-benchmark-runs.spec.ts   # Unit de listBenchmarkRuns: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── start-benchmark-run.spec.ts   # Unit de startBenchmarkRun: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   └── stream-benchmark-events.spec.ts   # Unit de streamBenchmarkEvents: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── cost-estimates/
│       │   ├── get-cost-estimates.spec.ts   # Unit de getCostEstimates: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── update-cost-assumptions.spec.ts   # Unit de updateCostAssumptions: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── datasets/
│       │   ├── archive-dataset.spec.ts   # Unit de archiveDataset: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── create-dataset.spec.ts   # Unit de createDataset: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-dataset.spec.ts   # Unit de getDataset: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── list-datasets.spec.ts   # Unit de listDatasets: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   └── validate-dataset.spec.ts   # Unit de validateDataset: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── experiments/
│       │   ├── cancel-experiment.spec.ts   # Unit de cancelExperiment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── create-experiment.spec.ts   # Unit de createExperiment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-experiment-comparison.spec.ts   # Unit de getExperimentComparison: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-experiment.spec.ts   # Unit de getExperiment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── list-experiments.spec.ts   # Unit de listExperiments: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── promote-experiment-candidate.spec.ts   # Unit de promoteExperimentCandidate: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── rollback-experiment-promotion.spec.ts   # Unit de rollbackExperimentPromotion: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   └── run-experiment.spec.ts   # Unit de runExperiment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── gpu-nodes/
│       │   ├── drain-gpu-node.spec.ts   # Unit de drainGpuNode: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-gpu-node-metrics.spec.ts   # Unit de getGpuNodeMetrics: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-gpu-node.spec.ts   # Unit de getGpuNode: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-gpu-nodes.spec.ts   # Unit de listGpuNodes: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── undrain-gpu-node.spec.ts   # Unit de undrainGpuNode: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── identity/
│       │   ├── authenticate-password.spec.ts   # Unit de authenticatePassword: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── begin-o-auth-login.spec.ts   # Unit de beginOAuthLogin: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── begin-social-identity-link.spec.ts   # Unit de beginSocialIdentityLink: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── begin-totp-enrollment.spec.ts   # Unit de beginTotpEnrollment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── complete-o-auth-login.spec.ts   # Unit de completeOAuthLogin: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── complete-password-reset.spec.ts   # Unit de completePasswordReset: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── complete-social-identity-link.spec.ts   # Unit de completeSocialIdentityLink: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── complete-step-up-authentication.spec.ts   # Unit de completeStepUpAuthentication: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── confirm-totp-enrollment.spec.ts   # Unit de confirmTotpEnrollment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── disable-totp.spec.ts   # Unit de disableTotp: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── get-current-session.spec.ts   # Unit de getCurrentSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── list-active-sessions.spec.ts   # Unit de listActiveSessions: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── list-linked-identities.spec.ts   # Unit de listLinkedIdentities: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── logout-all-sessions.spec.ts   # Unit de logoutAllSessions: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── logout-current-session.spec.ts   # Unit de logoutCurrentSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── regenerate-recovery-codes.spec.ts   # Unit de regenerateRecoveryCodes: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── register-account.spec.ts   # Unit de registerAccount: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── request-email-otp.spec.ts   # Unit de requestEmailOtp: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── request-password-reset.spec.ts   # Unit de requestPasswordReset: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── revoke-session.spec.ts   # Unit de revokeSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── rotate-session.spec.ts   # Unit de rotateSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── unlink-social-identity.spec.ts   # Unit de unlinkSocialIdentity: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── verify-email-otp.spec.ts   # Unit de verifyEmailOtp: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   └── verify-mfa-challenge.spec.ts   # Unit de verifyMfaChallenge: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       ├── inference/
│       │   ├── create-chat-completion.spec.ts   # Unit de createChatCompletion: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── create-completion.spec.ts   # Unit de createCompletion: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── create-embedding.spec.ts   # Unit de createEmbedding: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── create-response.spec.ts   # Unit de createResponse: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-serving-model.spec.ts   # Unit de getServingModel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   └── list-serving-models.spec.ts   # Unit de listServingModels: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       ├── jobs/
│       │   ├── get-system-job.spec.ts   # Unit de getSystemJob: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-system-jobs.spec.ts   # Unit de listSystemJobs: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── stream-system-job-events.spec.ts   # Unit de streamSystemJobEvents: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── model-catalog/
│       │   ├── archive-model.spec.ts   # Unit de archiveModel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-model-capabilities.spec.ts   # Unit de getModelCapabilities: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── get-model-hardware-compatibility.spec.ts   # Unit de getModelHardwareCompatibility: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── get-model.spec.ts   # Unit de getModel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── list-model-versions.spec.ts   # Unit de listModelVersions: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-models.spec.ts   # Unit de listModels: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── register-model-version.spec.ts   # Unit de registerModelVersion: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── register-model.spec.ts   # Unit de registerModel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── update-model-metadata.spec.ts   # Unit de updateModelMetadata: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   └── validate-model-manifest.spec.ts   # Unit de validateModelManifest: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       ├── model-deployments/
│       │   ├── activate-deployment.spec.ts   # Unit de activateDeployment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-deployment-logs.spec.ts   # Unit de getDeploymentLogs: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-deployment-metrics.spec.ts   # Unit de getDeploymentMetrics: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-deployment.spec.ts   # Unit de getDeployment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── list-approved-runtime-profiles.spec.ts   # Unit de listApprovedRuntimeProfiles: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── list-deployments.spec.ts   # Unit de listDeployments: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── register-deployment.spec.ts   # Unit de registerDeployment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── rollback-deployment.spec.ts   # Unit de rollbackDeployment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── stop-deployment.spec.ts   # Unit de stopDeployment: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── stream-deployment-events.spec.ts   # Unit de streamDeploymentEvents: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── model-imports/
│       │   ├── cancel-model-import.spec.ts   # Unit de cancelModelImport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-model-import.spec.ts   # Unit de getModelImport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-model-imports.spec.ts   # Unit de listModelImports: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── start-model-import.spec.ts   # Unit de startModelImport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── stream-model-import-events.spec.ts   # Unit de streamModelImportEvents: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── notifications/
│       │   ├── create-notification-channel.spec.ts   # Unit de createNotificationChannel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-notification-channels.spec.ts   # Unit de listNotificationChannels: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── test-notification-channel.spec.ts   # Unit de testNotificationChannel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── update-notification-channel.spec.ts   # Unit de updateNotificationChannel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── observability-queries/
│       │   ├── get-error-metrics.spec.ts   # Unit de getErrorMetrics: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-latency-metrics.spec.ts   # Unit de getLatencyMetrics: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── get-organization-metrics.spec.ts   # Unit de getOrganizationMetrics: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── organizations/
│       │   ├── accept-invitation.spec.ts   # Unit de acceptInvitation: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── change-member-role.spec.ts   # Unit de changeMemberRole: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── get-organization.spec.ts   # Unit de getOrganization: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── invite-organization-member.spec.ts   # Unit de inviteOrganizationMember: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── list-invitations.spec.ts   # Unit de listInvitations: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── list-my-organizations.spec.ts   # Unit de listMyOrganizations: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── list-organization-members.spec.ts   # Unit de listOrganizationMembers: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── register-organization.spec.ts   # Unit de registerOrganization: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── remove-organization-member.spec.ts   # Unit de removeOrganizationMember: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── revoke-invitation.spec.ts   # Unit de revokeInvitation: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   └── update-organization.spec.ts   # Unit de updateOrganization: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       ├── playground/
│       │   ├── compare-playground-generations.spec.ts   # Unit de comparePlaygroundGenerations: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── create-playground-session.spec.ts   # Unit de createPlaygroundSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── delete-playground-session.spec.ts   # Unit de deletePlaygroundSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── generate-playground-completion.spec.ts   # Unit de generatePlaygroundCompletion: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── get-playground-session.spec.ts   # Unit de getPlaygroundSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── list-playground-sessions.spec.ts   # Unit de listPlaygroundSessions: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   └── update-playground-session.spec.ts   # Unit de updatePlaygroundSession: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       ├── quotas/
│       │   ├── get-current-quota-usage.spec.ts   # Unit de getCurrentQuotaUsage: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── list-quotas.spec.ts   # Unit de listQuotas: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   └── update-quota.spec.ts   # Unit de updateQuota: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── request-routing/
│       │   ├── activate-routing-policy.spec.ts   # Unit de activateRoutingPolicy: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── create-routing-policy.spec.ts   # Unit de createRoutingPolicy: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── get-routing-policy.spec.ts   # Unit de getRoutingPolicy: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   ├── list-routing-policies.spec.ts   # Unit de listRoutingPolicies: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       │   └── update-routing-policy.spec.ts   # Unit de updateRoutingPolicy: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│       ├── system/
│       │   ├── get-liveness.spec.ts   # Unit de getLiveness: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── get-readiness.spec.ts   # Unit de getReadiness: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── get-system-capabilities.spec.ts   # Unit de getSystemCapabilities: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── get-system-settings.spec.ts   # Unit de getSystemSettings: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-system-status.spec.ts   # Unit de getSystemStatus: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   ├── get-system-version.spec.ts   # Unit de getSystemVersion: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M1 | unit]
│       │   └── update-system-settings.spec.ts   # Unit de updateSystemSettings: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       ├── usage-ledger/
│       │   ├── get-inference-request-summary.spec.ts   # Unit de getInferenceRequestSummary: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-usage-by-key.spec.ts   # Unit de getUsageByKey: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-usage-by-model.spec.ts   # Unit de getUsageByModel: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-usage-export.spec.ts   # Unit de getUsageExport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── get-usage-summary.spec.ts   # Unit de getUsageSummary: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M2 | unit]
│       │   ├── get-usage-timeseries.spec.ts   # Unit de getUsageTimeseries: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   ├── list-inference-requests.spec.ts   # Unit de listInferenceRequests: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       │   └── request-usage-export.spec.ts   # Unit de requestUsageExport: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [M3 | unit]
│       └── webhooks/
│           ├── create-webhook.spec.ts   # Unit de createWebhook: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│           ├── list-webhook-deliveries.spec.ts   # Unit de listWebhookDeliveries: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│           ├── list-webhooks.spec.ts   # Unit de listWebhooks: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│           ├── rotate-webhook-secret.spec.ts   # Unit de rotateWebhookSecret: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
│           └── update-webhook.spec.ts   # Unit de updateWebhook: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique [S+ | unit]
├── .editorconfig   # Normalización de EOL e indentación [Foundation | base]
├── .env.example   # Variables ejemplo sin credenciales reales [Foundation | base]
├── .env.test.example   # Configuración de pruebas con datos sintéticos [Foundation | base]
├── .gitignore   # Excluye secretos, dumps, reports y cobertura [Foundation | base]
├── .gitleaks.toml   # Detección de secretos y allowlist justificada [Foundation | base]
├── .npmrc   # Políticas de pnpm y acceso a registry controlado [Foundation | base]
├── AGENTS.md   # Reglas Vigilio de ejecución, ownership y calidad para este repo [Foundation | base]
├── Containerfile   # Build reproducible, runtime Distroless non-root [Foundation | base]
├── LICENSE   # Licencia y redistribución aprobada [Foundation | base]
├── README.md   # Instalación de desarrollo, contratos y comandos de testing [Foundation | base]
├── SECURITY.md   # Divulgación responsable y política de parches [Foundation | base]
├── biome.json   # Formatter y linter con reglas de seguridad y complejidad [Foundation | base]
├── cucumber.js   # Gherkin por features y reportes JSON [Foundation | base]
├── drizzle.config.ts   # Fuente de migraciones Drizzle con conexión no embebida [Foundation | base]
├── nest-cli.json   # Config del compilador NestJS [Foundation | base]
├── package.json   # Scripts tipados de build, lint, tests, cobertura y OpenAPI [Foundation | base]
├── playwright.api.config.ts   # Proyectos API E2E y evidencias privadas de error [Foundation | base]
├── pnpm-lock.yaml   # Árbol de dependencias inmovilizado y auditado [Foundation | base]
├── pnpm-workspace.yaml   # packages: []; engineStrict, allowBuilds y age policy [Foundation | base]
├── tsconfig.build.json   # Archivos de build sin tests [Foundation | base]
├── tsconfig.json   # TypeScript strict y reglas de compilación [Foundation | base]
├── vitest.config.ts   # Coverage V8 con include explícito de código crítico [Foundation | base]
└── vitest.integration.config.ts   # Suite DB y Valkey reales aislados [Foundation | base]
```

### inferra-web/  (365 archivos)

```text
├── .github/
│   ├── workflows/
│   │   ├── ci.yml   # Biome, TS, Vitest, Playwright, axe, bundle budget [Foundation | base]
│   │   ├── release-oci.yml   # Build/dist firmado y SBOM [Foundation | base]
│   │   └── security.yml   # SAST, dependency audit, headers/CSP y secrets [Foundation | base]
│   └── CODEOWNERS   # Owners de auth, charts, gateway y UX [Foundation | base]
├── docs/
│   ├── accessibility.md   # WCAG, focus, contraste, teclado y reduced motion [Foundation | base]
│   ├── browser-security.md   # CSRF/CSP/iframe/no tokens y reglas de descarga [Foundation | base]
│   ├── route-registry.md   # Rutas y permission guards sincronizados con source [Foundation | base]
│   └── user-journeys.md   # Journeys, estados de carga/error/vacío/éxito [Foundation | base]
├── public/
│   ├── favicon.svg   # Identidad de producto [Foundation | base]
│   ├── manifest.webmanifest   # Metadata PWA sin offline de datos privados [Foundation | base]
│   └── robots.txt   # No indexar consola autenticada [Foundation | base]
├── scripts/
│   ├── audit-public-env.mjs   # Escanea dist por secretos, tokens y URLs privadas [Foundation | base]
│   ├── check-bundle-budget.mjs   # Presupuesto JS/CSS por ruta [Foundation | base]
│   └── verify-api-contracts.mjs   # Consume paquete DTO browser-safe publicado por backend [Foundation | base]
├── src/
│   ├── app/
│   │   ├── boundaries/
│   │   │   ├── route-error.boundary.tsx   # Fallback seguro y reporting sin PII [Foundation | base]
│   │   │   └── route-suspense.boundary.tsx   # Skeleton de carga de rutas lazy [Foundation | base]
│   │   ├── guards/
│   │   │   ├── authenticated-route.guard.tsx   # Bloquea acceso sin sesión pero no sustituye backend [Foundation | base]
│   │   │   ├── capability-route.guard.tsx   # Activa rutas según feature flags del servidor [Foundation | base]
│   │   │   ├── instance-admin-route.guard.tsx   # No confunde admin de tenant con admin instancia [Foundation | base]
│   │   │   └── organization-route.guard.tsx   # Valida org_slug contra membresía obtenida del servidor [Foundation | base]
│   │   ├── layouts/
│   │   │   ├── authenticated.layout.tsx   # Shell privado con organización activa [Foundation | base]
│   │   │   ├── instance-admin.layout.tsx   # Layout admin solo rol global [Foundation | base]
│   │   │   ├── organization.layout.tsx   # Sidebar por políticas de org [Foundation | base]
│   │   │   └── public.layout.tsx   # Páginas de auth públicas y callbacks [Foundation | base]
│   │   ├── providers/
│   │   │   ├── auth.provider.tsx   # Sesión desde server, refresh y logout [Foundation | base]
│   │   │   ├── query.provider.tsx   # TanStack Query y cache scoping por org [Foundation | base]
│   │   │   └── theme.provider.tsx   # Tema accesible y preferencias locales [Foundation | base]
│   │   ├── app.tsx   # Layout aplicación y boundary superior [Foundation | base]
│   │   └── routes.tsx   # Registry canónico de 71 rutas + lazy imports [Foundation | base]
│   ├── features/
│   │   ├── account/
│   │   │   ├── components/
│   │   │   │   ├── provider-connection-buttons.tsx   # UI provider-connection-buttons: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── session-device-table.tsx   # UI session-device-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── totp-enrollment.tsx   # UI totp-enrollment: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-account.ts   # Coordina TanStack Query, estados UX y cancelación de account [M1 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── active-sessions.page.tsx   # PÁGINA /account/sessions; Dispositivos, cierre remoto; acceso: Self; E2E route-access + account.journey [M1 | page]
│   │   │   │   ├── profile.page.tsx   # PÁGINA /account/profile; Datos personales y preferencias; acceso: Self; E2E route-access + account.journey [M1 | page]
│   │   │   │   ├── security-settings.page.tsx   # PÁGINA /account/security; Password, MFA, recovery codes, step-up; acceso: Self; E2E route-access + account.journey [M1 | page]
│   │   │   │   └── social-connections.page.tsx   # PÁGINA /account/connections; Vincular y desvincular Google/Facebook; acceso: Self; E2E route-access + account.journey [M1 | page]
│   │   │   ├── services/
│   │   │   │   └── account.api.ts   # Cliente typed para endpoints usados por feature account [M1 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de account [M1 | cache]
│   │   ├── alerts/
│   │   │   ├── components/
│   │   │   │   ├── acknowledge-action.tsx   # UI acknowledge-action: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── alert-list.tsx   # UI alert-list: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-alerts.ts   # Coordina TanStack Query, estados UX y cancelación de alerts [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   └── organization-alerts.page.tsx   # PÁGINA /app/:org_slug/alerts; Incidentes, severidad, acuse; acceso: alerts:read; E2E route-access + alerts.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── alerts.api.ts   # Cliente typed para endpoints usados por feature alerts [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de alerts [M3 | cache]
│   │   ├── api-keys/
│   │   │   ├── components/
│   │   │   │   ├── api-key-scope-editor.tsx   # UI api-key-scope-editor: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── create-api-key-form.tsx   # UI create-api-key-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── reveal-secret-once-dialog.tsx   # UI reveal-secret-once-dialog: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-api-keys.ts   # Coordina TanStack Query, estados UX y cancelación de api-keys [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── api-key-details.page.tsx   # PÁGINA /app/:org_slug/api-keys/:key_id; Metadata, consumo, rotación, revocación; acceso: credentials:read; E2E route-access + api-keys.journey [M2 | page]
│   │   │   │   ├── api-keys-list.page.tsx   # PÁGINA /app/:org_slug/api-keys; Listar keys enmascaradas; acceso: credentials:read; E2E route-access + api-keys.journey [M2 | page]
│   │   │   │   └── create-api-key.page.tsx   # PÁGINA /app/:org_slug/api-keys/new; Scopes, vencimiento, mostrar secreto solo una vez; acceso: credentials:manage; E2E route-access + api-keys.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── api-keys.api.ts   # Cliente typed para endpoints usados por feature api-keys [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de api-keys [M2 | cache]
│   │   ├── artifacts/
│   │   │   ├── components/
│   │   │   │   ├── artifact-scan-state.tsx   # UI artifact-scan-state: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── upload-progress.tsx   # UI upload-progress: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-artifacts.ts   # Coordina TanStack Query, estados UX y cancelación de artifacts [S+ | hook]
│   │   │   ├── pages/
│   │   │   │   ├── artifact-detail.page.tsx   # PÁGINA /app/:org_slug/artifacts/:artifact_id; Checksum, estado de escaneo; acceso: artifacts:read; E2E route-access + artifacts.journey [S+ | page]
│   │   │   │   └── artifacts-list.page.tsx   # PÁGINA /app/:org_slug/artifacts; Archivos de resultados/modelos; acceso: artifacts:read; E2E route-access + artifacts.journey [S+ | page]
│   │   │   ├── services/
│   │   │   │   └── artifacts.api.ts   # Cliente typed para endpoints usados por feature artifacts [S+ | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de artifacts [S+ | cache]
│   │   ├── audit/
│   │   │   ├── components/
│   │   │   │   ├── audit-event-detail.tsx   # UI audit-event-detail: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── audit-event-table.tsx   # UI audit-event-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-audit.ts   # Coordina TanStack Query, estados UX y cancelación de audit [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── audit-event-detail.page.tsx   # PÁGINA /app/:org_slug/audit/:event_id; Contexto y actor, sin credenciales; acceso: audit:read; E2E route-access + audit.journey [M3 | page]
│   │   │   │   └── audit-events.page.tsx   # PÁGINA /app/:org_slug/audit; Eventos redactados, export filtrado; acceso: audit:read; E2E route-access + audit.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── audit.api.ts   # Cliente typed para endpoints usados por feature audit [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de audit [M3 | cache]
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── email-otp-input.tsx   # UI email-otp-input: interacción accesible + loading/error/disabled según necesidad [M1 | component]
│   │   │   │   ├── mfa-challenge-form.tsx   # UI mfa-challenge-form: interacción accesible + loading/error/disabled según necesidad [M1 | component]
│   │   │   │   ├── oauth-provider-buttons.tsx   # UI oauth-provider-buttons: interacción accesible + loading/error/disabled según necesidad [M1 | component]
│   │   │   │   ├── password-login-form.tsx   # UI password-login-form: interacción accesible + loading/error/disabled según necesidad [M1 | component]
│   │   │   │   └── security-connections.tsx   # UI security-connections: interacción accesible + loading/error/disabled según necesidad [M1 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts   # Coordina TanStack Query, estados UX y cancelación de auth [M1 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── email-otp.page.tsx   # PÁGINA /login/otp; Solicitar y validar OTP; reenvío limitado; acceso: Challenge iniciado; E2E route-access + auth.journey [M1 | page]
│   │   │   │   ├── forgot-password.page.tsx   # PÁGINA /password/forgot; Correo de recuperación (respuesta genérica); acceso: Pública; E2E route-access + auth.journey [M1 | page]
│   │   │   │   ├── login.page.tsx   # PÁGINA /login; Contraseña; Google; Facebook; OTP; acceso: Pública; E2E route-access + auth.journey [M1 | page]
│   │   │   │   ├── mfa-challenge.page.tsx   # PÁGINA /mfa/challenge; TOTP o recovery code; acceso: Challenge activo; E2E route-access + auth.journey [M1 | page]
│   │   │   │   ├── oauth-complete.page.tsx   # PÁGINA /auth/complete; Resultado y redirección controlada; acceso: Callback finalizado; E2E route-access + auth.journey [M1 | page]
│   │   │   │   ├── register.page.tsx   # PÁGINA /register; Registro accesible y protección abuso; acceso: Pública si registro abierto; E2E route-access + auth.journey [M1 | page]
│   │   │   │   └── reset-password.page.tsx   # PÁGINA /password/reset; Restablecer password sin exponer token en logs; acceso: Token de recuperación; E2E route-access + auth.journey [M1 | page]
│   │   │   ├── services/
│   │   │   │   └── auth.api.ts   # Cliente typed para endpoints usados por feature auth [M1 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de auth [M1 | cache]
│   │   ├── backups/
│   │   │   ├── components/
│   │   │   │   ├── backup-verification-status.tsx   # UI backup-verification-status: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── restore-warning.tsx   # UI restore-warning: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-backups.ts   # Coordina TanStack Query, estados UX y cancelación de backups [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── backup-detail.page.tsx   # PÁGINA /admin/backups/:backup_id; Metadata y verificación aislada; acceso: instance:admin; E2E route-access + backups.journey [M3 | page]
│   │   │   │   └── backups-list.page.tsx   # PÁGINA /admin/backups; Backup status, verificación y restore guidance; acceso: instance:admin; E2E route-access + backups.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── backups.api.ts   # Cliente typed para endpoints usados por feature backups [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de backups [M3 | cache]
│   │   ├── benchmarks/
│   │   │   ├── components/
│   │   │   │   ├── benchmark-metrics-charts.tsx   # UI benchmark-metrics-charts: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── workload-profile-form.tsx   # UI workload-profile-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-benchmarks.ts   # Coordina TanStack Query, estados UX y cancelación de benchmarks [S+ | hook]
│   │   │   ├── pages/
│   │   │   │   ├── benchmark-detail.page.tsx   # PÁGINA /app/:org_slug/benchmarks/:benchmark_id; Progreso SSE, TTFT, throughput, resultados; acceso: benchmarks:read; E2E route-access + benchmarks.journey [S+ | page]
│   │   │   │   ├── benchmarks-list.page.tsx   # PÁGINA /app/:org_slug/benchmarks; Runs, filtros, estado, baseline; acceso: benchmarks:read; E2E route-access + benchmarks.journey [S+ | page]
│   │   │   │   └── create-benchmark.page.tsx   # PÁGINA /app/:org_slug/benchmarks/new; Dataset, concurrencia, warm-up, presupuesto; acceso: benchmarks:run; E2E route-access + benchmarks.journey [S+ | page]
│   │   │   ├── services/
│   │   │   │   └── benchmarks.api.ts   # Cliente typed para endpoints usados por feature benchmarks [S+ | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de benchmarks [S+ | cache]
│   │   ├── costs/
│   │   │   ├── components/
│   │   │   │   ├── cost-assumption-form.tsx   # UI cost-assumption-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── estimated-cost-chart.tsx   # UI estimated-cost-chart: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-costs.ts   # Coordina TanStack Query, estados UX y cancelación de costs [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   └── cost-estimates.page.tsx   # PÁGINA /app/:org_slug/costs; Estimaciones y supuestos declarados; acceso: usage:read; E2E route-access + costs.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── costs.api.ts   # Cliente typed para endpoints usados por feature costs [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de costs [M3 | cache]
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── latency-kpi.tsx   # UI latency-kpi: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── model-availability.tsx   # UI model-availability: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── quota-status.tsx   # UI quota-status: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-dashboard.ts   # Coordina TanStack Query, estados UX y cancelación de dashboard [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   └── dashboard.page.tsx   # PÁGINA /app/:org_slug/dashboard; KPIs, TTFT, VRAM, alertas, colas; acceso: metrics:read; E2E route-access + dashboard.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── dashboard.api.ts   # Cliente typed para endpoints usados por feature dashboard [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de dashboard [M2 | cache]
│   │   ├── datasets/
│   │   │   ├── components/
│   │   │   │   ├── dataset-license-check.tsx   # UI dataset-license-check: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── dataset-schema-editor.tsx   # UI dataset-schema-editor: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-datasets.ts   # Coordina TanStack Query, estados UX y cancelación de datasets [S+ | hook]
│   │   │   ├── pages/
│   │   │   │   ├── create-dataset.page.tsx   # PÁGINA /app/:org_slug/datasets/new; Dataset, esquema, licencia; acceso: datasets:write; E2E route-access + datasets.journey [S+ | page]
│   │   │   │   ├── dataset-detail.page.tsx   # PÁGINA /app/:org_slug/datasets/:dataset_id; Versiones y validación; acceso: datasets:read; E2E route-access + datasets.journey [S+ | page]
│   │   │   │   └── datasets-list.page.tsx   # PÁGINA /app/:org_slug/datasets; Corpus para benchmarking; acceso: datasets:read; E2E route-access + datasets.journey [S+ | page]
│   │   │   ├── services/
│   │   │   │   └── datasets.api.ts   # Cliente typed para endpoints usados por feature datasets [S+ | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de datasets [S+ | cache]
│   │   ├── deployments/
│   │   │   ├── components/
│   │   │   │   ├── deployment-configuration-form.tsx   # UI deployment-configuration-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── rollback-confirm-dialog.tsx   # UI rollback-confirm-dialog: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── runtime-profile-picker.tsx   # UI runtime-profile-picker: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-deployments.ts   # Coordina TanStack Query, estados UX y cancelación de deployments [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── create-deployment.page.tsx   # PÁGINA /app/:org_slug/deployments/new; Preflight hardware y presets aprobados; acceso: deployments:write; E2E route-access + deployments.journey [M2 | page]
│   │   │   │   ├── deployment-detail.page.tsx   # PÁGINA /app/:org_slug/deployments/:deployment_id; Health, acciones permitidas, métricas; acceso: deployments:read; E2E route-access + deployments.journey [M2 | page]
│   │   │   │   ├── deployment-logs.page.tsx   # PÁGINA /app/:org_slug/deployments/:deployment_id/logs; Logs redactados, búsqueda, export seguro; acceso: logs:read; E2E route-access + deployments.journey [M2 | page]
│   │   │   │   └── deployments-list.page.tsx   # PÁGINA /app/:org_slug/deployments; Estado de runtime y recursos; acceso: deployments:read; E2E route-access + deployments.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── deployments.api.ts   # Cliente typed para endpoints usados por feature deployments [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de deployments [M2 | cache]
│   │   ├── experiments/
│   │   │   ├── components/
│   │   │   │   ├── candidate-comparison-table.tsx   # UI candidate-comparison-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── promotion-approval-dialog.tsx   # UI promotion-approval-dialog: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-experiments.ts   # Coordina TanStack Query, estados UX y cancelación de experiments [S+ | hook]
│   │   │   ├── pages/
│   │   │   │   ├── create-experiment.page.tsx   # PÁGINA /app/:org_slug/experiments/new; Baseline/candidate con condiciones iguales; acceso: experiments:write; E2E route-access + experiments.journey [S+ | page]
│   │   │   │   ├── experiment-detail.page.tsx   # PÁGINA /app/:org_slug/experiments/:experiment_id; Comparativas, promoción, rollback; acceso: experiments:read; E2E route-access + experiments.journey [S+ | page]
│   │   │   │   └── experiments-list.page.tsx   # PÁGINA /app/:org_slug/experiments; Experimentos A/B reproducibles; acceso: experiments:read; E2E route-access + experiments.journey [S+ | page]
│   │   │   ├── services/
│   │   │   │   └── experiments.api.ts   # Cliente typed para endpoints usados por feature experiments [S+ | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de experiments [S+ | cache]
│   │   ├── gpu-nodes/
│   │   │   ├── components/
│   │   │   │   ├── gpu-utilization-card.tsx   # UI gpu-utilization-card: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── vram-chart.tsx   # UI vram-chart: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-gpu-nodes.ts   # Coordina TanStack Query, estados UX y cancelación de gpu-nodes [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── gpu-node-detail.page.tsx   # PÁGINA /admin/gpu-nodes/:node_id; VRAM, DCGM, drain/undrain; acceso: instance:read; E2E route-access + gpu-nodes.journey [M3 | page]
│   │   │   │   └── gpu-nodes-list.page.tsx   # PÁGINA /admin/gpu-nodes; GPU host y métricas de infraestructura; acceso: instance:read; E2E route-access + gpu-nodes.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── gpu-nodes.api.ts   # Cliente typed para endpoints usados por feature gpu-nodes [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de gpu-nodes [M3 | cache]
│   │   ├── jobs/
│   │   │   ├── components/
│   │   │   │   ├── job-event-timeline.tsx   # UI job-event-timeline: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── job-progress.tsx   # UI job-progress: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-jobs.ts   # Coordina TanStack Query, estados UX y cancelación de jobs [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── system-job-detail.page.tsx   # PÁGINA /admin/jobs/:job_id; Progreso y diagnóstico redactado; acceso: instance:read; E2E route-access + jobs.journey [M3 | page]
│   │   │   │   └── system-jobs.page.tsx   # PÁGINA /admin/jobs; Trabajos asíncronos y estados; acceso: instance:read; E2E route-access + jobs.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── jobs.api.ts   # Cliente typed para endpoints usados por feature jobs [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de jobs [M3 | cache]
│   │   ├── model-imports/
│   │   │   ├── components/
│   │   │   │   ├── import-progress.tsx   # UI import-progress: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── import-source-form.tsx   # UI import-source-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-model-imports.ts   # Coordina TanStack Query, estados UX y cancelación de model-imports [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── model-import-detail.page.tsx   # PÁGINA /app/:org_slug/model-imports/:import_id; Progreso live, cancelación, error; acceso: models:read; E2E route-access + model-imports.journey [M3 | page]
│   │   │   │   ├── model-imports-list.page.tsx   # PÁGINA /app/:org_slug/model-imports; Descargas/importaciones; acceso: models:read; E2E route-access + model-imports.journey [M3 | page]
│   │   │   │   └── start-model-import.page.tsx   # PÁGINA /app/:org_slug/model-imports/new; Origen allowlisted y validación; acceso: models:write; E2E route-access + model-imports.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── model-imports.api.ts   # Cliente typed para endpoints usados por feature model-imports [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de model-imports [M3 | cache]
│   │   ├── models/
│   │   │   ├── components/
│   │   │   │   ├── model-capabilities.tsx   # UI model-capabilities: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── model-card.tsx   # UI model-card: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── model-license-warning.tsx   # UI model-license-warning: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-models.ts   # Coordina TanStack Query, estados UX y cancelación de models [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── model-details.page.tsx   # PÁGINA /app/:org_slug/models/:model_id; Detalle, versiones, specs, capabilities; acceso: models:read; E2E route-access + models.journey [M2 | page]
│   │   │   │   ├── model-settings.page.tsx   # PÁGINA /app/:org_slug/models/:model_id/settings; Metadatos, políticas, archivado; acceso: models:write; E2E route-access + models.journey [M2 | page]
│   │   │   │   ├── model-versions.page.tsx   # PÁGINA /app/:org_slug/models/:model_id/versions; Comparativa de versiones; acceso: models:read; E2E route-access + models.journey [M2 | page]
│   │   │   │   ├── models-list.page.tsx   # PÁGINA /app/:org_slug/models; Listado, filtros, estado, capacidad; acceso: models:read; E2E route-access + models.journey [M2 | page]
│   │   │   │   └── register-model.page.tsx   # PÁGINA /app/:org_slug/models/new; Wizard manifiesto/licencia/compatibilidad; acceso: models:write; E2E route-access + models.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── models.api.ts   # Cliente typed para endpoints usados por feature models [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de models [M2 | cache]
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   ├── channel-settings-form.tsx   # UI channel-settings-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── test-channel-action.tsx   # UI test-channel-action: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-notifications.ts   # Coordina TanStack Query, estados UX y cancelación de notifications [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   └── notification-settings.page.tsx   # PÁGINA /app/:org_slug/settings/notifications; Canales, alertas y envío de test; acceso: notifications:manage; E2E route-access + notifications.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── notifications.api.ts   # Cliente typed para endpoints usados por feature notifications [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de notifications [M3 | cache]
│   │   ├── observability/
│   │   │   ├── components/
│   │   │   │   ├── error-table.tsx   # UI error-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── latency-percentiles-chart.tsx   # UI latency-percentiles-chart: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-observability.ts   # Coordina TanStack Query, estados UX y cancelación de observability [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── errors.page.tsx   # PÁGINA /app/:org_slug/observability/errors; Errores, saturación, upstream, trace ID; acceso: metrics:read; E2E route-access + observability.journey [M3 | page]
│   │   │   │   └── latency.page.tsx   # PÁGINA /app/:org_slug/observability/latency; TTFT, TPOT, p50/p95/p99; acceso: metrics:read; E2E route-access + observability.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── observability.api.ts   # Cliente typed para endpoints usados por feature observability [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de observability [M3 | cache]
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   │   ├── gpu-preflight-status.tsx   # UI gpu-preflight-status: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── org-creation-form.tsx   # UI org-creation-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── setup-checklist.tsx   # UI setup-checklist: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-onboarding.ts   # Coordina TanStack Query, estados UX y cancelación de onboarding [M1 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── create-organization.page.tsx   # PÁGINA /onboarding/organization; Crear organización, slug y configuración; acceso: Usuario inicial; E2E route-access + onboarding.journey [M1 | page]
│   │   │   │   ├── first-model.page.tsx   # PÁGINA /onboarding/first-model; Guiado al modelo y perfil runtime; acceso: models:write; E2E route-access + onboarding.journey [M1 | page]
│   │   │   │   └── welcome.page.tsx   # PÁGINA /onboarding; Checklist del sistema, salud y cuenta; acceso: Usuario/owner inicial; E2E route-access + onboarding.journey [M1 | page]
│   │   │   ├── services/
│   │   │   │   └── onboarding.api.ts   # Cliente typed para endpoints usados por feature onboarding [M1 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de onboarding [M1 | cache]
│   │   ├── organizations/
│   │   │   ├── components/
│   │   │   │   ├── invite-member-form.tsx   # UI invite-member-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── members-table.tsx   # UI members-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── role-selector.tsx   # UI role-selector: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-organizations.ts   # Coordina TanStack Query, estados UX y cancelación de organizations [M1 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── invitation-accept.page.tsx   # PÁGINA /invite/accept; Aceptar organización; acceso: Login + invitación válida; E2E route-access + organizations.journey [M1 | page]
│   │   │   │   ├── invitations.page.tsx   # PÁGINA /app/:org_slug/invitations; Invitar, reenviar, revocar; acceso: members:manage; E2E route-access + organizations.journey [M1 | page]
│   │   │   │   ├── members.page.tsx   # PÁGINA /app/:org_slug/members; Miembros, roles, desactivar acceso; acceso: members:read; E2E route-access + organizations.journey [M1 | page]
│   │   │   │   └── organization-settings.page.tsx   # PÁGINA /app/:org_slug/settings/general; Nombre, slug, atributos, límites; acceso: org:read; E2E route-access + organizations.journey [M1 | page]
│   │   │   ├── services/
│   │   │   │   └── organizations.api.ts   # Cliente typed para endpoints usados por feature organizations [M1 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de organizations [M1 | cache]
│   │   ├── playground/
│   │   │   ├── components/
│   │   │   │   ├── abort-generation-button.tsx   # UI abort-generation-button: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── chat-message.tsx   # UI chat-message: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── generation-settings.tsx   # UI generation-settings: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── model-picker.tsx   # UI model-picker: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── prompt-editor.tsx   # UI prompt-editor: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── stream-output.tsx   # UI stream-output: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-playground.ts   # Coordina TanStack Query, estados UX y cancelación de playground [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── compare-completions.page.tsx   # PÁGINA /app/:org_slug/playground/compare; Comparar dos respuestas con costo; acceso: inference:invoke; E2E route-access + playground.journey [M2 | page]
│   │   │   │   ├── playground-session.page.tsx   # PÁGINA /app/:org_slug/playground/sessions/:session_id; Streaming, mensajes, abortar, historial; acceso: inference:invoke; E2E route-access + playground.journey [M2 | page]
│   │   │   │   └── playground.page.tsx   # PÁGINA /app/:org_slug/playground; Chat vacío, selector de modelos y presets; acceso: inference:invoke; E2E route-access + playground.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── playground.api.ts   # Cliente typed para endpoints usados por feature playground [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de playground [M2 | cache]
│   │   ├── quotas/
│   │   │   ├── components/
│   │   │   │   ├── quota-table.tsx   # UI quota-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── quota-usage-progress.tsx   # UI quota-usage-progress: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-quotas.ts   # Coordina TanStack Query, estados UX y cancelación de quotas [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   └── quotas.page.tsx   # PÁGINA /app/:org_slug/quotas; Límites de tokens, concurrencia y presupuestos; acceso: quotas:read; E2E route-access + quotas.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── quotas.api.ts   # Cliente typed para endpoints usados por feature quotas [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de quotas [M2 | cache]
│   │   ├── routing/
│   │   │   ├── components/
│   │   │   │   ├── dry-run-routing-result.tsx   # UI dry-run-routing-result: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── routing-rule-editor.tsx   # UI routing-rule-editor: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-routing.ts   # Coordina TanStack Query, estados UX y cancelación de routing [S+ | hook]
│   │   │   ├── pages/
│   │   │   │   ├── create-routing-policy.page.tsx   # PÁGINA /app/:org_slug/routing/new; Wizard de reglas y simulación; acceso: routing:manage; E2E route-access + routing.journey [S+ | page]
│   │   │   │   ├── routing-policies.page.tsx   # PÁGINA /app/:org_slug/routing; Políticas activas y priorización; acceso: routing:read; E2E route-access + routing.journey [S+ | page]
│   │   │   │   └── routing-policy-details.page.tsx   # PÁGINA /app/:org_slug/routing/:policy_id; Rules, activación, revisión, versiones; acceso: routing:read; E2E route-access + routing.journey [S+ | page]
│   │   │   ├── services/
│   │   │   │   └── routing.api.ts   # Cliente typed para endpoints usados por feature routing [S+ | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de routing [S+ | cache]
│   │   ├── system/
│   │   │   ├── components/
│   │   │   │   ├── job-events-stream.tsx   # UI job-events-stream: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── provider-config-form.tsx   # UI provider-config-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── system-health-summary.tsx   # UI system-health-summary: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-system.ts   # Coordina TanStack Query, estados UX y cancelación de system [M3 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── instance-health.page.tsx   # PÁGINA /admin/system; Estado, versión, componentes; acceso: instance:read; E2E route-access + system.journey [M3 | page]
│   │   │   │   └── instance-settings.page.tsx   # PÁGINA /admin/settings; OAuth SMTP políticas seguridad runtime; acceso: instance:admin; E2E route-access + system.journey [M3 | page]
│   │   │   ├── services/
│   │   │   │   └── system.api.ts   # Cliente typed para endpoints usados por feature system [M3 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de system [M3 | cache]
│   │   ├── usage/
│   │   │   ├── components/
│   │   │   │   ├── requests-table.tsx   # UI requests-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   ├── token-breakdown.tsx   # UI token-breakdown: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   │   └── usage-timeline.tsx   # UI usage-timeline: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │   │   ├── hooks/
│   │   │   │   └── use-usage.ts   # Coordina TanStack Query, estados UX y cancelación de usage [M2 | hook]
│   │   │   ├── pages/
│   │   │   │   ├── inference-request-detail.page.tsx   # PÁGINA /app/:org_slug/requests/:request_id; Trace ID, latencias, modelo, token usage; acceso: usage:read; E2E route-access + usage.journey [M2 | page]
│   │   │   │   ├── inference-requests.page.tsx   # PÁGINA /app/:org_slug/requests; Historial operativo de solicitudes sin prompts; acceso: usage:read; E2E route-access + usage.journey [M2 | page]
│   │   │   │   └── usage.page.tsx   # PÁGINA /app/:org_slug/usage; Tokens, series, modelos, llaves; acceso: usage:read; E2E route-access + usage.journey [M2 | page]
│   │   │   ├── services/
│   │   │   │   └── usage.api.ts   # Cliente typed para endpoints usados por feature usage [M2 | client]
│   │   │   └── query-keys.ts   # Keys con org_id y filtros; invalidación de usage [M2 | cache]
│   │   └── webhooks/
│   │       ├── components/
│   │       │   ├── delivery-history-table.tsx   # UI delivery-history-table: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │       │   └── webhook-endpoint-form.tsx   # UI webhook-endpoint-form: interacción accesible + loading/error/disabled según necesidad [M3 | component]
│   │       ├── hooks/
│   │       │   └── use-webhooks.ts   # Coordina TanStack Query, estados UX y cancelación de webhooks [S+ | hook]
│   │       ├── pages/
│   │       │   └── webhook-settings.page.tsx   # PÁGINA /app/:org_slug/settings/webhooks; Destinos y entregas; protección SSRF; acceso: webhooks:manage; E2E route-access + webhooks.journey [S+ | page]
│   │       ├── services/
│   │       │   └── webhooks.api.ts   # Cliente typed para endpoints usados por feature webhooks [S+ | client]
│   │       └── query-keys.ts   # Keys con org_id y filtros; invalidación de webhooks [S+ | cache]
│   ├── libs/
│   │   ├── accessibility/
│   │   │   ├── focus-manager.ts   # Manejo de foco entre rutas, diálogos y formularios [Foundation | base]
│   │   │   └── live-announcer.ts   # Anuncios aria-live de streams y errores [Foundation | base]
│   │   ├── charts/
│   │   │   ├── gpu-usage-chart.tsx   # VRAM y utilización con percentiles y units [Foundation | base]
│   │   │   ├── latency-chart.tsx   # Chart TTFT/TPOT con tabla alternativa accesible [Foundation | base]
│   │   │   └── throughput-chart.tsx   # Tokens/s y goodput con accesibilidad [Foundation | base]
│   │   ├── format/
│   │   │   ├── bytes.ts   # Formatos VRAM y tamaño de modelo [Foundation | base]
│   │   │   ├── duration.ts   # Formato duración y percentiles [Foundation | base]
│   │   │   └── tokens.ts   # Unidades tokens y costos estimados [Foundation | base]
│   │   └── ui/
│   │       ├── button/
│   │       │   └── button.tsx   # Botón accesible, estados loading y disabled [Foundation | base]
│   │       ├── dialog/
│   │       │   └── dialog.tsx   # Focus trap, Escape, restore focus [Foundation | base]
│   │       ├── empty-state/
│   │       │   └── empty-state.tsx   # Empty contextual con acción relevante [Foundation | base]
│   │       ├── error-state/
│   │       │   └── error-state.tsx   # Retry seguro, degradación sin PII [Foundation | base]
│   │       ├── form/
│   │       │   └── field.tsx   # Labels/errores con ARIA y RHF [Foundation | base]
│   │       ├── skeleton/
│   │       │   └── skeleton.tsx   # Skeleton que no produce saltos de layout [Foundation | base]
│   │       ├── table/
│   │       │   └── data-table.tsx   # Tabla paginada/ordenada server-side [Foundation | base]
│   │       └── toast/
│   │           └── toast.tsx   # Feedback SR-friendly sin revelar secretos [Foundation | base]
│   ├── services/
│   │   ├── auth/
│   │   │   └── session-client.ts   # Carga y refresh de sesión sin localStorage de tokens [Foundation | base]
│   │   ├── http/
│   │   │   ├── api-client.ts   # Requests con cookie, CSRF, timeout y retry solo seguro [Foundation | base]
│   │   │   ├── api-error.ts   # Parse application/problem+json y error UX [Foundation | base]
│   │   │   └── csrf-client.ts   # CSRF token y same-origin [Foundation | base]
│   │   ├── inference/
│   │   │   ├── chat-stream.client.ts   # POST streaming con fetch ReadableStream y abort [Foundation | base]
│   │   │   └── sse-frame.parser.ts   # Parse incremental multi-chunk SSE [Foundation | base]
│   │   ├── observability/
│   │   │   └── browser-rum.ts   # Métricas frontend sin prompt ni PII [Foundation | base]
│   │   └── runtime-config/
│   │       ├── runtime-config.client.ts   # Capa pública de runtime sin secretos [Foundation | base]
│   │       └── runtime-config.schema.ts   # Validación de configuración pública inyectada [Foundation | base]
│   ├── styles/
│   │   ├── global.css   # Tailwind v4 base y estilos globales accesibles [Foundation | base]
│   │   ├── themes.css   # Tema claro/oscuro y reduced-motion [Foundation | base]
│   │   └── tokens.css   # Tokens semánticos light/dark [Foundation | base]
│   └── main.tsx   # Monta Preact 11 con rutas y providers [Foundation | base]
├── tests/
│   ├── components/
│   │   ├── account.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de account [M1 | component-test]
│   │   ├── alerts.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de alerts [M3 | component-test]
│   │   ├── api-keys.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de api-keys [M2 | component-test]
│   │   ├── artifacts.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de artifacts [S+ | component-test]
│   │   ├── audit.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de audit [M3 | component-test]
│   │   ├── auth.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de auth [M1 | component-test]
│   │   ├── backups.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de backups [M3 | component-test]
│   │   ├── benchmarks.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de benchmarks [S+ | component-test]
│   │   ├── costs.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de costs [M3 | component-test]
│   │   ├── dashboard.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de dashboard [M2 | component-test]
│   │   ├── datasets.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de datasets [S+ | component-test]
│   │   ├── deployments.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de deployments [M2 | component-test]
│   │   ├── experiments.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de experiments [S+ | component-test]
│   │   ├── gpu-nodes.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de gpu-nodes [M3 | component-test]
│   │   ├── jobs.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de jobs [M3 | component-test]
│   │   ├── model-imports.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de model-imports [M3 | component-test]
│   │   ├── models.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de models [M2 | component-test]
│   │   ├── notifications.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de notifications [M3 | component-test]
│   │   ├── observability.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de observability [M3 | component-test]
│   │   ├── onboarding.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de onboarding [M1 | component-test]
│   │   ├── organizations.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de organizations [M1 | component-test]
│   │   ├── playground.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de playground [M2 | component-test]
│   │   ├── quotas.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de quotas [M2 | component-test]
│   │   ├── routing.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de routing [S+ | component-test]
│   │   ├── system.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de system [M3 | component-test]
│   │   ├── usage.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de usage [M2 | component-test]
│   │   └── webhooks.states.spec.tsx   # Component tests loading/error/empty/success y ARIA de webhooks [S+ | component-test]
│   ├── contract/
│   │   ├── browser-dtos.contract.spec.ts   # Verifica import seguro y schema publicado [Foundation | test]
│   │   └── sse-compat.contract.spec.ts   # Frames de streaming y fallback UI [Foundation | test]
│   ├── e2e/
│   │   ├── journeys/
│   │   │   ├── account.journey.spec.ts   # E2E funcional con red controlada, auth y failure de account [M1 | browser-e2e]
│   │   │   ├── alerts.journey.spec.ts   # E2E funcional con red controlada, auth y failure de alerts [M3 | browser-e2e]
│   │   │   ├── api-keys.journey.spec.ts   # E2E funcional con red controlada, auth y failure de api-keys [M2 | browser-e2e]
│   │   │   ├── artifacts.journey.spec.ts   # E2E funcional con red controlada, auth y failure de artifacts [S+ | browser-e2e]
│   │   │   ├── audit.journey.spec.ts   # E2E funcional con red controlada, auth y failure de audit [M3 | browser-e2e]
│   │   │   ├── auth.journey.spec.ts   # E2E funcional con red controlada, auth y failure de auth [M1 | browser-e2e]
│   │   │   ├── backups.journey.spec.ts   # E2E funcional con red controlada, auth y failure de backups [M3 | browser-e2e]
│   │   │   ├── benchmarks.journey.spec.ts   # E2E funcional con red controlada, auth y failure de benchmarks [S+ | browser-e2e]
│   │   │   ├── costs.journey.spec.ts   # E2E funcional con red controlada, auth y failure de costs [M3 | browser-e2e]
│   │   │   ├── dashboard.journey.spec.ts   # E2E funcional con red controlada, auth y failure de dashboard [M2 | browser-e2e]
│   │   │   ├── datasets.journey.spec.ts   # E2E funcional con red controlada, auth y failure de datasets [S+ | browser-e2e]
│   │   │   ├── deployments.journey.spec.ts   # E2E funcional con red controlada, auth y failure de deployments [M2 | browser-e2e]
│   │   │   ├── experiments.journey.spec.ts   # E2E funcional con red controlada, auth y failure de experiments [S+ | browser-e2e]
│   │   │   ├── gpu-nodes.journey.spec.ts   # E2E funcional con red controlada, auth y failure de gpu-nodes [M3 | browser-e2e]
│   │   │   ├── jobs.journey.spec.ts   # E2E funcional con red controlada, auth y failure de jobs [M3 | browser-e2e]
│   │   │   ├── model-imports.journey.spec.ts   # E2E funcional con red controlada, auth y failure de model-imports [M3 | browser-e2e]
│   │   │   ├── models.journey.spec.ts   # E2E funcional con red controlada, auth y failure de models [M2 | browser-e2e]
│   │   │   ├── notifications.journey.spec.ts   # E2E funcional con red controlada, auth y failure de notifications [M3 | browser-e2e]
│   │   │   ├── observability.journey.spec.ts   # E2E funcional con red controlada, auth y failure de observability [M3 | browser-e2e]
│   │   │   ├── onboarding.journey.spec.ts   # E2E funcional con red controlada, auth y failure de onboarding [M1 | browser-e2e]
│   │   │   ├── organizations.journey.spec.ts   # E2E funcional con red controlada, auth y failure de organizations [M1 | browser-e2e]
│   │   │   ├── playground.journey.spec.ts   # E2E funcional con red controlada, auth y failure de playground [M2 | browser-e2e]
│   │   │   ├── quotas.journey.spec.ts   # E2E funcional con red controlada, auth y failure de quotas [M2 | browser-e2e]
│   │   │   ├── routing.journey.spec.ts   # E2E funcional con red controlada, auth y failure de routing [S+ | browser-e2e]
│   │   │   ├── system.journey.spec.ts   # E2E funcional con red controlada, auth y failure de system [M3 | browser-e2e]
│   │   │   ├── usage.journey.spec.ts   # E2E funcional con red controlada, auth y failure de usage [M2 | browser-e2e]
│   │   │   └── webhooks.journey.spec.ts   # E2E funcional con red controlada, auth y failure de webhooks [S+ | browser-e2e]
│   │   ├── accessibility.spec.ts   # axe y navegación teclado en rutas críticas [Foundation | test]
│   │   ├── headers-and-csp.spec.ts   # CSP, cookies HttpOnly y no filtración de secret [Foundation | test]
│   │   ├── route-access.spec.ts   # Matriz parametrizada 71 rutas, guards, redirects y 404 [Foundation | test]
│   │   ├── session-expiry.spec.ts   # 401/expiry y refresh sin sesión zombi [Foundation | test]
│   │   └── tenant-switching.spec.ts   # Cambio de tenant limpia cache y niega datos ajenos [Foundation | test]
│   ├── msw/
│   │   ├── fixtures.ts   # Payloads sintéticos conformes a DTOs [Foundation | test]
│   │   ├── handlers.ts   # Fixtures HTTP por operación sin mockear Query [Foundation | test]
│   │   └── server.ts   # MSW setup/reset entre pruebas [Foundation | test]
│   ├── unit/
│   │   ├── runtime-config.spec.ts   # Configuración pública válida/ausente/inválida [Foundation | test]
│   │   └── sse-frame-parser.spec.ts   # Chunks SSE fragmentados, Unicode y [DONE] [Foundation | test]
│   └── visual/
│       └── core-pages.visual.spec.ts   # Screenshots revisadas de layout responsive estable [Foundation | test]
├── .editorconfig   # Convenciones de texto [Foundation | base]
├── .env.example   # Solo variables públicas VITE_, jamás secrets [Foundation | base]
├── .gitignore   # Ignora dist, artefactos y traces locales [Foundation | base]
├── .gitleaks.toml   # Secret scanning de fuente y builds [Foundation | base]
├── .npmrc   # PNPM con registry seguro [Foundation | base]
├── AGENTS.md   # Normas Vigilio Preact, ownership, testing y UX [Foundation | base]
├── Containerfile.runtime   # Sólo dist + server estático, runtime non-root [Foundation | base]
├── README.md   # Development, rutas, contratos, CI y diagramas [Foundation | base]
├── SECURITY.md   # Seguridad del browser, privacidad y reporte vulnerabilidades [Foundation | base]
├── biome.json   # Reglas Biome comunes + accesibilidad + hooks [Foundation | base]
├── index.html   # Entry SPA seguro sin claves insertadas [Foundation | base]
├── package.json   # Build, check, unit, components, route smoke y E2E [Foundation | base]
├── playwright.config.ts   # Chromium, Firefox, WebKit; traces on failure y webserver [Foundation | base]
├── pnpm-lock.yaml   # Dependencias reproducibles [Foundation | base]
├── pnpm-workspace.yaml   # packages: [] + allowBuilds declarados [Foundation | base]
├── tsconfig.json   # TypeScript strict y Preact JSX [Foundation | base]
├── vite.config.ts   # Vite, CSP assets y paths estables [Foundation | base]
└── vitest.config.ts   # Unit/components V8 thresholds y matchers [Foundation | base]
```

### inferra-deploy/  (85 archivos)

```text
├── .github/
│   ├── workflows/
│   │   ├── release.yml   # Manifiesto digests, smoke y aprobación de promoción [Foundation | ops]
│   │   ├── security.yml   # Trivy/Conftest, cosign policy y scan secrets [Foundation | ops]
│   │   └── validate-compose.yml   # Lint YAML, config interpolated de staging/production y conftest [Foundation | ops]
│   └── CODEOWNERS   # Approval de operaciones, seguridad y SRE [Foundation | ops]
├── backup/
│   ├── pgbackrest/
│   │   ├── backup-systemd.service   # Invoca pgbackrest con permisos mínimos [Foundation | ops]
│   │   ├── backup-systemd.timer   # Backups programados fuera de app [Foundation | ops]
│   │   └── pgbackrest.conf.example   # Backup base, WAL archiving PITR y cifrado [Foundation | ops]
│   └── restore/
│       ├── offsite-policy.md   # 3-2-1 copias en otra máquina y retención [Foundation | ops]
│       ├── restore-isolated.sh   # Ensaya restore aislado con aprobación [Foundation | ops]
│       └── verify-rpo-rto.sh   # Mide RPO/RTO y verifica consistencia [Foundation | ops]
├── compose/
│   ├── Caddyfile   # TLS, headers, routing, no-buffer SSE, límites de tamaño [Foundation | ops]
│   └── compose.yaml   # Único Compose, perfiles gpu/cpu-demo/obs/storage/tools y redes [Foundation | ops]
├── docs/
│   ├── installation/
│   │   ├── cpu-demo.md   # Demo sin GPU, sin prometer throughput de vLLM [Foundation | ops]
│   │   ├── hardware-sizing.md   # VRAM, CPU, disco, licencias y límites [Foundation | ops]
│   │   ├── linux-nvidia.md   # Instrucciones NVIDIA sin asumir drivers instalados [Foundation | ops]
│   │   ├── oauth-and-smtp.md   # Credenciales Google/Facebook y SMTP opcionales [Foundation | ops]
│   │   └── offline.md   # Mirror local de OCI y modelos firmados [Foundation | ops]
│   ├── security/
│   │   ├── network-and-tls.md   # Trust boundaries TLS edge/backend y Caddy [Foundation | ops]
│   │   └── secrets-and-rotation.md   # Gestión, rotación y expiración de secrets [Foundation | ops]
│   └── upgrade/
│       └── migration-and-rollback.md   # Migraciones forward-only y planes de rollback [Foundation | ops]
├── environments/
│   ├── local.env.example   # Variables locales dummy, sin secretos [Foundation | ops]
│   ├── production.env.example   # Contrato de variables producción; mismo compose [Foundation | ops]
│   └── staging.env.example   # Contrato de variables staging; mismo compose [Foundation | ops]
├── observability/
│   ├── alertmanager/
│   │   └── config.yaml   # Rutas de incidentes y dedupe sin PII [Foundation | ops]
│   ├── alloy/
│   │   └── config.alloy   # Recolección de logs JSON y filtros PII [Foundation | ops]
│   ├── blackbox/
│   │   └── config.yaml   # Verificación TLS y rutas públicas seguras [Foundation | ops]
│   ├── dcgm/
│   │   └── README.md   # Export GPU para NVIDIA compatibles y DCGM versionado [Foundation | ops]
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   ├── api-security.json   # Panel auth failures, API keys y tenant denials [Foundation | ops]
│   │   │   ├── gpu-capacity.json   # Panel VRAM, GPU duty cycle, OOM [Foundation | ops]
│   │   │   └── inference-overview.json   # Panel TTFT, TPOT, throughput, goodput [Foundation | ops]
│   │   └── provisioning/
│   │       └── datasources.yaml   # Data sources privadas provisionadas [Foundation | ops]
│   ├── loki/
│   │   └── config.yaml   # Logs, storage y retención [Foundation | ops]
│   ├── otel-collector/
│   │   └── config.yaml   # Procesamiento OTel con sampling y redacción [Foundation | ops]
│   ├── prometheus/
│   │   ├── rules/
│   │   │   ├── api-slo.yml   # SLI error/latency de gateway y API [Foundation | ops]
│   │   │   └── gpu-slo.yml   # GPU saturation, OOM y capacity pressure [Foundation | ops]
│   │   ├── tests/
│   │   │   ├── api-slo.test.yml   # promtool test rules de alertas API [Foundation | ops]
│   │   │   └── gpu-slo.test.yml   # promtool test rules de alertas GPU [Foundation | ops]
│   │   └── prometheus.yml   # Targets privados y labels low-cardinality [Foundation | ops]
│   └── tempo/
│       └── config.yaml   # Almacenamiento de trazas y límites [Foundation | ops]
├── operations/
│   ├── runbooks/
│   │   ├── backup-restore.md   # Restore drill aislado y verificación post-restore [Foundation | ops]
│   │   ├── gpu-oom.md   # Runbook GPU OOM/fragmentación y rollback [Foundation | ops]
│   │   ├── oauth-provider-unavailable.md   # Runbook social login caído, OTP local [Foundation | ops]
│   │   ├── postgres-unavailable.md   # Runbook fail-closed y restauración controlada [Foundation | ops]
│   │   ├── valkey-unavailable.md   # Runbook colas/capacidad degradadas [Foundation | ops]
│   │   └── vllm-failure.md   # Recovery de runtime y abort de streams [Foundation | ops]
│   ├── capacity.md   # Sizing, admission thresholds y límites GPU [Foundation | ops]
│   ├── incident-response.md   # Severidades, on-call y notificación [Foundation | ops]
│   └── slos.md   # Objetivos de latencia/errores y presupuesto de error [Foundation | ops]
├── policies/
│   ├── compose-security.rego   # Bloquea privileged, host sock, puertos DB y cap excesivas [Foundation | ops]
│   ├── data-retention.md   # Retención de prompts, trazas, tokens y artefactos [Foundation | ops]
│   └── signed-images.rego   # Rechaza digests sin firma previa verificada [Foundation | ops]
├── provisioning/
│   ├── bootstrap/
│   │   ├── bootstrap-owner.sh   # Credencial bootstrap de un uso, expira y se revoca [Foundation | ops]
│   │   └── generate-secrets.sh   # Genera secretos sin logs, permisos 0600 [Foundation | ops]
│   ├── gpu/
│   │   └── nvidia-runtime.md   # Configuración host NVIDIA y pruebas GPU [Foundation | ops]
│   ├── model-profiles/
│   │   ├── llama-small.env.example   # Perfil alternativo bajo licencia y compatibilidad [Foundation | ops]
│   │   └── qwen-small.env.example   # Perfil GPU preaprobado por límites de VRAM [Foundation | ops]
│   ├── preflight/
│   │   ├── check-host.sh   # Comprueba Linux, Compose, disco, CPU, límites y puertos [Foundation | ops]
│   │   ├── check-model.sh   # Model id+revisión+licencia+VRAM+tamaño de context [Foundation | ops]
│   │   └── check-nvidia.sh   # Comprueba NVIDIA driver, nvidia-container-toolkit y VRAM [Foundation | ops]
│   └── releases/
│       ├── rollback-app.sh   # Rollback imagen/servicios sin revertir DDL destructivo [Foundation | ops]
│       ├── run-migrations.sh   # Migration one-shot y compatibilidad DB [Foundation | ops]
│       └── verify-signatures.sh   # cosign verify keyless antes del pull por digest [Foundation | ops]
├── storage/
│   ├── clamav/
│   │   └── README.md   # Cuándo habilitar malware scan y límites [Foundation | ops]
│   └── rustfs/
│       ├── README.md   # Buckets, credenciales por función, cifrado y despliegue opcional [Foundation | ops]
│       └── lifecycle.json   # Retención y limpieza de multipart abandonados [Foundation | ops]
├── tests/
│   ├── compose/
│   │   ├── compose-profiles.spec.sh   # Valida único compose para staging/prod/gpu/cpu-demo [Foundation | test]
│   │   └── network-isolation.spec.sh   # Postgres/Valkey/vLLM/RustFS sin ports públicos [Foundation | test]
│   ├── dr/
│   │   ├── pgbackrest-restore.spec.sh   # Restauración en host/DB aislados [Foundation | test]
│   │   └── rustfs-checksum.spec.sh   # Objects/versionados checksum y copia externa [Foundation | test]
│   ├── observability/
│   │   └── promtool-rules.spec.sh   # Ejecuta promtool test rules [Foundation | test]
│   ├── security/
│   │   ├── container-hardening.spec.sh   # Non-root, read-only fs, cap_drop, seccomp [Foundation | test]
│   │   └── cosign-rejection.spec.sh   # Imagen inválida rechazada antes del deploy [Foundation | test]
│   └── smoke/
│       ├── inference-sse.spec.sh   # GET /v1/models + POST chat streaming desde proxy [Foundation | test]
│       ├── install-smoke.spec.sh   # Instalación idempotente y login bootstrap [Foundation | test]
│       └── upgrade-rollback.spec.sh   # Mismo digest y rollback de app sin rollback DDL destructivo [Foundation | test]
├── .gitignore   # Ignora .env reales, datos persistentes, claves y backups [Foundation | ops]
├── .gitleaks.toml   # Detección de secrets en infraestructura y scripts [Foundation | ops]
├── AGENTS.md   # Restricciones Compose, seguridad y evidence gates [Foundation | ops]
├── README.md   # Guía de instalador de usuario final y arquitectura de producción [Foundation | ops]
├── install.sh   # Instalador idempotente con preflight y permisos 0600 [Foundation | ops]
├── release-manifest.yaml   # Digests OCI inmutables, versiones runtime y procedencia [Foundation | ops]
├── status.sh   # Resumir salud y readiness sin secrets [Foundation | ops]
├── uninstall.sh   # Desinstalación explícita con confirmación y política de datos [Foundation | ops]
├── upgrade.sh   # Promoción mismo digest con migration+smoke+rollback [Foundation | ops]
└── verify.sh   # Smoke health, streaming SSE, auth privada y almacenamiento [Foundation | ops]
```

### platform-ops/  (32 archivos)

```text
├── .github/
│   ├── workflows/
│   │   └── ansible-ci.yml   # ansible-lint, syntax-check y molecule rootless [Foundation | ops]
│   └── CODEOWNERS   # Revisión obligatoria de roles host [Foundation | ops]
├── docs/
│   ├── compatibility.md   # Distros, cgroups v2, NVIDIA y soporte [Foundation | ops]
│   └── host-operations.md   # Operación y mantenimiento fuera de producto [Foundation | ops]
├── inventories/
│   └── example/
│       └── hosts.ini   # Inventario de ejemplo sin direcciones privadas reales [Foundation | ops]
├── playbooks/
│   ├── configure-backups.yml   # Timers y ubicación externa del backup [Foundation | ops]
│   ├── harden-linux.yml   # Hardening SSH, usuarios, kernel, logs [Foundation | ops]
│   ├── install-container-runtime.yml   # Instala Docker Compose o Podman rootless según decisión host [Foundation | ops]
│   └── prepare-nvidia.yml   # Drivers y Toolkit NVIDIA con validación de versiones [Foundation | ops]
├── roles/
│   ├── backup_host/
│   │   ├── tasks/
│   │   │   └── main.yml   # Repo pgBackRest en host independiente y ACL [Foundation | ops]
│   │   └── templates/
│   │       └── pgbackrest.repo.conf.j2   # Config de backup remoto cifrado [Foundation | ops]
│   ├── base_hardening/
│   │   ├── defaults/
│   │   │   └── main.yml   # Defaults sin IP ni nombre de producto [Foundation | ops]
│   │   ├── handlers/
│   │   │   └── main.yml   # Reload seguros para SSH/daemon [Foundation | ops]
│   │   └── tasks/
│   │       └── main.yml   # SSH key-only, sudo mínimo, updates y sysctl [Foundation | ops]
│   ├── docker_host/
│   │   ├── defaults/
│   │   │   └── main.yml   # Version pins y bind addresses [Foundation | ops]
│   │   └── tasks/
│   │       └── main.yml   # Docker Engine, Compose plugin y logging seguro [Foundation | ops]
│   ├── firewall/
│   │   ├── defaults/
│   │   │   └── main.yml   # Política de puertos abstracta [Foundation | ops]
│   │   └── tasks/
│   │       └── main.yml   # Firewall deny-by-default, solo 80/443 y SSH allowlist [Foundation | ops]
│   ├── nvidia_host/
│   │   ├── defaults/
│   │   │   └── main.yml   # Requisitos hardware sin suponer GPU [Foundation | ops]
│   │   └── tasks/
│   │       └── main.yml   # Drivers/toolkit NVIDIA y health check [Foundation | ops]
│   └── rootless_podman_host/
│       ├── meta/
│       │   └── argument_specs.yml   # Validación de roles Rootless Podman [Foundation | ops]
│       └── tasks/
│           └── main.yml   # Subuid/subgid, linger, user services y socket privado [Foundation | ops]
├── tests/
│   ├── molecule/
│   │   ├── base/
│   │   │   └── molecule.yml   # Host baseline Linux, ssh y firewall [Foundation | test]
│   │   ├── container-runtime/
│   │   │   └── molecule.yml   # Rootless/Docker sin privilegios excesivos [Foundation | test]
│   │   └── nvidia/
│   │       └── molecule.yml   # Test host NVIDIA con runner compatible [Foundation | test]
│   └── security/
│       └── host-hardening.spec.sh   # Auditoría SSH, firewall, docker socket, limits [Foundation | test]
├── .gitignore   # Ignora inventarios privados, llaves, facts [Foundation | ops]
├── .gitleaks.toml   # Escaneo secretos Ansible [Foundation | ops]
├── AGENTS.md   # Políticas de cambios privilegiados y auditoría [Foundation | ops]
├── README.md   # Operación Linux reusable, sin nombres Inferra [Foundation | ops]
├── ansible.cfg   # Configuración Ansible sin escaladas implícitas [Foundation | ops]
└── requirements.yml   # Dependencias Ansible por versión/hashes [Foundation | ops]
```

### prod-local/  (30 archivos)

```text
├── docs/
│   └── differences-from-production.md   # Diferencias host lab vs producción y riesgos [Foundation | lab]
├── fixtures/
│   ├── gpu/
│   │   └── fake-node-metrics.json   # Evidencia sintética con etiquetas claras [Foundation | lab]
│   ├── oauth/
│   │   ├── facebook-stub.json   # Provider fake de Facebook aislado [Foundation | lab]
│   │   └── oidc-stub.json   # Issuer local para validación de state/nonce/callback [Foundation | lab]
│   ├── postgres/
│   │   └── seed-tenants.sql   # Datos tenant A/B sintéticos [Foundation | lab]
│   ├── smtp/
│   │   └── fake-mail-server.md   # Proveedor SMTP local que no envía correos externos [Foundation | lab]
│   └── vllm/
│       ├── stream-abort.ndjson   # Fixtures disconnect y abort upstream [Foundation | lab]
│       └── stream-success.ndjson   # Fixtures SSE streaming, no GPU necesario [Foundation | lab]
├── reports/
│   └── README.md   # Esquema de reporte operativo; datos reales ignorados en git [Foundation | lab]
├── scenarios/
│   ├── auth-oauth-otp.sh   # E2E OAuth OTP/MFA y cookies en laboratorio [Foundation | test]
│   ├── backup-restore.sh   # RPO/RTO restore drill en DB aislada [Foundation | test]
│   ├── gpu-admission.sh   # Cargas saturadas y rechazo con GPU si existe [Foundation | test]
│   ├── inference-streaming.sh   # Proxy SSE chunks/cancel/timeout y quotas [Foundation | test]
│   ├── monitoring-alerts.sh   # Disparo de alertas y validación de receivers [Foundation | test]
│   ├── outbox-restart.sh   # Idempotencia ante worker/restart [Foundation | test]
│   ├── postgres-failure.sh   # DB caído y degradación fail-closed [Foundation | test]
│   ├── signature-reject.sh   # Imagen no firmada rechazada en promoción [Foundation | test]
│   ├── tenant-isolation.sh   # Intentos cruzados usuario/org/key [Foundation | test]
│   ├── upgrade-rollback.sh   # Migrations forward/rollout/recovery sin pérdida [Foundation | test]
│   ├── valkey-failure.sh   # Cola/cache caídos sin sobrepasar presupuesto [Foundation | test]
│   └── vllm-failure.sh   # Modelo no disponible y fallback seguro [Foundation | test]
├── schemas/
│   └── evidence.schema.json   # Contrato evidencia PASS/FAIL/NOT_RUN/BLOCKED por test [Foundation | lab]
├── scripts/
│   ├── collect-evidence.sh   # Captura estado/digests/exit codes sin secretos [Foundation | lab]
│   ├── lab-down.sh   # Baja servicios sin borrar volúmenes por defecto [Foundation | lab]
│   ├── lab-reset.sh   # Reset destructivo SOLO del laboratorio tras confirmación [Foundation | lab]
│   └── lab-up.sh   # Lanza -f ../inferra-deploy/compose/compose.yaml con env lab [Foundation | lab]
├── .env.lab.example   # Variables sintéticas de staging local [Foundation | lab]
├── .gitignore   # Excluye secrets, volúmenes, reportes, logs y videos [Foundation | lab]
├── Makefile   # Comandos lab-up, lab-down, lab-test sin copiar compose [Foundation | lab]
└── README.md   # Ejecuta el único compose de inferra-deploy para el laboratorio [Foundation | lab]
```
