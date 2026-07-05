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
import { ExperimentsService } from "../../../application/services/experiments.service";
import {
  type CreateExperimentRequestDto,
  createExperimentRequestDto,
} from "../dto/create-experiment.request.dto";
@Controller("api/v1/organizations/:organization_id/experiments")
@UseGuards(IdentityGuard)
export class ExperimentsController {
  constructor(private readonly service: ExperimentsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createExperimentRequestDto))
    input: CreateExperimentRequestDto,
  ) {
    return this.service.create(req.identity!.id, org, input);
  }
  @Get(":experiment_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("experiment_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Post(":experiment_id/compare") compare(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("experiment_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.compare(req.identity!.id, org, id);
  }
}
