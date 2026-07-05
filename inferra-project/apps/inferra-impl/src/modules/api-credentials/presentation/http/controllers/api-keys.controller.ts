import {
  Body,
  Controller,
  Delete,
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
import { IdentityService } from "../../../../identity/application/services/identity.service";
import { ApiKeysService } from "../../../application/services/api-keys.service";
import {
  type CreateApiKeyRequestDto,
  createApiKeyRequestDto,
} from "../dto/create-api-key.request.dto";
@Controller("api/v1/organizations/:organization_id/api-keys")
@UseGuards(IdentityGuard)
export class ApiKeysController {
  constructor(
    private readonly service: ApiKeysService,
    private readonly identity: IdentityService,
  ) {}
  @Get() listApiKeys(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.listApiKeys(req.identity!.id, org);
  }
  @Get(":key_id") async getApiKey(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("key_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getApiKey(req.identity!.id, org, id);
  }
  @Post() async createApiKey(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createApiKeyRequestDto)) input: CreateApiKeyRequestDto,
  ) {
    await this.identity.requireRecentStepUp(
      req.identity!.id,
      req.cookies?.inferra_session,
    );
    return this.service.createApiKey(req.identity!.id, org, input);
  }
  @Post(":key_id/rotate") async rotateApiKey(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("key_id", ParseUUIDPipe) id: string,
  ) {
    await this.identity.requireRecentStepUp(
      req.identity!.id,
      req.cookies?.inferra_session,
    );
    return this.service.rotateApiKey(req.identity!.id, org, id);
  }
  @Delete(":key_id") async revokeApiKey(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("key_id", ParseUUIDPipe) id: string,
  ) {
    await this.identity.requireRecentStepUp(
      req.identity!.id,
      req.cookies?.inferra_session,
    );
    return this.service.revokeApiKey(req.identity!.id, org, id);
  }
}
