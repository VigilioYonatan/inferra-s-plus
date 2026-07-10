# Inferra S+ — Mapa canónico de APIs, páginas y flujos
**Estado:** DISEÑO / NO IMPLEMENTADO · **Origen:** skills y vigilio-docs adjuntos, perfil `compose-vps` · **Backend:** NestJS · **Frontend:** Preact/Vite · **Deploy:** un Docker Compose.

## 0. Contratos y convenciones innegociables
- `A = /api/v1` es API administrativa con sesión cookie HttpOnly, CSRF en mutaciones browser, autorización por recurso, tenant y policy; `I = /v1` es API de inferencia compatible con OpenAI con API key separada. No mezclar credenciales ni devolver API keys de proveedor al navegador.
- `O = /api/v1/organizations/{organization_id}`. Todas las colecciones tenant-scoped usan este prefijo; recursos identificables por UUID (`/models/{model_id}`) se autorizan tras resolver pertenencia. El frontend navega usando `:org_slug`, pero la API usa `organization_id` validado en servidor, nunca confía en el slug como autorización.
- Colecciones: `GET` con filtros validados `?search=&sort=-created_at&limit=25&offset=0`, máximo razonable 100, orden estable `created_at DESC,id DESC`. Contrato administrativo: `{count,next,previous,results}`. Cursor opaco solo donde haya ventaja demostrada; no mezclar convenciones.
- Semántica: `GET` 200, `POST` creación 201+Location, `PATCH` 200/204 con precondición/ETag cuando haya conflicto de edición, `DELETE` 204, comandos asíncronos 202+`job_id`+`Location`, stream `text/event-stream`. Errores administrativos `application/problem+json` con `type,title,status,detail,code,trace_id`; evitar datos privados.
- No usar `DELETE` para operaciones que realmente son revocación o cancelación si requieren historial: usar comandos semánticos. `Idempotency-Key` en creaciones/arranques/reintentos sensibles. Las mutaciones de infraestructura requieren MFA reciente (`step-up`), auditoría y políticas explícitas.
- `operationId` semántico `camelCase` estable (p.ej. `registerModel`,`activateDeployment`), DTO HTTP dueño en `presentation/http/dto/*.request.dto.ts|*.query.dto.ts|*.response.dto.ts` con Zod+tipo inferido; documentación opcional `*.doc.ts`; dominio en `domain/schemas`; contratos frontend browser-safe generados/publicados por el backend.
- El frontend jamás llama vLLM directamente; el playground usa el backend con sesión, mientras apps externas usan `/v1` con API keys. `/health/live` y `/health/ready` están limitadas a red interna y no exponen secretos ni dependencias.

## 1. Matriz de endpoints NestJS
**Leyenda:** `M1` base/identidad, `M2` MVP inferencia, `M3` observabilidad/operación, `S+` optimización y extensiones. `O` equivale al prefijo de organización. En cada endpoint se indica el caso de uso (`operationId`), permiso y pantalla consumidora principal. `Self` = usuario de sesión; `Public` = público con límites, `Instance` = administración global.

### 1.1 Identidad, contraseña, OTP y OAuth
*Controller(s):* `IdentityController · OAuthController · MfaController · SessionsController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| POST | /auth/register | registerAccount | Public (si habilitado) | /register | M1 |
| POST | /auth/password/login | authenticatePassword | Public + rate limit | /login | M1 |
| POST | /auth/password/recovery/request | requestPasswordReset | Public + anti-enumeración | /password/forgot | M1 |
| POST | /auth/password/recovery/complete | completePasswordReset | Token de un solo uso | /password/reset | M1 |
| POST | /auth/otp/request | requestEmailOtp | Public + IP/identidad | /login/otp | M1 |
| POST | /auth/otp/verify | verifyEmailOtp | Challenge válido + atómico | /login/otp | M1 |
| GET | /auth/oauth/{provider}/start | beginOAuthLogin | Public, state/PKCE | /login | M1 |
| GET | /auth/oauth/{provider}/callback | completeOAuthLogin | Callback verificado | /auth/complete | M1 |
| GET | /auth/oauth/{provider}/link/start | beginSocialIdentityLink | Self + step-up | /account/connections | M3 |
| GET | /auth/oauth/{provider}/link/callback | completeSocialIdentityLink | Callback + step-up | /account/connections | M3 |
| GET | /auth/me | getCurrentSession | Self | Shell autenticado | M1 |
| POST | /auth/refresh | rotateSession | Cookie refresh válida | Shell autenticado | M1 |
| POST | /auth/logout | logoutCurrentSession | Self | Menú de cuenta | M1 |
| POST | /auth/logout-all | logoutAllSessions | Self + step-up | /account/sessions | M1 |
| GET | /auth/sessions | listActiveSessions | Self | /account/sessions | M1 |
| DELETE | /auth/sessions/{session_id} | revokeSession | Self, recurso propio | /account/sessions | M1 |
| GET | /auth/identities | listLinkedIdentities | Self | /account/connections | M3 |
| DELETE | /auth/identities/{identity_id} | unlinkSocialIdentity | Self + step-up, no bloquear última entrada | /account/connections | M3 |
| POST | /auth/mfa/totp/enroll | beginTotpEnrollment | Self + step-up | /account/security | M1 |
| POST | /auth/mfa/totp/confirm | confirmTotpEnrollment | Self + OTP/TOTP válido | /account/security | M1 |
| POST | /auth/mfa/challenge/verify | verifyMfaChallenge | Challenge de sesión | /mfa/challenge | M1 |
| POST | /auth/mfa/totp/disable | disableTotp | Self + step-up | /account/security | M1 |
| POST | /auth/mfa/recovery-codes/regenerate | regenerateRecoveryCodes | Self + step-up | /account/security | M1 |
| POST | /auth/step-up | completeStepUpAuthentication | Self + credencial reciente | Diálogo de confirmación | M1 |

### 1.2 Organizaciones, miembros, invitaciones y roles
*Controller(s):* `OrganizationsController · MembersController · InvitationsController · AuthorizationController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | /organizations | listMyOrganizations | Self | Selector de organizaciones | M1 |
| POST | /organizations | registerOrganization | Self; política de creación | /onboarding/organization | M1 |
| GET | /organizations/{organization_id} | getOrganization | org:read | /app/:org_slug/settings/general | M1 |
| PATCH | /organizations/{organization_id} | updateOrganization | org:manage | /app/:org_slug/settings/general | M1 |
| GET | O/members | listOrganizationMembers | members:read | /app/:org_slug/members | M1 |
| PATCH | O/members/{member_id} | changeMemberRole | members:manage + política anti-escalación | /app/:org_slug/members | M1 |
| DELETE | O/members/{member_id} | removeOrganizationMember | members:manage; no eliminar último owner | /app/:org_slug/members | M1 |
| GET | O/invitations | listInvitations | members:manage | /app/:org_slug/invitations | M1 |
| POST | O/invitations | inviteOrganizationMember | members:manage | /app/:org_slug/invitations | M1 |
| POST | /invitations/accept | acceptInvitation | Self + token en body | /invite/accept | M1 |
| POST | O/invitations/{invitation_id}/revoke | revokeInvitation | members:manage | /app/:org_slug/invitations | M1 |
| GET | O/roles | listAvailableRoles | members:read | Formulario de miembro | M1 |
| GET | O/permissions | listOrganizationPermissions | members:read | /app/:org_slug/members | M1 |

### 1.3 API keys y credenciales de servicio
*Controller(s):* `ApiCredentialsController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/api-keys | listApiKeys | credentials:read | /app/:org_slug/api-keys | M2 |
| POST | O/api-keys | issueApiKey | credentials:manage + step-up | /app/:org_slug/api-keys/new | M2 |
| GET | /api-keys/{api_key_id} | getApiKeyMetadata | credentials:read + scope tenant | /app/:org_slug/api-keys/:key_id | M2 |
| POST | /api-keys/{api_key_id}/rotate | rotateApiKey | credentials:manage + step-up | /app/:org_slug/api-keys/:key_id | M2 |
| POST | /api-keys/{api_key_id}/revoke | revokeApiKey | credentials:manage + step-up | /app/:org_slug/api-keys/:key_id | M2 |
| GET | /api-keys/{api_key_id}/usage | getApiKeyUsage | usage:read + scope tenant | /app/:org_slug/api-keys/:key_id | M3 |

### 1.4 Registro, importación y versiones de modelos
*Controller(s):* `ModelCatalogController · ModelImportsController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/models | listModels | models:read | /app/:org_slug/models | M2 |
| POST | O/models | registerModel | models:write | /app/:org_slug/models/new | M2 |
| POST | O/models/validate | validateModelManifest | models:write | /app/:org_slug/models/new | M2 |
| GET | /models/{model_id} | getModel | models:read + tenant | /app/:org_slug/models/:model_id | M2 |
| PATCH | /models/{model_id} | updateModelMetadata | models:write + tenant | /app/:org_slug/models/:model_id/settings | M2 |
| POST | /models/{model_id}/archive | archiveModel | models:write + no deployment activo | /app/:org_slug/models/:model_id | M3 |
| GET | /models/{model_id}/versions | listModelVersions | models:read + tenant | /app/:org_slug/models/:model_id/versions | M3 |
| POST | /models/{model_id}/versions | registerModelVersion | models:write + tenant | /app/:org_slug/models/:model_id/versions | M3 |
| GET | /models/{model_id}/capabilities | getModelCapabilities | models:read + tenant | /app/:org_slug/models/:model_id | M2 |
| GET | /models/{model_id}/compatibility | getModelHardwareCompatibility | models:read + tenant | /app/:org_slug/models/:model_id | M2 |
| GET | O/model-imports | listModelImports | models:read | /app/:org_slug/model-imports | M3 |
| POST | O/model-imports | startModelImport | models:write + allowlisted source | /app/:org_slug/model-imports/new | M3 |
| GET | /model-imports/{import_id} | getModelImport | models:read + tenant | /app/:org_slug/model-imports/:import_id | M3 |
| POST | /model-imports/{import_id}/cancel | cancelModelImport | models:write + tenant | /app/:org_slug/model-imports/:import_id | M3 |
| GET | /model-imports/{import_id}/events | streamModelImportEvents | models:read + tenant + SSE | /app/:org_slug/model-imports/:import_id | M3 |

### 1.5 Despliegues, perfiles de runtime y GPU
*Controller(s):* `ModelDeploymentsController · RuntimeProfilesController · GpuNodesController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/deployments | listDeployments | deployments:read | /app/:org_slug/deployments | M2 |
| POST | O/deployments | registerDeployment | deployments:write + preflight | /app/:org_slug/deployments/new | M2 |
| GET | /deployments/{deployment_id} | getDeployment | deployments:read + tenant | /app/:org_slug/deployments/:deployment_id | M2 |
| POST | /deployments/{deployment_id}/activate | activateDeployment | deployments:operate + step-up | /app/:org_slug/deployments/:deployment_id | M3 |
| POST | /deployments/{deployment_id}/stop | stopDeployment | deployments:operate + step-up | /app/:org_slug/deployments/:deployment_id | M3 |
| POST | /deployments/{deployment_id}/rollback | rollbackDeployment | deployments:operate + step-up | /app/:org_slug/deployments/:deployment_id | S+ |
| GET | /deployments/{deployment_id}/events | streamDeploymentEvents | deployments:read + tenant + SSE | /app/:org_slug/deployments/:deployment_id | M3 |
| GET | /deployments/{deployment_id}/metrics | getDeploymentMetrics | metrics:read + tenant | /app/:org_slug/deployments/:deployment_id | M3 |
| GET | /deployments/{deployment_id}/logs | getDeploymentLogs | logs:read + tenant, redactado | /app/:org_slug/deployments/:deployment_id/logs | M3 |
| GET | /runtime-profiles | listApprovedRuntimeProfiles | deployments:read | /app/:org_slug/deployments/new | M2 |
| GET | /gpu-nodes | listGpuNodes | instance:read (detalle global) | /admin/gpu-nodes | M3 |
| GET | /gpu-nodes/{node_id} | getGpuNode | instance:read | /admin/gpu-nodes/:node_id | M3 |
| GET | /gpu-nodes/{node_id}/metrics | getGpuNodeMetrics | instance:read | /admin/gpu-nodes/:node_id | M3 |
| POST | /gpu-nodes/{node_id}/drain | drainGpuNode | instance:operate + step-up | /admin/gpu-nodes/:node_id | S+ |
| POST | /gpu-nodes/{node_id}/undrain | undrainGpuNode | instance:operate + step-up | /admin/gpu-nodes/:node_id | S+ |

### 1.6 API pública compatible con OpenAI
*Controller(s):* `OpenAiCompatibleController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | /v1/models | listServingModels | API key: models:read | SDK / docs | M2 |
| GET | /v1/models/{model_id} | getServingModel | API key: models:read | SDK / docs | M2 |
| POST | /v1/chat/completions | createChatCompletion | API key: inference:invoke + quota | SDK / playground externo | M2 |
| POST | /v1/completions | createCompletion | API key: inference:invoke + quota | SDK / clientes legacy | M2 |
| POST | /v1/embeddings | createEmbedding | API key: embeddings:invoke + modelo compatible | SDK / docs | S+ |
| POST | /v1/responses | createResponse | API key: inference:invoke + runtime compatible | SDK / docs | S+ |

### 1.7 Playground web con sesión y streaming
*Controller(s):* `PlaygroundController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/playground/sessions | listPlaygroundSessions | inference:invoke | /app/:org_slug/playground | M2 |
| POST | O/playground/sessions | createPlaygroundSession | inference:invoke | /app/:org_slug/playground | M2 |
| GET | /playground/sessions/{session_id} | getPlaygroundSession | inference:invoke + tenant | /app/:org_slug/playground/sessions/:session_id | M2 |
| PATCH | /playground/sessions/{session_id} | updatePlaygroundSession | inference:invoke + tenant | /app/:org_slug/playground/sessions/:session_id | M2 |
| DELETE | /playground/sessions/{session_id} | deletePlaygroundSession | inference:invoke + tenant | /app/:org_slug/playground | M3 |
| POST | /playground/sessions/{session_id}/generations | generatePlaygroundCompletion | inference:invoke + quota + SSE | /app/:org_slug/playground/sessions/:session_id | M2 |
| POST | /playground/generations/compare | comparePlaygroundGenerations | inference:invoke + límites | /app/:org_slug/playground/compare | S+ |

### 1.8 Control de admisión, políticas de routing, cuotas
*Controller(s):* `RoutingPoliciesController · QuotasController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/routing-policies | listRoutingPolicies | routing:read | /app/:org_slug/routing | S+ |
| POST | O/routing-policies | createRoutingPolicy | routing:manage | /app/:org_slug/routing/new | S+ |
| GET | /routing-policies/{policy_id} | getRoutingPolicy | routing:read + tenant | /app/:org_slug/routing/:policy_id | S+ |
| PATCH | /routing-policies/{policy_id} | updateRoutingPolicy | routing:manage + version | /app/:org_slug/routing/:policy_id | S+ |
| POST | /routing-policies/{policy_id}/activate | activateRoutingPolicy | routing:manage + step-up | /app/:org_slug/routing/:policy_id | S+ |
| GET | O/quotas | listQuotas | quotas:read | /app/:org_slug/quotas | M2 |
| PATCH | O/quotas/{quota_id} | updateQuota | quotas:manage + policy | /app/:org_slug/quotas | M3 |
| GET | O/quota-usage | getCurrentQuotaUsage | quotas:read | /app/:org_slug/quotas | M2 |
| GET | O/admission-metrics | getAdmissionMetrics | metrics:read | /app/:org_slug/dashboard | S+ |

### 1.9 Uso, métricas y costos estimados
*Controller(s):* `UsageController · MetricsController · CostEstimatesController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/usage/summary | getUsageSummary | usage:read | /app/:org_slug/usage | M2 |
| GET | O/usage/timeseries | getUsageTimeseries | usage:read | /app/:org_slug/usage | M3 |
| GET | O/usage/by-model | getUsageByModel | usage:read | /app/:org_slug/usage | M3 |
| GET | O/usage/by-key | getUsageByKey | usage:read | /app/:org_slug/usage | M3 |
| GET | O/usage/requests | listInferenceRequests | usage:read + redacción | /app/:org_slug/requests | M3 |
| GET | /usage/requests/{request_id} | getInferenceRequestSummary | usage:read + tenant | /app/:org_slug/requests/:request_id | M3 |
| POST | O/usage/exports | requestUsageExport | usage:export | /app/:org_slug/usage | M3 |
| GET | /usage/exports/{export_id} | getUsageExport | usage:export + tenant | /app/:org_slug/usage | M3 |
| GET | O/metrics/overview | getOrganizationMetrics | metrics:read | /app/:org_slug/dashboard | M3 |
| GET | O/metrics/latency | getLatencyMetrics | metrics:read | /app/:org_slug/observability/latency | M3 |
| GET | O/metrics/errors | getErrorMetrics | metrics:read | /app/:org_slug/observability/errors | M3 |
| GET | O/cost-estimates | getCostEstimates | usage:read | /app/:org_slug/costs | M3 |
| PATCH | O/cost-assumptions | updateCostAssumptions | costs:manage | /app/:org_slug/costs | S+ |

### 1.10 Benchmarks y experimentos
*Controller(s):* `BenchmarksController · ExperimentsController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/benchmarks | listBenchmarkRuns | benchmarks:read | /app/:org_slug/benchmarks | S+ |
| POST | O/benchmarks | createBenchmarkRun | benchmarks:run + presupuesto | /app/:org_slug/benchmarks/new | S+ |
| GET | /benchmarks/{benchmark_id} | getBenchmarkRun | benchmarks:read + tenant | /app/:org_slug/benchmarks/:benchmark_id | S+ |
| POST | /benchmarks/{benchmark_id}/start | startBenchmarkRun | benchmarks:run + step-up | /app/:org_slug/benchmarks/:benchmark_id | S+ |
| POST | /benchmarks/{benchmark_id}/cancel | cancelBenchmarkRun | benchmarks:run | /app/:org_slug/benchmarks/:benchmark_id | S+ |
| GET | /benchmarks/{benchmark_id}/results | getBenchmarkResults | benchmarks:read + tenant | /app/:org_slug/benchmarks/:benchmark_id | S+ |
| GET | /benchmarks/{benchmark_id}/events | streamBenchmarkEvents | benchmarks:read + tenant + SSE | /app/:org_slug/benchmarks/:benchmark_id | S+ |
| POST | /benchmarks/{benchmark_id}/exports | exportBenchmarkReport | benchmarks:export | /app/:org_slug/benchmarks/:benchmark_id | S+ |
| GET | O/experiments | listExperiments | experiments:read | /app/:org_slug/experiments | S+ |
| POST | O/experiments | createExperiment | experiments:write | /app/:org_slug/experiments/new | S+ |
| GET | /experiments/{experiment_id} | getExperiment | experiments:read + tenant | /app/:org_slug/experiments/:experiment_id | S+ |
| POST | /experiments/{experiment_id}/run | runExperiment | experiments:run + step-up | /app/:org_slug/experiments/:experiment_id | S+ |
| POST | /experiments/{experiment_id}/cancel | cancelExperiment | experiments:run | /app/:org_slug/experiments/:experiment_id | S+ |
| GET | /experiments/{experiment_id}/comparison | getExperimentComparison | experiments:read + tenant | /app/:org_slug/experiments/:experiment_id | S+ |
| POST | /experiments/{experiment_id}/promote | promoteExperimentCandidate | experiments:promote + step-up + rollback plan | /app/:org_slug/experiments/:experiment_id | S+ |
| POST | /experiments/{experiment_id}/rollback | rollbackExperimentPromotion | experiments:promote + step-up | /app/:org_slug/experiments/:experiment_id | S+ |

### 1.11 Datasets, artefactos y almacenamiento RustFS
*Controller(s):* `DatasetsController · ArtifactsController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/datasets | listDatasets | datasets:read | /app/:org_slug/datasets | S+ |
| POST | O/datasets | createDataset | datasets:write | /app/:org_slug/datasets/new | S+ |
| GET | /datasets/{dataset_id} | getDataset | datasets:read + tenant | /app/:org_slug/datasets/:dataset_id | S+ |
| POST | /datasets/{dataset_id}/validate | validateDataset | datasets:write + tenant | /app/:org_slug/datasets/:dataset_id | S+ |
| POST | /datasets/{dataset_id}/archive | archiveDataset | datasets:write | /app/:org_slug/datasets/:dataset_id | S+ |
| GET | O/artifacts | listArtifacts | artifacts:read | /app/:org_slug/artifacts | S+ |
| POST | O/artifacts/uploads | requestArtifactUpload | artifacts:write + cuota | /app/:org_slug/artifacts | S+ |
| POST | /artifacts/{artifact_id}/complete | completeArtifactUpload | artifacts:write + validación objeto/scan | /app/:org_slug/artifacts | S+ |
| GET | /artifacts/{artifact_id} | getArtifactMetadata | artifacts:read + tenant | /app/:org_slug/artifacts/:artifact_id | S+ |
| POST | /artifacts/{artifact_id}/download | issueArtifactDownload | artifacts:read + tenant | /app/:org_slug/artifacts/:artifact_id | S+ |
| POST | /artifacts/{artifact_id}/archive | archiveArtifact | artifacts:write + tenant | /app/:org_slug/artifacts/:artifact_id | S+ |

### 1.12 Auditoría, alertas, canales y webhooks
*Controller(s):* `AuditController · AlertsController · NotificationsController · WebhooksController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | O/audit-events | listAuditEvents | audit:read | /app/:org_slug/audit | M3 |
| GET | /audit-events/{audit_event_id} | getAuditEvent | audit:read + tenant | /app/:org_slug/audit/:event_id | M3 |
| POST | O/audit-exports | requestAuditExport | audit:export + step-up | /app/:org_slug/audit | M3 |
| GET | O/alerts | listOrganizationAlerts | alerts:read | /app/:org_slug/alerts | M3 |
| POST | /alerts/{alert_id}/acknowledge | acknowledgeAlert | alerts:manage + tenant | /app/:org_slug/alerts | M3 |
| GET | O/notification-channels | listNotificationChannels | notifications:read | /app/:org_slug/settings/notifications | M3 |
| POST | O/notification-channels | createNotificationChannel | notifications:manage | /app/:org_slug/settings/notifications | M3 |
| PATCH | /notification-channels/{channel_id} | updateNotificationChannel | notifications:manage + tenant | /app/:org_slug/settings/notifications | M3 |
| POST | /notification-channels/{channel_id}/test | testNotificationChannel | notifications:manage + rate limit | /app/:org_slug/settings/notifications | M3 |
| GET | O/webhooks | listWebhooks | webhooks:read | /app/:org_slug/settings/webhooks | S+ |
| POST | O/webhooks | createWebhook | webhooks:manage + SSRF defense | /app/:org_slug/settings/webhooks | S+ |
| PATCH | /webhooks/{webhook_id} | updateWebhook | webhooks:manage + tenant | /app/:org_slug/settings/webhooks | S+ |
| POST | /webhooks/{webhook_id}/rotate-secret | rotateWebhookSecret | webhooks:manage + step-up | /app/:org_slug/settings/webhooks | S+ |
| GET | /webhooks/{webhook_id}/deliveries | listWebhookDeliveries | webhooks:read + tenant | /app/:org_slug/settings/webhooks | S+ |

### 1.13 Administración de instancia, jobs y recuperación
*Controller(s):* `SystemController · InstallationController · JobsController · BackupsController`

| HTTP | Ruta (A salvo `/v1`) | operationId | Permiso / control | Vista consumidora | Fase |
|---|---|---|---|---|---|
| GET | /system/capabilities | getSystemCapabilities | Self, flags públicos safe | Onboarding / menú | M1 |
| GET | /system/version | getSystemVersion | instance:read | /admin/system | M1 |
| GET | /system/status | getSystemStatus | instance:read | /admin/system | M1 |
| GET | /system/settings | getSystemSettings | instance:admin | /admin/settings | M3 |
| PATCH | /system/settings | updateSystemSettings | instance:admin + step-up | /admin/settings | M3 |
| GET | /system/jobs | listSystemJobs | instance:read | /admin/jobs | M3 |
| GET | /system/jobs/{job_id} | getSystemJob | instance:read | /admin/jobs/:job_id | M3 |
| GET | /system/jobs/{job_id}/events | streamSystemJobEvents | instance:read + SSE | /admin/jobs/:job_id | M3 |
| GET | /system/backups | listBackups | instance:admin | /admin/backups | M3 |
| GET | /system/backups/{backup_id} | getBackupMetadata | instance:admin | /admin/backups/:backup_id | M3 |
| POST | /system/backups/run | requestBackup | instance:admin + step-up | /admin/backups | M3 |
| POST | /system/backups/{backup_id}/verify | verifyBackup | instance:admin + step-up | /admin/backups/:backup_id | M3 |
| GET | /system/health/live | getLiveness | Interno; sin datos privados | Monitores internos | M1 |
| GET | /system/health/ready | getReadiness | Interno; sin datos privados | Monitores internos | M1 |

**Total de operaciones planificadas: 163** repartidas en 13 grupos. No todas corresponden al MVP ni son promesas de compatibilidad hasta aprobar contrato y pruebas. La cantidad no es un objetivo de arquitectura: reducir endpoints redundantes durante la implementación cuando una pantalla no requiere API propia.

### 1.14 Restricciones y endpoints que NO expondremos
- Sin `/api/v1/execute-shell`, `/docker/exec`, ejecución arbitraria de Compose, cambios de volumen/puerto a petición del browser, descarga irrestricta por URL ni acceso directo de clientes a vLLM/Valkey/PostgreSQL.
- No endpoint público de restauración completa de PostgreSQL. La restauración se ejecutará desde CLI/runbook en aislamiento con aprobación y prueba de recuperación; `/system/backups/*` solo orquesta verificaciones/backup bajo privilegios.
- No exponer Prometheus `/metrics` ni información DCGM por internet; Caddy solo publica puertos 80/443. Webhooks y descarga de modelos deben evitar SSRF, DNS rebinding, redirects inseguros, IP privadas y destinos no allowlisted.
- Los comandos de despliegue `activate/stop/rollback` se activarán como acciones efectivas únicamente después de integrar un agente restringido y pruebas negativas; fase MVP puede registrar configuraciones y observar perfiles Compose existentes.

## 2. Arquitectura de páginas y navegación frontend
**Plantilla URL:** `/app/:org_slug/*`; el slug es solo routing y no credencial. `OrgRouteGuard` comprueba la organización actual mediante backend antes de presentar cualquier dato. `InstanceAdminGuard` en `/admin/*` no equivale a `OrgAdminGuard`.

### 2.1 Todas las rutas frontend propuestas
#### Públicas y onboarding
| Ruta | Página (feature/pages) | Acceso | Objetivo | API relacionada |
|---|---|---|---|---|
| `/login` | `login.page.tsx` | Pública | Contraseña; Google; Facebook; OTP | POST /auth/password/login; GET /auth/oauth/.../start |
| `/register` | `register.page.tsx` | Pública si registro abierto | Registro accesible y protección abuso | POST /auth/register |
| `/password/forgot` | `forgot-password.page.tsx` | Pública | Correo de recuperación (respuesta genérica) | POST /auth/password/recovery/request |
| `/password/reset` | `reset-password.page.tsx` | Token de recuperación | Restablecer password sin exponer token en logs | POST /auth/password/recovery/complete |
| `/login/otp` | `email-otp.page.tsx` | Challenge iniciado | Solicitar y validar OTP; reenvío limitado | POST /auth/otp/request; POST /auth/otp/verify |
| `/auth/complete` | `oauth-complete.page.tsx` | Callback finalizado | Resultado y redirección controlada | GET /auth/me |
| `/mfa/challenge` | `mfa-challenge.page.tsx` | Challenge activo | TOTP o recovery code | POST /auth/mfa/challenge/verify |
| `/invite/accept` | `invitation-accept.page.tsx` | Login + invitación válida | Aceptar organización | POST /invitations/accept |
| `/onboarding` | `welcome.page.tsx` | Usuario/owner inicial | Checklist del sistema, salud y cuenta | GET /system/capabilities |
| `/onboarding/organization` | `create-organization.page.tsx` | Usuario inicial | Crear organización, slug y configuración | POST /organizations |
| `/onboarding/first-model` | `first-model.page.tsx` | models:write | Guiado al modelo y perfil runtime | GET /runtime-profiles; POST O/models |

#### Home y trabajo diario
| Ruta | Página (feature/pages) | Acceso | Objetivo | API relacionada |
|---|---|---|---|---|
| `/app/:org_slug/dashboard` | `dashboard.page.tsx` | metrics:read | KPIs, TTFT, VRAM, alertas, colas | GET O/metrics/overview; GET O/alerts |
| `/app/:org_slug/playground` | `playground.page.tsx` | inference:invoke | Chat vacío, selector de modelos y presets | GET O/playground/sessions; GET O/models |
| `/app/:org_slug/playground/sessions/:session_id` | `playground-session.page.tsx` | inference:invoke | Streaming, mensajes, abortar, historial | GET /playground/sessions/:id; POST .../generations |
| `/app/:org_slug/playground/compare` | `compare-completions.page.tsx` | inference:invoke | Comparar dos respuestas con costo | POST /playground/generations/compare |
| `/app/:org_slug/requests` | `inference-requests.page.tsx` | usage:read | Historial operativo de solicitudes sin prompts | GET O/usage/requests |
| `/app/:org_slug/requests/:request_id` | `inference-request-detail.page.tsx` | usage:read | Trace ID, latencias, modelo, token usage | GET /usage/requests/:request_id |

#### Modelos y deployments
| Ruta | Página (feature/pages) | Acceso | Objetivo | API relacionada |
|---|---|---|---|---|
| `/app/:org_slug/models` | `models-list.page.tsx` | models:read | Listado, filtros, estado, capacidad | GET O/models |
| `/app/:org_slug/models/new` | `register-model.page.tsx` | models:write | Wizard manifiesto/licencia/compatibilidad | POST O/models/validate; POST O/models |
| `/app/:org_slug/models/:model_id` | `model-details.page.tsx` | models:read | Detalle, versiones, specs, capabilities | GET /models/:model_id |
| `/app/:org_slug/models/:model_id/settings` | `model-settings.page.tsx` | models:write | Metadatos, políticas, archivado | PATCH /models/:model_id |
| `/app/:org_slug/models/:model_id/versions` | `model-versions.page.tsx` | models:read | Comparativa de versiones | GET /models/:model_id/versions |
| `/app/:org_slug/model-imports` | `model-imports-list.page.tsx` | models:read | Descargas/importaciones | GET O/model-imports |
| `/app/:org_slug/model-imports/new` | `start-model-import.page.tsx` | models:write | Origen allowlisted y validación | POST O/model-imports |
| `/app/:org_slug/model-imports/:import_id` | `model-import-detail.page.tsx` | models:read | Progreso live, cancelación, error | GET /model-imports/:id/events |
| `/app/:org_slug/deployments` | `deployments-list.page.tsx` | deployments:read | Estado de runtime y recursos | GET O/deployments |
| `/app/:org_slug/deployments/new` | `create-deployment.page.tsx` | deployments:write | Preflight hardware y presets aprobados | POST O/deployments; GET /runtime-profiles |
| `/app/:org_slug/deployments/:deployment_id` | `deployment-detail.page.tsx` | deployments:read | Health, acciones permitidas, métricas | GET /deployments/:id; GET /deployments/:id/events |
| `/app/:org_slug/deployments/:deployment_id/logs` | `deployment-logs.page.tsx` | logs:read | Logs redactados, búsqueda, export seguro | GET /deployments/:id/logs |

#### Consumo y optimización
| Ruta | Página (feature/pages) | Acceso | Objetivo | API relacionada |
|---|---|---|---|---|
| `/app/:org_slug/api-keys` | `api-keys-list.page.tsx` | credentials:read | Listar keys enmascaradas | GET O/api-keys |
| `/app/:org_slug/api-keys/new` | `create-api-key.page.tsx` | credentials:manage | Scopes, vencimiento, mostrar secreto solo una vez | POST O/api-keys |
| `/app/:org_slug/api-keys/:key_id` | `api-key-details.page.tsx` | credentials:read | Metadata, consumo, rotación, revocación | GET /api-keys/:id; GET /api-keys/:id/usage |
| `/app/:org_slug/quotas` | `quotas.page.tsx` | quotas:read | Límites de tokens, concurrencia y presupuestos | GET O/quotas; GET O/quota-usage |
| `/app/:org_slug/usage` | `usage.page.tsx` | usage:read | Tokens, series, modelos, llaves | GET O/usage/summary; GET O/usage/timeseries |
| `/app/:org_slug/costs` | `cost-estimates.page.tsx` | usage:read | Estimaciones y supuestos declarados | GET O/cost-estimates |
| `/app/:org_slug/observability/latency` | `latency.page.tsx` | metrics:read | TTFT, TPOT, p50/p95/p99 | GET O/metrics/latency |
| `/app/:org_slug/observability/errors` | `errors.page.tsx` | metrics:read | Errores, saturación, upstream, trace ID | GET O/metrics/errors |
| `/app/:org_slug/routing` | `routing-policies.page.tsx` | routing:read | Políticas activas y priorización | GET O/routing-policies |
| `/app/:org_slug/routing/new` | `create-routing-policy.page.tsx` | routing:manage | Wizard de reglas y simulación | POST O/routing-policies |
| `/app/:org_slug/routing/:policy_id` | `routing-policy-details.page.tsx` | routing:read | Rules, activación, revisión, versiones | GET /routing-policies/:id |
| `/app/:org_slug/benchmarks` | `benchmarks-list.page.tsx` | benchmarks:read | Runs, filtros, estado, baseline | GET O/benchmarks |
| `/app/:org_slug/benchmarks/new` | `create-benchmark.page.tsx` | benchmarks:run | Dataset, concurrencia, warm-up, presupuesto | POST O/benchmarks |
| `/app/:org_slug/benchmarks/:benchmark_id` | `benchmark-detail.page.tsx` | benchmarks:read | Progreso SSE, TTFT, throughput, resultados | GET /benchmarks/:id/results; GET /benchmarks/:id/events |
| `/app/:org_slug/experiments` | `experiments-list.page.tsx` | experiments:read | Experimentos A/B reproducibles | GET O/experiments |
| `/app/:org_slug/experiments/new` | `create-experiment.page.tsx` | experiments:write | Baseline/candidate con condiciones iguales | POST O/experiments |
| `/app/:org_slug/experiments/:experiment_id` | `experiment-detail.page.tsx` | experiments:read | Comparativas, promoción, rollback | GET /experiments/:id/comparison |

#### Organización y seguridad
| Ruta | Página (feature/pages) | Acceso | Objetivo | API relacionada |
|---|---|---|---|---|
| `/app/:org_slug/members` | `members.page.tsx` | members:read | Miembros, roles, desactivar acceso | GET O/members; PATCH O/members/:id |
| `/app/:org_slug/invitations` | `invitations.page.tsx` | members:manage | Invitar, reenviar, revocar | GET O/invitations; POST O/invitations |
| `/app/:org_slug/settings/general` | `organization-settings.page.tsx` | org:read | Nombre, slug, atributos, límites | GET /organizations/:id |
| `/app/:org_slug/settings/notifications` | `notification-settings.page.tsx` | notifications:manage | Canales, alertas y envío de test | GET O/notification-channels |
| `/app/:org_slug/settings/webhooks` | `webhook-settings.page.tsx` | webhooks:manage | Destinos y entregas; protección SSRF | GET O/webhooks |
| `/app/:org_slug/alerts` | `organization-alerts.page.tsx` | alerts:read | Incidentes, severidad, acuse | GET O/alerts |
| `/app/:org_slug/audit` | `audit-events.page.tsx` | audit:read | Eventos redactados, export filtrado | GET O/audit-events |
| `/app/:org_slug/audit/:event_id` | `audit-event-detail.page.tsx` | audit:read | Contexto y actor, sin credenciales | GET /audit-events/:id |
| `/account/profile` | `profile.page.tsx` | Self | Datos personales y preferencias | GET /auth/me |
| `/account/security` | `security-settings.page.tsx` | Self | Password, MFA, recovery codes, step-up | POST /auth/mfa/totp/enroll |
| `/account/sessions` | `active-sessions.page.tsx` | Self | Dispositivos, cierre remoto | GET /auth/sessions |
| `/account/connections` | `social-connections.page.tsx` | Self | Vincular y desvincular Google/Facebook | GET /auth/identities |

#### Artefactos avanzados y admin de instancia
| Ruta | Página (feature/pages) | Acceso | Objetivo | API relacionada |
|---|---|---|---|---|
| `/app/:org_slug/datasets` | `datasets-list.page.tsx` | datasets:read | Corpus para benchmarking | GET O/datasets |
| `/app/:org_slug/datasets/new` | `create-dataset.page.tsx` | datasets:write | Dataset, esquema, licencia | POST O/datasets |
| `/app/:org_slug/datasets/:dataset_id` | `dataset-detail.page.tsx` | datasets:read | Versiones y validación | GET /datasets/:id |
| `/app/:org_slug/artifacts` | `artifacts-list.page.tsx` | artifacts:read | Archivos de resultados/modelos | GET O/artifacts |
| `/app/:org_slug/artifacts/:artifact_id` | `artifact-detail.page.tsx` | artifacts:read | Checksum, estado de escaneo | GET /artifacts/:id |
| `/admin/system` | `instance-health.page.tsx` | instance:read | Estado, versión, componentes | GET /system/status |
| `/admin/gpu-nodes` | `gpu-nodes-list.page.tsx` | instance:read | GPU host y métricas de infraestructura | GET /gpu-nodes |
| `/admin/gpu-nodes/:node_id` | `gpu-node-detail.page.tsx` | instance:read | VRAM, DCGM, drain/undrain | GET /gpu-nodes/:id |
| `/admin/backups` | `backups-list.page.tsx` | instance:admin | Backup status, verificación y restore guidance | GET /system/backups |
| `/admin/backups/:backup_id` | `backup-detail.page.tsx` | instance:admin | Metadata y verificación aislada | GET /system/backups/:id |
| `/admin/jobs` | `system-jobs.page.tsx` | instance:read | Trabajos asíncronos y estados | GET /system/jobs |
| `/admin/jobs/:job_id` | `system-job-detail.page.tsx` | instance:read | Progreso y diagnóstico redactado | GET /system/jobs/:id/events |
| `/admin/settings` | `instance-settings.page.tsx` | instance:admin | OAuth SMTP políticas seguridad runtime | GET /system/settings |

**Total de páginas planificadas: 71**. La navegación principal expone solo tareas frecuentes; pantallas de detalle/confirmación estarán en rutas contextuales o diálogos, sin convertir el sidebar en un menú de 71 entradas.

### 2.2 Mapa de navegación (sidebar real)
```text
[Selector de organización]   [Buscar]   [Alertas]   [Perfil]
│
├── Overview
│   ├── Dashboard
│   ├── Solicitudes
│   └── Observabilidad (latencia / errores)
├── Inferencia
│   ├── Playground
│   ├── Modelos
│   ├── Despliegues
│   └── API Keys
├── Optimización [S+]
│   ├── Routing
│   ├── Cuotas
│   ├── Usage y costos estimados
│   ├── Benchmarks
│   └── Experimentos
├── Datos [opcional RustFS]
│   ├── Datasets
│   └── Artefactos
├── Organización
│   ├── Miembros e invitaciones
│   ├── Auditoría y alertas
│   └── Configuración
└── Administración de instancia [solo instance_admin]
    ├── GPU Nodes
    ├── Backups y Jobs
    └── Configuración de plataforma
```
**Responsive:** sidebar plegable en desktop; menú móvil por secciones. Rutas de detalle nunca dependen de un único modal; deep-links, recarga y botón atrás deben funcionar. Guard UI solo oculta; el backend decide permisos.

### 2.3 Carpeta frontend orientada a rutas
```text
inferra-web/src/
├── app/
│   ├── app.tsx
│   ├── routes.tsx                    # lazy imports, route ids, 404/403
│   ├── layouts/
│   │   ├── public.layout.tsx
│   │   ├── authenticated.layout.tsx
│   │   ├── organization.layout.tsx
│   │   └── instance-admin.layout.tsx
│   ├── guards/
│   │   ├── authenticated-route.guard.tsx
│   │   ├── organization-route.guard.tsx
│   │   └── instance-admin-route.guard.tsx
│   └── providers/
├── features/
│   ├── auth/pages/
│   ├── onboarding/pages/
│   ├── dashboard/pages/
│   ├── playground/pages/
│   ├── models/pages/
│   ├── model-imports/pages/
│   ├── deployments/pages/
│   ├── gpu-nodes/pages/
│   ├── api-keys/pages/
│   ├── routing/pages/
│   ├── quotas/pages/
│   ├── usage/pages/
│   ├── costs/pages/
│   ├── observability/pages/
│   ├── benchmarks/pages/
│   ├── experiments/pages/
│   ├── organizations/pages/
│   ├── security/pages/
│   ├── audit/pages/
│   ├── alerts/pages/
│   ├── notifications/pages/
│   ├── datasets/pages/
│   ├── artifacts/pages/
│   └── system/pages/
├── services/
│   ├── http/api-client.ts           # cookies, CSRF, problem details, retry seguro
│   ├── auth/session.client.ts
│   ├── inference/chat-stream.client.ts # fetch ReadableStream + AbortController
│   └── runtime-config/
└── libs/ui/                      # primitives agnósticas de negocio
```
Cada feature tiene su `pages/`, `components/`, `hooks/`, `services/` y tests según su consumo real. TanStack Query conserva server state; React Hook Form con DTO Zod del backend conserva formularios; Signals se limitan a estado UI local. No copiar respuestas HTTP a un store global.

## 3. DTOs y contratos concretos de operaciones críticas
### 3.1 OTP — `POST A/auth/otp/request`
```json
{ "email": "usuario@empresa.com", "purpose": "sign_in" }
```
```json
{ "challenge_id": "uuid", "expires_in_seconds": 300, "resend_after_seconds": 60 }
```
Respuesta neutral, aunque el correo no exista. OTP hasheado con secreto del servidor, máximo de intentos y consume-once atómico. `verify` recibe `challenge_id` y `code` en body, no en query string. No iniciar sesión hasta completar MFA si aplica.
### 3.2 API key — `POST O/api-keys`
```json
{ "name": "backend-erp", "scopes": ["inference:invoke", "models:read"], "model_ids": ["uuid"], "expires_at": "2027-01-01T00:00:00Z" }
```
```json
{ "id": "uuid", "prefix": "inf_live_abc", "secret_once": "inf_live_...", "created_at": "2026-11-08T00:00:00Z" }
```
El secreto se muestra una sola vez, el hash se conserva en PostgreSQL; rotación revoca o deja coexistencia temporal corta configurable. No incluir `secret_once` en GET, logs, audit trail ni telemetry.
### 3.3 Inference — `POST /v1/chat/completions`
```json
{ "model": "qwen-production", "messages": [{"role":"user","content":"Hola"}], "stream": true, "max_tokens": 128 }
```
Respuesta stream compatible con cliente OpenAI (framing `data: ...` y `data: [DONE]` cuando aplique al contrato elegido); para respuestas no stream usar JSON OpenAI-compatible. Cabeceras Caddy/SSE sin buffering, timeout/abort propagados al upstream, no reintentos automáticos una vez emitido el primer token. Poner límites por prompt, tokens, concurrencia y organización.
### 3.4 Playground — `POST A/playground/sessions/{session_id}/generations`
Mismo motor, otra frontera de autorización (cookie web + CSRF + membership). El navegador **no recibe** API key para probar modelos. El stream emite tipos propios versionados (`generation.started`, `generation.delta`, `generation.completed`, `generation.failed`) junto con `request_id` y uso total final; no prometer el mismo framing OpenAI de `/v1` si no se ha normalizado explícitamente.
### 3.5 Benchmark — `POST O/benchmarks`
```json
{ "deployment_id":"uuid", "dataset_id":"uuid", "concurrency": 32, "warmup_requests": 25, "measured_requests": 200, "max_output_tokens": 256, "seed": 41 }
```
`201` crea la configuración; `POST /benchmarks/{id}/start` responde `202` con `job_id`, el progreso se observa por SSE y los resultados incluyen software/hardware/semilla/cache/quantization/picos VRAM, TTFT, throughput y errores. Se evita ejecutar varios benchmarks simultáneos que invaliden la comparación en una misma GPU.

## 4. Flujos frontend ↔ endpoints de punta a punta
### 4.1 Login con Google/Facebook
`/login` → `GET /auth/oauth/google|facebook/start` → provider externo → `/auth/oauth/{provider}/callback` (backend valida state/PKCE, identity) → cookie de sesión → `/auth/complete` → `GET /auth/me` → MFA si aplica → org selector/dashboard. No auto-vincular cuentas solo por email.

### 4.2 Login OTP
`/login/otp` → request challenge → mensaje genérico y temporizador → verify atómico → sesión limitada hasta MFA, si aplica → dashboard. Estados: reenviar, expirado, demasiados intentos, sin SMTP, código usado.

### 4.3 Crear primer modelo
`/onboarding/first-model` → `GET /system/capabilities`, `GET /runtime-profiles` → validar manifiesto → registrar modelo → crear deployment en perfil aprobado → si el agente de lifecycle está instalado, activar job 202 → progreso SSE → ready → Playground.

### 4.4 Generar tokens desde web
`/playground` → cargar modelos autorizados → crear/seleccionar sesión → POST stream con cookie+CSRF → Gateway valida cuota/reserva GPU → vLLM → delta SSE → contabilización final → UI muestra latencia, tokens, cancelación y errores sin fuga de prompts.

### 4.5 Crear API key
`/api-keys/new` → step-up → scopes/modelo/caducidad → POST → mostrar `secret_once` con acción copiar una vez → confirmación guardado → la credencial no vuelve a mostrarse → auditoría de emisión.

### 4.6 Ejecutar benchmark
`/benchmarks/new` → wizard dataset/deployment/concurrencia → POST configuración → POST start (202) → SSE de progreso → GET results → comparar baseline en Experiments → reporte reproducible.

### 4.7 Restauración de incidentes
`/admin/backups` permite ver estado, verificar copia y abrir runbook; restauración completa no es un endpoint web. Se requiere operación CLI aislada, autorización fuera de banda y restore drill.

## 5. Guards, policies, errores y estados UX
**Roles:** `instance_owner`, `instance_admin`, `org_owner`, `org_admin`, `operator`, `developer`, `analyst`, `auditor`, `viewer`. La autorización REAL usa permisos de acción y recurso; los roles solo agrupan permisos. Un mismo usuario puede pertenecer a varias organizaciones con roles diferentes.
**Guards backend:** `SessionAuthGuard`, `ApiKeyAuthGuard` (nunca ambos implícitos), `CsrfGuard`, `OrganizationMembershipGuard`, `PolicyGuard`, `StepUpGuard`, `RateLimitGuard`, `RequestSizeGuard`, `TenantResourceGuard`. La clave de API incorpora la organización y scopes, no acepta `organization_id` arbitrario del body.
**Estados de todas las pantallas:** `loading`, `empty`, `success`, `validation_error`, `401 session_expired`, `403 forbidden`, `404 not_found_or_hidden`, `409 conflict`, `429 rate_limited`, `502/503 runtime_unavailable`, `offline`, `cancelled`; conservar filtros en URL, foco tras diálogos y botón atrás. Para streaming: `connecting/streaming/stopping/finished/failed`, cleanup de AbortController y reconexión solo para eventos repetibles o idempotentes.
**Rutas observables:** un backend 404 cross-tenant no revela si el UUID existe en otra empresa; la UI no es frontera de seguridad. En cambio 403 sirve para accesos con pertenencia verificada sin autorización. `request_id` permite soporte sin divulgar prompt.

## 6. Tests por contrato y por pantalla (criterios de aceptación)
| Área | E2E API/BDD obligatorio | E2E frontend Playwright |
|---|---|---|
| Auth | OTP consume-once + expiración + reintentos; OAuth state/nonce; link seguro; cookie CSRF; reuse refresh | Google/Facebook simulados con provider stub, OTP, MFA, sesiones y return URL |
| Tenancy | UUID de otro org responde 404 sin leak; user con orgs múltiples; escalación imposible | Cambiar org limpia queries, filtros y contextos; guard + error page |
| API Keys | scope insuficiente 403; key revocada 401; secreto jamás GET; rate limit | Secreto visible una sola vez; rotación con step-up |
| Inference | SSE termina correctamente; abort upstream; cuotas atómicas; backpressure y timeout | Streaming incremental, stop, error GPU, navegación y reintento seguro |
| Deployments | State machine; doble activate idempotente; agente sin Docker arbitrario | Wizard preflight, estados pending/failed/ready, actualización live |
| Benchmarks | Aislamiento dataset, job idempotente, cache control, resultados reproducibles | Progreso SSE, comparación, export y cancelación |
| Operación | Sin SQL/RustFS/Valkey/vLLM público; backup verificable; health mínimo | Páginas admin aisladas y redacción de logs |

## 7. Scaffolding recomendado de controllers y DTOs
```text
inferra-impl/src/modules/
├── identity/presentation/http/{controllers, dto, docs}/
│   ├── controllers/identity.controller.ts
│   ├── controllers/oauth.controller.ts
│   ├── controllers/sessions.controller.ts
│   ├── controllers/mfa.controller.ts
│   ├── dto/request-email-otp.request.dto.ts
│   ├── dto/verify-email-otp.request.dto.ts
│   └── docs/verify-email-otp.request.doc.ts
├── inference/presentation/http/
│   ├── controllers/openai-compatible.controller.ts
│   ├── dto/create-chat-completion.request.dto.ts
│   └── streaming/{sse-stream.writer.ts,stream-disconnect.handler.ts}
├── model-catalog/presentation/http/{controllers,dto,docs}/
├── model-deployments/presentation/http/{controllers,dto,docs}/
├── quotas/presentation/http/{controllers,dto,docs}/
├── usage-ledger/presentation/http/{controllers,dto,docs}/
├── benchmarks/presentation/http/{controllers,dto,docs}/
├── experiments/presentation/http/{controllers,dto,docs}/
└── system/presentation/http/{controllers,dto,docs}/
```
Ejemplo de ownership de flujo: `OpenAiCompatibleController` → `CreateChatCompletionService` → `QuotaReservationPort` + `RuntimeRouterPort` + `InferenceRuntimePort` → adaptadores `ValkeyQuotaReservationAdapter` / `VllmOpenAiAdapter`, después registrar uso idempotente y emitir telemetría. Controllers, application y domain no dependen de Drizzle o Docker directamente.

## 8. Referencias efectivamente consultadas
Archivo adjunto `skills(4).zip`: `precision-skill-reading/SKILL.md`, `vigilio-auto-senior/SKILL.md` + sus cuatro referencias, `node-nest-build-feature/SKILL.md` + `references/feature-patterns.md`, `platform-compose-vps-delivery/SKILL.md` + `references/canonical-contract.md`, `ux-information-architecture/SKILL.md` + `references/execution.md`, `node-nest-realtime/SKILL.md` + `references/realtime-patterns.md`.
Archivo adjunto `vigilio-docs(3).zip`: `standards/api/rest-endpoint-design.md`, `standards/api/http-errors-and-pagination.md`, `standards/api/openapi-operation-documentation.md`, `stacks/backend/nestjs/http/semantic-dtos-and-pagination.md`, `standards/experience/information-architecture-and-user-flows.md`, `.compat/frontend-web-mfe/3-arquitectura-estructura-estado.md`, `.compat/frontend-web-mfe/1-contratos-dtos-zod-tanstack.md`; planos previos de Inferra en la conversación. Algunos estándares de skills enlazan normas adicionales de alcance mayor que no son una certificación de implementación aquí.
**Gates de implementación:** `NOT_RUN`. Este documento es un contrato propuesto, no OpenAPI generado, no diseño UI validado con usuarios ni endpoint implementado. Reconciliar con código real, lockfiles, políticas efectivas y tests antes de publicar la API.
