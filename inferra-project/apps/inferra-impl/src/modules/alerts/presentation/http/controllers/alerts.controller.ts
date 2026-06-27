import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { AlertsService } from "../../../application/services/alerts.service";
@Controller("api/v1/organizations/:organization_id/alerts")
@UseGuards(IdentityGuard)
export class AlertsController {
  constructor(private readonly service: AlertsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post(":alert_id/acknowledge") ack(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("alert_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.acknowledge(req.identity!.id, org, id);
  }
}
