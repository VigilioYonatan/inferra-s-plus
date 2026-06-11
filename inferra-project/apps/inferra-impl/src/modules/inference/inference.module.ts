import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { ApiCredentialsModule } from "../api-credentials/api-credentials.module";
import { IdentityModule } from "../identity/identity.module";
import { ModelCatalogModule } from "../model-catalog/model-catalog.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { QuotasModule } from "../quotas/quotas.module";
import { InferenceService } from "./application/services/inference.service";
import { InferenceController } from "./presentation/http/controllers/inference.controller";
import { PlaygroundController } from "./presentation/http/controllers/playground.controller";
@Module({
  imports: [
    ApiCredentialsModule,
    ModelCatalogModule,
    QuotasModule,
    IdentityModule,
    OrganizationsModule,
  ],
  providers: [QueryService, InferenceService],
  controllers: [InferenceController, PlaygroundController],
})
export class InferenceModule {}
