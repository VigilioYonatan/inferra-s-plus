import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { ApiCredentialsModule } from "./modules/api-credentials/api-credentials.module";
import { ArtifactsModule } from "./modules/artifacts/artifacts.module";
import { AuditModule } from "./modules/audit/audit.module";
import { BenchmarksModule } from "./modules/benchmarks/benchmarks.module";
import { CostEstimatesModule } from "./modules/cost-estimates/cost-estimates.module";
import { DatasetsModule } from "./modules/datasets/datasets.module";
import { ExperimentsModule } from "./modules/experiments/experiments.module";
import { GpuNodesModule } from "./modules/gpu-nodes/gpu-nodes.module";
import { IdentityModule } from "./modules/identity/identity.module";
import { InferenceModule } from "./modules/inference/inference.module";
import { InstanceAdminModule } from "./modules/instance-admin/instance-admin.module";
import { ModelCatalogModule } from "./modules/model-catalog/model-catalog.module";
import { ModelDeploymentsModule } from "./modules/model-deployments/model-deployments.module";
import { ModelImportsModule } from "./modules/model-imports/model-imports.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ObservabilityQueriesModule } from "./modules/observability-queries/observability-queries.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { PlaygroundModule } from "./modules/playground/playground.module";
import { QuotasModule } from "./modules/quotas/quotas.module";
import { RequestRoutingModule } from "./modules/request-routing/request-routing.module";
import { SystemModule } from "./modules/system/system.module";
import { UsageLedgerModule } from "./modules/usage-ledger/usage-ledger.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { OriginMiddleware } from "./shared/http/origin.middleware";
import { RequestIdMiddleware } from "./shared/http/request-id.middleware";
import { HttpLogMiddleware } from "./shared/observability/logging";
import { RateLimitMiddleware } from "./shared/security/rate-limit.middleware";
@Module({
  imports: [
    DatabaseModule,
    IdentityModule,
    OrganizationsModule,
    ApiCredentialsModule,
    ModelCatalogModule,
    ModelDeploymentsModule,
    ArtifactsModule,
    QuotasModule,
    InferenceModule,
    UsageLedgerModule,
    BenchmarksModule,
    AuditModule,
    SystemModule,
    DatasetsModule,
    ExperimentsModule,
    RequestRoutingModule,
    ObservabilityQueriesModule,
    CostEstimatesModule,
    GpuNodesModule,
    NotificationsModule,
    AlertsModule,
    InstanceAdminModule,
    PlaygroundModule,
    ModelImportsModule,
    WebhooksModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestIdMiddleware,
        OriginMiddleware,
        RateLimitMiddleware,
        HttpLogMiddleware,
      )
      .forRoutes({ path: "{*all}", method: RequestMethod.ALL });
  }
}
