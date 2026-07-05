import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ApiKeysService } from "./application/services/api-keys.service";
import { ApiKeysController } from "./presentation/http/controllers/api-keys.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, ApiKeysService],
  controllers: [ApiKeysController],
  exports: [ApiKeysService],
})
export class ApiCredentialsModule {}
