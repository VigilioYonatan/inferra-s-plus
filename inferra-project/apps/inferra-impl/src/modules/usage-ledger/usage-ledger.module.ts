import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { UsageService } from "./application/services/usage.service";
import { UsageController } from "./presentation/http/controllers/usage.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, UsageService],
  controllers: [UsageController],
})
export class UsageLedgerModule {}
