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
import { GpuNodesService } from "../../../application/services/gpu-nodes.service";
@Controller("api/v1/organizations/:organization_id/gpu-nodes")
@UseGuards(IdentityGuard)
export class GpuNodesController {
  constructor(private readonly service: GpuNodesService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Get(":gpu_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("gpu_id") gpu: string,
  ) {
    return this.service.get(req.identity!.id, org, gpu);
  }
}
