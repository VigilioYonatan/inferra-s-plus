import { Global, Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { InvitationsService } from "./application/services/invitations.service";
import { OrganizationsService } from "./application/services/organizations.service";
import { InvitationsController } from "./presentation/http/controllers/invitations.controller";
import { OrganizationsController } from "./presentation/http/controllers/organizations.controller";

@Global()
@Module({
  imports: [IdentityModule],
  providers: [QueryService, OrganizationsService, InvitationsService],
  controllers: [OrganizationsController, InvitationsController],
  exports: [OrganizationsService, InvitationsService],
})
export class OrganizationsModule {}
