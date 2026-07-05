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
import { InstanceAdminService } from "../../../application/services/instance-admin.service";
@Controller("api/v1/admin")
@UseGuards(IdentityGuard)
export class InstanceAdminController {
  constructor(private readonly service: InstanceAdminService) {}
  @Get("system") system(@Req() req: SessionRequest) {
    return this.service.system(req.identity!.id);
  }
  @Get("backups") backups(@Req() req: SessionRequest) {
    return this.service.backups(req.identity!.id);
  }
  @Get("backups/:id") backup(
    @Req() req: SessionRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.backup(req.identity!.id, id);
  }
  @Get("jobs") jobs(@Req() req: SessionRequest) {
    return this.service.jobs(req.identity!.id);
  }
  @Get("jobs/:id") job(
    @Req() req: SessionRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.job(req.identity!.id, id);
  }
}
