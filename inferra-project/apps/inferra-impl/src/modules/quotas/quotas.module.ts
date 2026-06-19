import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { QuotaService } from "./application/services/quota.service";
import { QuotasController } from "./presentation/http/controllers/quotas.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, QuotaService],
  controllers: [QuotasController],
  exports: [QuotaService],
})
export class QuotasModule {}
