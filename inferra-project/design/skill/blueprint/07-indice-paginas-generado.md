# Catálogo de páginas frontend — derivado de CSV

**71 páginas planificadas.** Fuente de verdad: `03-matriz-paginas.csv`. No es un registro de rutas real de Preact.

## account (4)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/account/profile` | `src/features/account/pages/profile.page.tsx` | Self | M1 |
| `/account/security` | `src/features/account/pages/security-settings.page.tsx` | Self | M1 |
| `/account/sessions` | `src/features/account/pages/active-sessions.page.tsx` | Self | M1 |
| `/account/connections` | `src/features/account/pages/social-connections.page.tsx` | Self | M1 |

## alerts (1)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/alerts` | `src/features/alerts/pages/organization-alerts.page.tsx` | alerts:read | M3 |

## api-keys (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/api-keys` | `src/features/api-keys/pages/api-keys-list.page.tsx` | credentials:read | M2 |
| `/app/:org_slug/api-keys/new` | `src/features/api-keys/pages/create-api-key.page.tsx` | credentials:manage | M2 |
| `/app/:org_slug/api-keys/:key_id` | `src/features/api-keys/pages/api-key-details.page.tsx` | credentials:read | M2 |

## artifacts (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/artifacts` | `src/features/artifacts/pages/artifacts-list.page.tsx` | artifacts:read | S+ |
| `/app/:org_slug/artifacts/:artifact_id` | `src/features/artifacts/pages/artifact-detail.page.tsx` | artifacts:read | S+ |

## audit (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/audit` | `src/features/audit/pages/audit-events.page.tsx` | audit:read | M3 |
| `/app/:org_slug/audit/:event_id` | `src/features/audit/pages/audit-event-detail.page.tsx` | audit:read | M3 |

## auth (7)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/login` | `src/features/auth/pages/login.page.tsx` | Pública | M1 |
| `/register` | `src/features/auth/pages/register.page.tsx` | Pública si registro abierto | M1 |
| `/password/forgot` | `src/features/auth/pages/forgot-password.page.tsx` | Pública | M1 |
| `/password/reset` | `src/features/auth/pages/reset-password.page.tsx` | Token de recuperación | M1 |
| `/login/otp` | `src/features/auth/pages/email-otp.page.tsx` | Challenge iniciado | M1 |
| `/auth/complete` | `src/features/auth/pages/oauth-complete.page.tsx` | Callback finalizado | M1 |
| `/mfa/challenge` | `src/features/auth/pages/mfa-challenge.page.tsx` | Challenge activo | M1 |

## backups (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/admin/backups` | `src/features/backups/pages/backups-list.page.tsx` | instance:admin | M3 |
| `/admin/backups/:backup_id` | `src/features/backups/pages/backup-detail.page.tsx` | instance:admin | M3 |

## benchmarks (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/benchmarks` | `src/features/benchmarks/pages/benchmarks-list.page.tsx` | benchmarks:read | S+ |
| `/app/:org_slug/benchmarks/new` | `src/features/benchmarks/pages/create-benchmark.page.tsx` | benchmarks:run | S+ |
| `/app/:org_slug/benchmarks/:benchmark_id` | `src/features/benchmarks/pages/benchmark-detail.page.tsx` | benchmarks:read | S+ |

## costs (1)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/costs` | `src/features/costs/pages/cost-estimates.page.tsx` | usage:read | M3 |

## dashboard (1)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/dashboard` | `src/features/dashboard/pages/dashboard.page.tsx` | metrics:read | M2 |

## datasets (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/datasets` | `src/features/datasets/pages/datasets-list.page.tsx` | datasets:read | S+ |
| `/app/:org_slug/datasets/new` | `src/features/datasets/pages/create-dataset.page.tsx` | datasets:write | S+ |
| `/app/:org_slug/datasets/:dataset_id` | `src/features/datasets/pages/dataset-detail.page.tsx` | datasets:read | S+ |

## deployments (4)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/deployments` | `src/features/deployments/pages/deployments-list.page.tsx` | deployments:read | M2 |
| `/app/:org_slug/deployments/new` | `src/features/deployments/pages/create-deployment.page.tsx` | deployments:write | M2 |
| `/app/:org_slug/deployments/:deployment_id` | `src/features/deployments/pages/deployment-detail.page.tsx` | deployments:read | M2 |
| `/app/:org_slug/deployments/:deployment_id/logs` | `src/features/deployments/pages/deployment-logs.page.tsx` | logs:read | M2 |

## experiments (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/experiments` | `src/features/experiments/pages/experiments-list.page.tsx` | experiments:read | S+ |
| `/app/:org_slug/experiments/new` | `src/features/experiments/pages/create-experiment.page.tsx` | experiments:write | S+ |
| `/app/:org_slug/experiments/:experiment_id` | `src/features/experiments/pages/experiment-detail.page.tsx` | experiments:read | S+ |

## gpu-nodes (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/admin/gpu-nodes` | `src/features/gpu-nodes/pages/gpu-nodes-list.page.tsx` | instance:read | M3 |
| `/admin/gpu-nodes/:node_id` | `src/features/gpu-nodes/pages/gpu-node-detail.page.tsx` | instance:read | M3 |

## jobs (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/admin/jobs` | `src/features/jobs/pages/system-jobs.page.tsx` | instance:read | M3 |
| `/admin/jobs/:job_id` | `src/features/jobs/pages/system-job-detail.page.tsx` | instance:read | M3 |

## model-imports (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/model-imports` | `src/features/model-imports/pages/model-imports-list.page.tsx` | models:read | M3 |
| `/app/:org_slug/model-imports/new` | `src/features/model-imports/pages/start-model-import.page.tsx` | models:write | M3 |
| `/app/:org_slug/model-imports/:import_id` | `src/features/model-imports/pages/model-import-detail.page.tsx` | models:read | M3 |

## models (5)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/models` | `src/features/models/pages/models-list.page.tsx` | models:read | M2 |
| `/app/:org_slug/models/new` | `src/features/models/pages/register-model.page.tsx` | models:write | M2 |
| `/app/:org_slug/models/:model_id` | `src/features/models/pages/model-details.page.tsx` | models:read | M2 |
| `/app/:org_slug/models/:model_id/settings` | `src/features/models/pages/model-settings.page.tsx` | models:write | M2 |
| `/app/:org_slug/models/:model_id/versions` | `src/features/models/pages/model-versions.page.tsx` | models:read | M2 |

## notifications (1)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/settings/notifications` | `src/features/notifications/pages/notification-settings.page.tsx` | notifications:manage | M3 |

## observability (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/observability/latency` | `src/features/observability/pages/latency.page.tsx` | metrics:read | M3 |
| `/app/:org_slug/observability/errors` | `src/features/observability/pages/errors.page.tsx` | metrics:read | M3 |

## onboarding (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/onboarding` | `src/features/onboarding/pages/welcome.page.tsx` | Usuario/owner inicial | M1 |
| `/onboarding/organization` | `src/features/onboarding/pages/create-organization.page.tsx` | Usuario inicial | M1 |
| `/onboarding/first-model` | `src/features/onboarding/pages/first-model.page.tsx` | models:write | M1 |

## organizations (4)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/invite/accept` | `src/features/organizations/pages/invitation-accept.page.tsx` | Login + invitación válida | M1 |
| `/app/:org_slug/members` | `src/features/organizations/pages/members.page.tsx` | members:read | M1 |
| `/app/:org_slug/invitations` | `src/features/organizations/pages/invitations.page.tsx` | members:manage | M1 |
| `/app/:org_slug/settings/general` | `src/features/organizations/pages/organization-settings.page.tsx` | org:read | M1 |

## playground (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/playground` | `src/features/playground/pages/playground.page.tsx` | inference:invoke | M2 |
| `/app/:org_slug/playground/sessions/:session_id` | `src/features/playground/pages/playground-session.page.tsx` | inference:invoke | M2 |
| `/app/:org_slug/playground/compare` | `src/features/playground/pages/compare-completions.page.tsx` | inference:invoke | M2 |

## quotas (1)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/quotas` | `src/features/quotas/pages/quotas.page.tsx` | quotas:read | M2 |

## routing (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/routing` | `src/features/routing/pages/routing-policies.page.tsx` | routing:read | S+ |
| `/app/:org_slug/routing/new` | `src/features/routing/pages/create-routing-policy.page.tsx` | routing:manage | S+ |
| `/app/:org_slug/routing/:policy_id` | `src/features/routing/pages/routing-policy-details.page.tsx` | routing:read | S+ |

## system (2)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/admin/system` | `src/features/system/pages/instance-health.page.tsx` | instance:read | M3 |
| `/admin/settings` | `src/features/system/pages/instance-settings.page.tsx` | instance:admin | M3 |

## usage (3)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/requests` | `src/features/usage/pages/inference-requests.page.tsx` | usage:read | M2 |
| `/app/:org_slug/requests/:request_id` | `src/features/usage/pages/inference-request-detail.page.tsx` | usage:read | M2 |
| `/app/:org_slug/usage` | `src/features/usage/pages/usage.page.tsx` | usage:read | M2 |

## webhooks (1)

| Ruta | Archivo | Acceso | Fase |
|---|---|---|---|
| `/app/:org_slug/settings/webhooks` | `src/features/webhooks/pages/webhook-settings.page.tsx` | webhooks:manage | S+ |

