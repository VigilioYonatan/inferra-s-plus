import type { FunctionComponent } from "preact";
import { SessionsPage as Route_56 } from "../features/account/pages/active-sessions.page";
import { ProfilePage as Route_54 } from "../features/account/pages/profile.page";
import { SecurityPage as Route_55 } from "../features/account/pages/security-settings.page";
import { SocialConnectionsPage as Route_57 } from "../features/account/pages/social-connections.page";
import { VerifyEmailPage } from "../features/account/pages/verify-email.page";
import { OrganizationAlertsPage as Route_51 } from "../features/alerts/pages/organization-alerts.page";
import { ApiKeyDetailsPage as Route_31 } from "../features/api-keys/pages/api-key-details.page";
import { ApiKeysPage as Route_29 } from "../features/api-keys/pages/api-keys-list.page";
import { CreateApiKeyPage as Route_30 } from "../features/api-keys/pages/create-api-key.page";
import { ArtifactDetailPage as Route_62 } from "../features/artifacts/pages/artifact-detail.page";
import { ArtifactsPage as Route_61 } from "../features/artifacts/pages/artifacts-list.page";
import { AuditEventDetailPage as Route_53 } from "../features/audit/pages/audit-event-detail.page";
import { AuditEventsPage as Route_52 } from "../features/audit/pages/audit-events.page";
import { AuthErrorPage } from "../features/auth/pages/auth-error.page";
import { EmailOtpPage as Route_04 } from "../features/auth/pages/email-otp.page";
import { ForgotPasswordPage as Route_02 } from "../features/auth/pages/forgot-password.page";
import { LoginPage as Route_00 } from "../features/auth/pages/login.page";
import { MfaChallengePage as Route_06 } from "../features/auth/pages/mfa-challenge.page";
import { OAuthCompletePage as Route_05 } from "../features/auth/pages/oauth-complete.page";
import { RegisterPage as Route_01 } from "../features/auth/pages/register.page";
import { ResetPasswordPage as Route_03 } from "../features/auth/pages/reset-password.page";
import { VerifyRegistrationPage } from "../features/auth/pages/verify-registration.page";
import { BackupDetailPage as Route_67 } from "../features/backups/pages/backup-detail.page";
import { BackupsListPage as Route_66 } from "../features/backups/pages/backups-list.page";
import { BenchmarkDetailPage as Route_42 } from "../features/benchmarks/pages/benchmark-detail.page";
import { BenchmarksPage as Route_40 } from "../features/benchmarks/pages/benchmarks-list.page";
import { CreateBenchmarkPage as Route_41 } from "../features/benchmarks/pages/create-benchmark.page";
import { ForbiddenPage } from "../features/common/forbidden.page";
import { CostEstimatesPage as Route_34 } from "../features/costs/pages/cost-estimates.page";
import { DashboardPage as Route_11 } from "../features/dashboard/pages/dashboard.page";
import { CreateDatasetPage as Route_59 } from "../features/datasets/pages/create-dataset.page";
import { DatasetDetailPage as Route_60 } from "../features/datasets/pages/dataset-detail.page";
import { DatasetEditPage } from "../features/datasets/pages/dataset-edit.page";
import { DatasetsListPage as Route_58 } from "../features/datasets/pages/datasets-list.page";
import { CreateDeploymentPage as Route_26 } from "../features/deployments/pages/create-deployment.page";
import { DeploymentDetailPage as Route_27 } from "../features/deployments/pages/deployment-detail.page";
import { DeploymentLogsPage as Route_28 } from "../features/deployments/pages/deployment-logs.page";
import { DeploymentsListPage as Route_25 } from "../features/deployments/pages/deployments-list.page";
import { DeveloperPortalPage } from "../features/developers/pages/developer-portal.page";
import { CreateExperimentPage as Route_44 } from "../features/experiments/pages/create-experiment.page";
import { ExperimentDetailPage as Route_45 } from "../features/experiments/pages/experiment-detail.page";
import { ExperimentsListPage as Route_43 } from "../features/experiments/pages/experiments-list.page";
import { GpuHardwareConsolePage } from "../features/gpu-nodes/pages/gpu-hardware-console.page";
import { GpuNodeDetailPage as Route_65 } from "../features/gpu-nodes/pages/gpu-node-detail.page";
import { GpuNodesListPage as Route_64 } from "../features/gpu-nodes/pages/gpu-nodes-list.page";
import { SystemJobDetailPage as Route_69 } from "../features/jobs/pages/system-job-detail.page";
import { SystemJobsPage as Route_68 } from "../features/jobs/pages/system-jobs.page";
import { ModelImportDetailPage as Route_24 } from "../features/model-imports/pages/model-import-detail.page";
import { ModelImportsListPage as Route_22 } from "../features/model-imports/pages/model-imports-list.page";
import { StartModelImportPage as Route_23 } from "../features/model-imports/pages/start-model-import.page";
import { ModelDetailsPage as Route_19 } from "../features/models/pages/model-details.page";
import { ModelSettingsPage as Route_20 } from "../features/models/pages/model-settings.page";
import { ModelVersionsPage as Route_21 } from "../features/models/pages/model-versions.page";
import { ModelsListPage as Route_17 } from "../features/models/pages/models-list.page";
import { RegisterModelPage as Route_18 } from "../features/models/pages/register-model.page";
import { NotificationSettingsPage as Route_49 } from "../features/notifications/pages/notification-settings.page";
import { AdmissionMetricsPage } from "../features/observability/pages/admission-metrics.page";
import { ErrorsPage as Route_36 } from "../features/observability/pages/errors.page";
import { LatencyPage as Route_35 } from "../features/observability/pages/latency.page";
import { CreateOrganizationPage as Route_09 } from "../features/onboarding/pages/create-organization.page";
import { FirstModelPage as Route_10 } from "../features/onboarding/pages/first-model.page";
import { WelcomePage as Route_08 } from "../features/onboarding/pages/welcome.page";
import { InvitationAcceptPage as Route_07 } from "../features/organizations/pages/invitation-accept.page";
import { InvitationsPage as Route_47 } from "../features/organizations/pages/invitations.page";
import { MembersPage as Route_46 } from "../features/organizations/pages/members.page";
import { NewOrganizationPage } from "../features/organizations/pages/new-organization.page";
import { OrganizationSettingsPage as Route_48 } from "../features/organizations/pages/organization-settings.page";
import { RolesMatrixPage } from "../features/organizations/pages/roles-matrix.page";
import { CompareCompletionsPage as Route_14 } from "../features/playground/pages/compare-completions.page";
import { EmbeddingsPlaygroundPage } from "../features/playground/pages/embeddings-playground.page";
import { PlaygroundPage as Route_12 } from "../features/playground/pages/playground.page";
import { PlaygroundSessionPage as Route_13 } from "../features/playground/pages/playground-session.page";
import { QuotasPage as Route_32 } from "../features/quotas/pages/quotas.page";
import { CreateRoutingPolicyPage as Route_38 } from "../features/routing/pages/create-routing-policy.page";
import { RoutingPoliciesPage as Route_37 } from "../features/routing/pages/routing-policies.page";
import { RoutingPolicyDetailsPage as Route_39 } from "../features/routing/pages/routing-policy-details.page";
import { RoutingPolicyEditPage } from "../features/routing/pages/routing-policy-edit.page";
import { InstanceHealthPage as Route_63 } from "../features/system/pages/instance-health.page";
import { InstanceSettingsPage as Route_70 } from "../features/system/pages/instance-settings.page";
import { InferenceRequestDetailPage as Route_16 } from "../features/usage/pages/inference-request-detail.page";
import { InferenceRequestsPage as Route_15 } from "../features/usage/pages/inference-requests.page";
import { UsagePage as Route_33 } from "../features/usage/pages/usage.page";
import { UsageExportsPage } from "../features/usage/pages/usage-exports.page";
import { UsageModelsPage } from "../features/usage/pages/usage-models.page";
import { WebhookDetailPage } from "../features/webhooks/pages/webhook-detail.page";
import { WebhookSettingsPage as Route_50 } from "../features/webhooks/pages/webhook-settings.page";

export type AppRoute = {
  pattern: string;
  component: FunctionComponent;
  phase: string;
};

export const appRoutes: AppRoute[] = [
  // Public & Auth
  {
    pattern: "/register/verify",
    component: VerifyRegistrationPage,
    phase: "M1",
  },
  { pattern: "/login", component: Route_00, phase: "M1" },
  { pattern: "/register", component: Route_01, phase: "M1" },
  { pattern: "/password/forgot", component: Route_02, phase: "M1" },
  { pattern: "/password/reset", component: Route_03, phase: "M1" },
  { pattern: "/login/otp", component: Route_04, phase: "M1" },
  { pattern: "/auth/complete", component: Route_05, phase: "M1" },
  { pattern: "/auth/error", component: AuthErrorPage, phase: "M1" },
  { pattern: "/mfa/challenge", component: Route_06, phase: "M1" },
  { pattern: "/invite/accept", component: Route_07, phase: "M1" },
  { pattern: "/403", component: ForbiddenPage, phase: "M1" },

  // Onboarding & Global Org
  { pattern: "/onboarding", component: Route_08, phase: "M1" },
  { pattern: "/onboarding/organization", component: Route_09, phase: "M1" },
  { pattern: "/onboarding/first-model", component: Route_10, phase: "M1" },
  {
    pattern: "/organizations/new",
    component: NewOrganizationPage,
    phase: "M1",
  },

  // Account
  { pattern: "/account/profile", component: Route_54, phase: "M1" },
  { pattern: "/account/security", component: Route_55, phase: "M1" },
  { pattern: "/account/sessions", component: Route_56, phase: "M1" },
  { pattern: "/account/connections", component: Route_57, phase: "M1" },
  { pattern: "/account/verify-email", component: VerifyEmailPage, phase: "M1" },

  // Dashboard & Traffic Overview
  { pattern: "/app/:org_slug/dashboard", component: Route_11, phase: "M2" },
  {
    pattern: "/app/:org_slug/usage/models",
    component: UsageModelsPage,
    phase: "M3",
  },
  {
    pattern: "/app/:org_slug/usage/exports",
    component: UsageExportsPage,
    phase: "M3",
  },
  { pattern: "/app/:org_slug/usage", component: Route_33, phase: "M2" },
  {
    pattern: "/app/:org_slug/requests/:request_id",
    component: Route_16,
    phase: "M2",
  },
  { pattern: "/app/:org_slug/requests", component: Route_15, phase: "M2" },
  { pattern: "/app/:org_slug/quotas", component: Route_32, phase: "M2" },
  { pattern: "/app/:org_slug/costs", component: Route_34, phase: "M3" },
  {
    pattern: "/app/:org_slug/observability/latency",
    component: Route_35,
    phase: "M3",
  },
  {
    pattern: "/app/:org_slug/observability/errors",
    component: Route_36,
    phase: "M3",
  },
  {
    pattern: "/app/:org_slug/observability/admission",
    component: AdmissionMetricsPage,
    phase: "S+",
  },

  // Playground & Inference
  {
    pattern: "/app/:org_slug/playground/sessions/:session_id",
    component: Route_13,
    phase: "M2",
  },
  {
    pattern: "/app/:org_slug/playground/compare",
    component: Route_14,
    phase: "M2",
  },
  {
    pattern: "/app/:org_slug/playground/embeddings",
    component: EmbeddingsPlaygroundPage,
    phase: "M2",
  },
  { pattern: "/app/:org_slug/playground", component: Route_12, phase: "M2" },
  {
    pattern: "/app/:org_slug/developers",
    component: DeveloperPortalPage,
    phase: "M2",
  },

  // Models, Imports & Deployments
  { pattern: "/app/:org_slug/models/new", component: Route_18, phase: "M2" },
  {
    pattern: "/app/:org_slug/models/:model_id/settings",
    component: Route_20,
    phase: "M2",
  },
  {
    pattern: "/app/:org_slug/models/:model_id/versions",
    component: Route_21,
    phase: "M2",
  },
  {
    pattern: "/app/:org_slug/models/:model_id",
    component: Route_19,
    phase: "M2",
  },
  { pattern: "/app/:org_slug/models", component: Route_17, phase: "M2" },

  {
    pattern: "/app/:org_slug/model-imports/new",
    component: Route_23,
    phase: "M3",
  },
  {
    pattern: "/app/:org_slug/model-imports/:import_id",
    component: Route_24,
    phase: "M3",
  },
  { pattern: "/app/:org_slug/model-imports", component: Route_22, phase: "M3" },

  {
    pattern: "/app/:org_slug/deployments/new",
    component: Route_26,
    phase: "M2",
  },
  {
    pattern: "/app/:org_slug/deployments/:deployment_id/logs",
    component: Route_28,
    phase: "M2",
  },
  {
    pattern: "/app/:org_slug/deployments/:deployment_id",
    component: Route_27,
    phase: "M2",
  },
  { pattern: "/app/:org_slug/deployments", component: Route_25, phase: "M2" },

  {
    pattern: "/app/:org_slug/gpu-nodes",
    component: GpuHardwareConsolePage,
    phase: "M3",
  },

  // API Keys
  { pattern: "/app/:org_slug/api-keys/new", component: Route_30, phase: "M2" },
  {
    pattern: "/app/:org_slug/api-keys/:key_id",
    component: Route_31,
    phase: "M2",
  },
  { pattern: "/app/:org_slug/api-keys", component: Route_29, phase: "M2" },

  // Routing Policies
  { pattern: "/app/:org_slug/routing/new", component: Route_38, phase: "S+" },
  {
    pattern: "/app/:org_slug/routing/:policy_id/edit",
    component: RoutingPolicyEditPage,
    phase: "S+",
  },
  {
    pattern: "/app/:org_slug/routing/:policy_id",
    component: Route_39,
    phase: "S+",
  },
  { pattern: "/app/:org_slug/routing", component: Route_37, phase: "S+" },

  // Benchmarks & Evaluation
  {
    pattern: "/app/:org_slug/benchmarks/new",
    component: Route_41,
    phase: "S+",
  },
  {
    pattern: "/app/:org_slug/benchmarks/:benchmark_id",
    component: Route_42,
    phase: "S+",
  },
  { pattern: "/app/:org_slug/benchmarks", component: Route_40, phase: "S+" },

  // Experiments
  {
    pattern: "/app/:org_slug/experiments/new",
    component: Route_44,
    phase: "S+",
  },
  {
    pattern: "/app/:org_slug/experiments/:experiment_id",
    component: Route_45,
    phase: "S+",
  },
  { pattern: "/app/:org_slug/experiments", component: Route_43, phase: "S+" },

  // Datasets & Artifacts
  { pattern: "/app/:org_slug/datasets/new", component: Route_59, phase: "S+" },
  {
    pattern: "/app/:org_slug/datasets/:dataset_id/edit",
    component: DatasetEditPage,
    phase: "S+",
  },
  {
    pattern: "/app/:org_slug/datasets/:dataset_id",
    component: Route_60,
    phase: "S+",
  },
  { pattern: "/app/:org_slug/datasets", component: Route_58, phase: "S+" },

  {
    pattern: "/app/:org_slug/artifacts/:artifact_id",
    component: Route_62,
    phase: "S+",
  },
  { pattern: "/app/:org_slug/artifacts", component: Route_61, phase: "S+" },

  // Organization Settings, Webhooks & Members
  {
    pattern: "/app/:org_slug/members/roles",
    component: RolesMatrixPage,
    phase: "M1",
  },
  { pattern: "/app/:org_slug/members", component: Route_46, phase: "M1" },
  { pattern: "/app/:org_slug/invitations", component: Route_47, phase: "M1" },
  {
    pattern: "/app/:org_slug/settings/webhooks/:webhook_id",
    component: WebhookDetailPage,
    phase: "S+",
  },
  {
    pattern: "/app/:org_slug/settings/webhooks",
    component: Route_50,
    phase: "S+",
  },
  {
    pattern: "/app/:org_slug/settings/notifications",
    component: Route_49,
    phase: "M3",
  },
  {
    pattern: "/app/:org_slug/settings/general",
    component: Route_48,
    phase: "M1",
  },
  { pattern: "/app/:org_slug/alerts", component: Route_51, phase: "M3" },
  {
    pattern: "/app/:org_slug/audit/:event_id",
    component: Route_53,
    phase: "M3",
  },
  { pattern: "/app/:org_slug/audit", component: Route_52, phase: "M3" },

  // Instance Administration
  { pattern: "/admin/system", component: Route_63, phase: "M3" },
  { pattern: "/admin/gpu-nodes/:node_id", component: Route_65, phase: "M3" },
  { pattern: "/admin/gpu-nodes", component: Route_64, phase: "M3" },
  { pattern: "/admin/backups/:backup_id", component: Route_67, phase: "M3" },
  { pattern: "/admin/backups", component: Route_66, phase: "M3" },
  { pattern: "/admin/jobs/:job_id", component: Route_69, phase: "M3" },
  { pattern: "/admin/jobs", component: Route_68, phase: "M3" },
  { pattern: "/admin/settings", component: Route_70, phase: "M3" },
];
