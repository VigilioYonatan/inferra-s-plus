import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { DeploymentsService } from "./application/services/deployments.service";
import { DeploymentsController } from "./presentation/http/controllers/deployments.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, DeploymentsService],
  controllers: [DeploymentsController],
})
export class ModelDeploymentsModule {}
