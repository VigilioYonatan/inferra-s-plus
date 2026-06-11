import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ModelsService } from "./application/services/models.service";
import { ModelsController } from "./presentation/http/controllers/models.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, ModelsService],
  controllers: [ModelsController],
  exports: [ModelsService],
})
export class ModelCatalogModule {}
