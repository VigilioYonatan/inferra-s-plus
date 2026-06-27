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
import { ObservabilityService } from "../../../application/services/observability.service";
@Controller("api/v1/organizations/:organization_id/observability")
@UseGuards(IdentityGuard)
export class ObservabilityController {
  constructor(private readonly service: ObservabilityService) {}
  @Get("latency") latency(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.latency(req.identity!.id, org);
  }
  @Get("errors") errors(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.errors(req.identity!.id, org);
  }
}
