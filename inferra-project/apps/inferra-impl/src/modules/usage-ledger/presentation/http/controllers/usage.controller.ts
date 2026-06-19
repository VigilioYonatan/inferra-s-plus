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
import { UsageService } from "../../../application/services/usage.service";
@Controller("api/v1/organizations/:organization_id/usage")
@UseGuards(IdentityGuard)
export class UsageController {
  constructor(
    private readonly service: UsageService,
    private readonly organizations: OrganizationsService,
  ) {}
  @Get("summary") async summary(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    await this.organizations.requireMembership(
      req.identity!.id,
      org,
      "analyst",
    );
    return this.service.getSummary(org);
  }
  @Get("requests") async requests(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    await this.organizations.requireMembership(
      req.identity!.id,
      org,
      "analyst",
    );
    return this.service.listRequests(org);
  }
  @Get("requests/:request_id") async requestDetail(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("request_id", ParseUUIDPipe) id: string,
  ) {
    await this.organizations.requireMembership(
      req.identity!.id,
      org,
      "analyst",
    );
    return this.service.getRequest(org, id);
  }
  @Get("by-model") async byModel(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    await this.organizations.requireMembership(
      req.identity!.id,
      org,
      "analyst",
    );
    return this.service.byModel(org);
  }
  @Get("timeseries") async timeseries(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    await this.organizations.requireMembership(
      req.identity!.id,
      org,
      "analyst",
    );
    return this.service.timeSeries(org);
  }
}
