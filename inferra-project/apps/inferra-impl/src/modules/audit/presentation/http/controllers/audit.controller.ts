import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { OrganizationsService } from "../../../../organizations/application/services/organizations.service";
import { AuditService } from "../../../application/services/audit.service";
@Controller("api/v1/organizations/:organization_id/audit")
@UseGuards(IdentityGuard)
export class AuditController {
  constructor(
    private readonly audit: AuditService,
    private readonly organizations: OrganizationsService,
  ) {}
  @Get() async list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    await this.organizations.requireMembership(req.identity!.id, org, "admin");
    return this.audit.list(org);
  }
  @Get(":event_id") async get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("event_id", ParseUUIDPipe) id: string,
  ) {
    await this.organizations.requireMembership(req.identity!.id, org, "admin");
    return this.audit.get(org, id);
  }
}
