# Inventario de endpoints — derivado de CSV

**163 operaciones planificadas.** Fuente de verdad: `02-matriz-endpoints.csv`. No es un Swagger ejecutado.

Prefijo `/api/v1` en todas las rutas salvo las que comiencen `/v1`. `O/` significa `/api/v1/organizations/{organization_id}/`.

## admission-control (1)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/admission-metrics` | `getAdmissionMetrics` | `AdmissionMetricsController` | S+ |

## alerts (2)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/alerts` | `listOrganizationAlerts` | `AlertsController` | M3 |
| POST | `/alerts/{alert_id}/acknowledge` | `acknowledgeAlert` | `AlertsController` | M3 |

## api-credentials (6)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/api-keys` | `listApiKeys` | `ApiCredentialsController` | M2 |
| POST | `O/api-keys` | `issueApiKey` | `ApiCredentialsController` | M2 |
| GET | `/api-keys/{api_key_id}` | `getApiKeyMetadata` | `ApiCredentialsController` | M2 |
| POST | `/api-keys/{api_key_id}/rotate` | `rotateApiKey` | `ApiCredentialsController` | M2 |
| POST | `/api-keys/{api_key_id}/revoke` | `revokeApiKey` | `ApiCredentialsController` | M2 |
| GET | `/api-keys/{api_key_id}/usage` | `getApiKeyUsage` | `ApiCredentialsController` | M3 |

## artifacts (6)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/artifacts` | `listArtifacts` | `ArtifactsController` | S+ |
| POST | `O/artifacts/uploads` | `requestArtifactUpload` | `ArtifactsController` | S+ |
| POST | `/artifacts/{artifact_id}/complete` | `completeArtifactUpload` | `ArtifactsController` | S+ |
| GET | `/artifacts/{artifact_id}` | `getArtifactMetadata` | `ArtifactsController` | S+ |
| POST | `/artifacts/{artifact_id}/download` | `issueArtifactDownload` | `ArtifactsController` | S+ |
| POST | `/artifacts/{artifact_id}/archive` | `archiveArtifact` | `ArtifactsController` | S+ |

## audit (3)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/audit-events` | `listAuditEvents` | `AuditController` | M3 |
| GET | `/audit-events/{audit_event_id}` | `getAuditEvent` | `AuditController` | M3 |
| POST | `O/audit-exports` | `requestAuditExport` | `AuditController` | M3 |

## authorization (2)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/roles` | `listAvailableRoles` | `AuthorizationController` | M1 |
| GET | `O/permissions` | `listOrganizationPermissions` | `AuthorizationController` | M1 |

## backups (4)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `/system/backups` | `listBackups` | `BackupsController` | M3 |
| GET | `/system/backups/{backup_id}` | `getBackupMetadata` | `BackupsController` | M3 |
| POST | `/system/backups/run` | `requestBackup` | `BackupsController` | M3 |
| POST | `/system/backups/{backup_id}/verify` | `verifyBackup` | `BackupsController` | M3 |

## benchmarks (8)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/benchmarks` | `listBenchmarkRuns` | `BenchmarksController` | S+ |
| POST | `O/benchmarks` | `createBenchmarkRun` | `BenchmarksController` | S+ |
| GET | `/benchmarks/{benchmark_id}` | `getBenchmarkRun` | `BenchmarksController` | S+ |
| POST | `/benchmarks/{benchmark_id}/start` | `startBenchmarkRun` | `BenchmarksController` | S+ |
| POST | `/benchmarks/{benchmark_id}/cancel` | `cancelBenchmarkRun` | `BenchmarksController` | S+ |
| GET | `/benchmarks/{benchmark_id}/results` | `getBenchmarkResults` | `BenchmarksController` | S+ |
| GET | `/benchmarks/{benchmark_id}/events` | `streamBenchmarkEvents` | `BenchmarksController` | S+ |
| POST | `/benchmarks/{benchmark_id}/exports` | `exportBenchmarkReport` | `BenchmarksController` | S+ |

## cost-estimates (2)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/cost-estimates` | `getCostEstimates` | `CostEstimatesController` | M3 |
| PATCH | `O/cost-assumptions` | `updateCostAssumptions` | `CostEstimatesController` | S+ |

## datasets (5)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/datasets` | `listDatasets` | `DatasetsController` | S+ |
| POST | `O/datasets` | `createDataset` | `DatasetsController` | S+ |
| GET | `/datasets/{dataset_id}` | `getDataset` | `DatasetsController` | S+ |
| POST | `/datasets/{dataset_id}/validate` | `validateDataset` | `DatasetsController` | S+ |
| POST | `/datasets/{dataset_id}/archive` | `archiveDataset` | `DatasetsController` | S+ |

## experiments (8)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/experiments` | `listExperiments` | `ExperimentsController` | S+ |
| POST | `O/experiments` | `createExperiment` | `ExperimentsController` | S+ |
| GET | `/experiments/{experiment_id}` | `getExperiment` | `ExperimentsController` | S+ |
| POST | `/experiments/{experiment_id}/run` | `runExperiment` | `ExperimentsController` | S+ |
| POST | `/experiments/{experiment_id}/cancel` | `cancelExperiment` | `ExperimentsController` | S+ |
| GET | `/experiments/{experiment_id}/comparison` | `getExperimentComparison` | `ExperimentsController` | S+ |
| POST | `/experiments/{experiment_id}/promote` | `promoteExperimentCandidate` | `ExperimentsController` | S+ |
| POST | `/experiments/{experiment_id}/rollback` | `rollbackExperimentPromotion` | `ExperimentsController` | S+ |

## gpu-nodes (5)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `/gpu-nodes` | `listGpuNodes` | `GpuNodesController` | M3 |
| GET | `/gpu-nodes/{node_id}` | `getGpuNode` | `GpuNodesController` | M3 |
| GET | `/gpu-nodes/{node_id}/metrics` | `getGpuNodeMetrics` | `GpuNodesController` | M3 |
| POST | `/gpu-nodes/{node_id}/drain` | `drainGpuNode` | `GpuNodesController` | S+ |
| POST | `/gpu-nodes/{node_id}/undrain` | `undrainGpuNode` | `GpuNodesController` | S+ |

## identity (24)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| POST | `/auth/register` | `registerAccount` | `IdentityController` | M1 |
| POST | `/auth/password/login` | `authenticatePassword` | `IdentityController` | M1 |
| POST | `/auth/password/recovery/request` | `requestPasswordReset` | `IdentityController` | M1 |
| POST | `/auth/password/recovery/complete` | `completePasswordReset` | `IdentityController` | M1 |
| POST | `/auth/otp/request` | `requestEmailOtp` | `IdentityController` | M1 |
| POST | `/auth/otp/verify` | `verifyEmailOtp` | `IdentityController` | M1 |
| GET | `/auth/oauth/{provider}/start` | `beginOAuthLogin` | `OAuthController` | M1 |
| GET | `/auth/oauth/{provider}/callback` | `completeOAuthLogin` | `OAuthController` | M1 |
| GET | `/auth/oauth/{provider}/link/start` | `beginSocialIdentityLink` | `OAuthController` | M3 |
| GET | `/auth/oauth/{provider}/link/callback` | `completeSocialIdentityLink` | `OAuthController` | M3 |
| GET | `/auth/me` | `getCurrentSession` | `SessionsController` | M1 |
| POST | `/auth/refresh` | `rotateSession` | `SessionsController` | M1 |
| POST | `/auth/logout` | `logoutCurrentSession` | `SessionsController` | M1 |
| POST | `/auth/logout-all` | `logoutAllSessions` | `SessionsController` | M1 |
| GET | `/auth/sessions` | `listActiveSessions` | `SessionsController` | M1 |
| DELETE | `/auth/sessions/{session_id}` | `revokeSession` | `SessionsController` | M1 |
| GET | `/auth/identities` | `listLinkedIdentities` | `IdentityController` | M3 |
| DELETE | `/auth/identities/{identity_id}` | `unlinkSocialIdentity` | `IdentityController` | M3 |
| POST | `/auth/mfa/totp/enroll` | `beginTotpEnrollment` | `MfaController` | M1 |
| POST | `/auth/mfa/totp/confirm` | `confirmTotpEnrollment` | `MfaController` | M1 |
| POST | `/auth/mfa/challenge/verify` | `verifyMfaChallenge` | `MfaController` | M1 |
| POST | `/auth/mfa/totp/disable` | `disableTotp` | `MfaController` | M1 |
| POST | `/auth/mfa/recovery-codes/regenerate` | `regenerateRecoveryCodes` | `MfaController` | M1 |
| POST | `/auth/step-up` | `completeStepUpAuthentication` | `MfaController` | M1 |

## inference (6)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `/v1/models` | `listServingModels` | `OpenAiCompatibleController` | M2 |
| GET | `/v1/models/{model_id}` | `getServingModel` | `OpenAiCompatibleController` | M2 |
| POST | `/v1/chat/completions` | `createChatCompletion` | `OpenAiCompatibleController` | M2 |
| POST | `/v1/completions` | `createCompletion` | `OpenAiCompatibleController` | M2 |
| POST | `/v1/embeddings` | `createEmbedding` | `OpenAiCompatibleController` | S+ |
| POST | `/v1/responses` | `createResponse` | `OpenAiCompatibleController` | S+ |

## jobs (3)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `/system/jobs` | `listSystemJobs` | `JobsController` | M3 |
| GET | `/system/jobs/{job_id}` | `getSystemJob` | `JobsController` | M3 |
| GET | `/system/jobs/{job_id}/events` | `streamSystemJobEvents` | `JobsController` | M3 |

## model-catalog (10)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/models` | `listModels` | `ModelCatalogController` | M2 |
| POST | `O/models` | `registerModel` | `ModelCatalogController` | M2 |
| POST | `O/models/validate` | `validateModelManifest` | `ModelCatalogController` | M2 |
| GET | `/models/{model_id}` | `getModel` | `ModelCatalogController` | M2 |
| PATCH | `/models/{model_id}` | `updateModelMetadata` | `ModelCatalogController` | M2 |
| POST | `/models/{model_id}/archive` | `archiveModel` | `ModelCatalogController` | M3 |
| GET | `/models/{model_id}/versions` | `listModelVersions` | `ModelCatalogController` | M3 |
| POST | `/models/{model_id}/versions` | `registerModelVersion` | `ModelCatalogController` | M3 |
| GET | `/models/{model_id}/capabilities` | `getModelCapabilities` | `ModelCatalogController` | M2 |
| GET | `/models/{model_id}/compatibility` | `getModelHardwareCompatibility` | `ModelCatalogController` | M2 |

## model-deployments (10)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/deployments` | `listDeployments` | `ModelDeploymentsController` | M2 |
| POST | `O/deployments` | `registerDeployment` | `ModelDeploymentsController` | M2 |
| GET | `/deployments/{deployment_id}` | `getDeployment` | `ModelDeploymentsController` | M2 |
| POST | `/deployments/{deployment_id}/activate` | `activateDeployment` | `ModelDeploymentsController` | M3 |
| POST | `/deployments/{deployment_id}/stop` | `stopDeployment` | `ModelDeploymentsController` | M3 |
| POST | `/deployments/{deployment_id}/rollback` | `rollbackDeployment` | `ModelDeploymentsController` | S+ |
| GET | `/deployments/{deployment_id}/events` | `streamDeploymentEvents` | `ModelDeploymentsController` | M3 |
| GET | `/deployments/{deployment_id}/metrics` | `getDeploymentMetrics` | `ModelDeploymentsController` | M3 |
| GET | `/deployments/{deployment_id}/logs` | `getDeploymentLogs` | `ModelDeploymentsController` | M3 |
| GET | `/runtime-profiles` | `listApprovedRuntimeProfiles` | `ModelDeploymentsController` | M2 |

## model-imports (5)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/model-imports` | `listModelImports` | `ModelImportsController` | M3 |
| POST | `O/model-imports` | `startModelImport` | `ModelImportsController` | M3 |
| GET | `/model-imports/{import_id}` | `getModelImport` | `ModelImportsController` | M3 |
| POST | `/model-imports/{import_id}/cancel` | `cancelModelImport` | `ModelImportsController` | M3 |
| GET | `/model-imports/{import_id}/events` | `streamModelImportEvents` | `ModelImportsController` | M3 |

## notifications (4)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/notification-channels` | `listNotificationChannels` | `NotificationsController` | M3 |
| POST | `O/notification-channels` | `createNotificationChannel` | `NotificationsController` | M3 |
| PATCH | `/notification-channels/{channel_id}` | `updateNotificationChannel` | `NotificationsController` | M3 |
| POST | `/notification-channels/{channel_id}/test` | `testNotificationChannel` | `NotificationsController` | M3 |

## observability-queries (3)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/metrics/overview` | `getOrganizationMetrics` | `MetricsController` | M3 |
| GET | `O/metrics/latency` | `getLatencyMetrics` | `MetricsController` | M3 |
| GET | `O/metrics/errors` | `getErrorMetrics` | `MetricsController` | M3 |

## organizations (11)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `/organizations` | `listMyOrganizations` | `OrganizationsController` | M1 |
| POST | `/organizations` | `registerOrganization` | `OrganizationsController` | M1 |
| GET | `/organizations/{organization_id}` | `getOrganization` | `OrganizationsController` | M1 |
| PATCH | `/organizations/{organization_id}` | `updateOrganization` | `OrganizationsController` | M1 |
| GET | `O/members` | `listOrganizationMembers` | `MembersController` | M1 |
| PATCH | `O/members/{member_id}` | `changeMemberRole` | `MembersController` | M1 |
| DELETE | `O/members/{member_id}` | `removeOrganizationMember` | `MembersController` | M1 |
| GET | `O/invitations` | `listInvitations` | `InvitationsController` | M1 |
| POST | `O/invitations` | `inviteOrganizationMember` | `InvitationsController` | M1 |
| POST | `/invitations/accept` | `acceptInvitation` | `InvitationsController` | M1 |
| POST | `O/invitations/{invitation_id}/revoke` | `revokeInvitation` | `InvitationsController` | M1 |

## playground (7)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/playground/sessions` | `listPlaygroundSessions` | `PlaygroundController` | M2 |
| POST | `O/playground/sessions` | `createPlaygroundSession` | `PlaygroundController` | M2 |
| GET | `/playground/sessions/{session_id}` | `getPlaygroundSession` | `PlaygroundController` | M2 |
| PATCH | `/playground/sessions/{session_id}` | `updatePlaygroundSession` | `PlaygroundController` | M2 |
| DELETE | `/playground/sessions/{session_id}` | `deletePlaygroundSession` | `PlaygroundController` | M3 |
| POST | `/playground/sessions/{session_id}/generations` | `generatePlaygroundCompletion` | `PlaygroundController` | M2 |
| POST | `/playground/generations/compare` | `comparePlaygroundGenerations` | `PlaygroundController` | S+ |

## quotas (3)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/quotas` | `listQuotas` | `QuotasController` | M2 |
| PATCH | `O/quotas/{quota_id}` | `updateQuota` | `QuotasController` | M3 |
| GET | `O/quota-usage` | `getCurrentQuotaUsage` | `QuotasController` | M2 |

## request-routing (5)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/routing-policies` | `listRoutingPolicies` | `RoutingPoliciesController` | S+ |
| POST | `O/routing-policies` | `createRoutingPolicy` | `RoutingPoliciesController` | S+ |
| GET | `/routing-policies/{policy_id}` | `getRoutingPolicy` | `RoutingPoliciesController` | S+ |
| PATCH | `/routing-policies/{policy_id}` | `updateRoutingPolicy` | `RoutingPoliciesController` | S+ |
| POST | `/routing-policies/{policy_id}/activate` | `activateRoutingPolicy` | `RoutingPoliciesController` | S+ |

## system (7)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `/system/capabilities` | `getSystemCapabilities` | `SystemController` | M1 |
| GET | `/system/version` | `getSystemVersion` | `SystemController` | M1 |
| GET | `/system/status` | `getSystemStatus` | `SystemController` | M1 |
| GET | `/system/settings` | `getSystemSettings` | `SystemController` | M3 |
| PATCH | `/system/settings` | `updateSystemSettings` | `SystemController` | M3 |
| GET | `/system/health/live` | `getLiveness` | `HealthController` | M1 |
| GET | `/system/health/ready` | `getReadiness` | `HealthController` | M1 |

## usage-ledger (8)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/usage/summary` | `getUsageSummary` | `UsageController` | M2 |
| GET | `O/usage/timeseries` | `getUsageTimeseries` | `UsageController` | M3 |
| GET | `O/usage/by-model` | `getUsageByModel` | `UsageController` | M3 |
| GET | `O/usage/by-key` | `getUsageByKey` | `UsageController` | M3 |
| GET | `O/usage/requests` | `listInferenceRequests` | `UsageController` | M3 |
| GET | `/usage/requests/{request_id}` | `getInferenceRequestSummary` | `UsageController` | M3 |
| POST | `O/usage/exports` | `requestUsageExport` | `UsageController` | M3 |
| GET | `/usage/exports/{export_id}` | `getUsageExport` | `UsageController` | M3 |

## webhooks (5)

| Verbo | Path relativo | operationId | Controller | Fase |
|---|---|---|---|---|
| GET | `O/webhooks` | `listWebhooks` | `WebhooksController` | S+ |
| POST | `O/webhooks` | `createWebhook` | `WebhooksController` | S+ |
| PATCH | `/webhooks/{webhook_id}` | `updateWebhook` | `WebhooksController` | S+ |
| POST | `/webhooks/{webhook_id}/rotate-secret` | `rotateWebhookSecret` | `WebhooksController` | S+ |
| GET | `/webhooks/{webhook_id}/deliveries` | `listWebhookDeliveries` | `WebhooksController` | S+ |

