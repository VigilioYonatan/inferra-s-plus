import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { ModelsService } from "../../../application/services/models.service";
import {
  type RegisterModelRequestDto,
  registerModelRequestDto,
} from "../dto/register-model.request.dto";
import {
  type CreateModelVersionRequestDto,
  createModelVersionRequestDto,
  type UpdateModelRequestDto,
  updateModelRequestDto,
} from "../dto/update-model.request.dto";
@Controller("api/v1/organizations/:organization_id/models")
@UseGuards(IdentityGuard)
export class ModelsController {
  constructor(private readonly service: ModelsService) {}
  @Get() listModels(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.listModelsAuthorized(req.identity!.id, org);
  }
  @Post() registerModel(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(registerModelRequestDto)) input: RegisterModelRequestDto,
  ) {
    return this.service.registerModel(req.identity!.id, org, input);
  }
  @Get(":model_id") getModel(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("model_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getModel(req.identity!.id, org, id);
  }
  @Patch(":model_id") update(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("model_id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(updateModelRequestDto)) input: UpdateModelRequestDto,
  ) {
    return this.service.updateModel(req.identity!.id, org, id, input);
  }
  @Get(":model_id/versions") versions(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("model_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listVersions(req.identity!.id, org, id);
  }
  @Post(":model_id/versions") addVersion(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("model_id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(createModelVersionRequestDto))
    input: CreateModelVersionRequestDto,
  ) {
    return this.service.createVersion(req.identity!.id, org, id, input);
  }
}
