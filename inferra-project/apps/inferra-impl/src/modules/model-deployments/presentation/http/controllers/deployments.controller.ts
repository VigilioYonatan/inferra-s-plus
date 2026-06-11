import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { DeploymentsService } from "../../../application/services/deployments.service";
import {
  type RegisterDeploymentRequestDto,
  registerDeploymentRequestDto,
} from "../dto/register-deployment.request.dto";
@Controller("api/v1/organizations/:organization_id/deployments")
@UseGuards(IdentityGuard)
export class DeploymentsController {
  constructor(private readonly service: DeploymentsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post() register(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(registerDeploymentRequestDto))
    input: RegisterDeploymentRequestDto,
  ) {
    return this.service.register(req.identity!.id, org, input);
  }
  @Get(":deployment_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("deployment_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Get(":deployment_id/logs") getLogs(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("deployment_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getLogs(req.identity!.id, org, id);
  }
  @Post(":deployment_id/disable") disable(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("deployment_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.disable(req.identity!.id, org, id);
  }
}
