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
import { QuotaService } from "../../../application/services/quota.service";
@Controller("api/v1/organizations/:organization_id/quotas")
@UseGuards(IdentityGuard)
export class QuotasController {
  constructor(
    private readonly quotas: QuotaService,
    private readonly organizations: OrganizationsService,
  ) {}
  @Get() async getQuota(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    await this.organizations.requireMembership(req.identity!.id, org, "viewer");
    return this.quotas.summary(org);
  }
}
