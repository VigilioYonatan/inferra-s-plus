import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { AuditService } from "./application/services/audit.service";
import { AuditController } from "./presentation/http/controllers/audit.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
