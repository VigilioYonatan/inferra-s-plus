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
import { PlaygroundSessionsService } from "../../../application/services/playground-sessions.service";
import {
  type CreatePlaygroundSessionRequestDto,
  createPlaygroundSessionRequestDto,
  type SavePlaygroundSessionRequestDto,
  savePlaygroundSessionRequestDto,
} from "../dto/playground-session.request.dto";
@Controller("api/v1/organizations/:organization_id/playground/sessions")
@UseGuards(IdentityGuard)
export class PlaygroundSessionsController {
  constructor(private readonly service: PlaygroundSessionsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createPlaygroundSessionRequestDto))
    input: CreatePlaygroundSessionRequestDto,
  ) {
    return this.service.create(req.identity!.id, org, input.title);
  }
  @Get(":session_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("session_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Patch(":session_id") save(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("session_id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(savePlaygroundSessionRequestDto))
    input: SavePlaygroundSessionRequestDto,
  ) {
    return this.service.save(req.identity!.id, org, id, input);
  }
}
