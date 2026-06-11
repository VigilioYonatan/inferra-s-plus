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
import { ModelImportsService } from "../../../application/services/model-imports.service";
import {
  type RequestModelImportDto,
  requestModelImportDto,
} from "../dto/request-model-import.request.dto";
@Controller("api/v1/organizations/:organization_id/model-imports")
@UseGuards(IdentityGuard)
export class ModelImportsController {
  constructor(private readonly service: ModelImportsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(requestModelImportDto)) input: RequestModelImportDto,
  ) {
    return this.service.request(req.identity!.id, org, input.repository_id);
  }
  @Get(":import_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("import_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Post(":import_id/cancel") cancel(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("import_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(req.identity!.id, org, id);
  }
}
