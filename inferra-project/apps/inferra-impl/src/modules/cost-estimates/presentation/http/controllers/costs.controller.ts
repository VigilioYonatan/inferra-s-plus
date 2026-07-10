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
import { CostsService } from "../../../application/services/costs.service";
@Controller("api/v1/organizations/:organization_id/costs")
@UseGuards(IdentityGuard)
export class CostsController {
  constructor(private readonly service: CostsService) {}
  @Get("estimates") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.estimates(req.identity!.id, org);
  }
}
