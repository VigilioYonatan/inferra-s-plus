import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { OrganizationsService } from "../../../../organizations/application/services/organizations.service";
import { InferenceService } from "../../../application/services/inference.service";
import {
  type ChatCompletionRequestDto,
  chatCompletionRequestDto,
} from "../dto/chat-completion.request.dto";
@Controller("api/v1/organizations/:organization_id/playground")
@UseGuards(IdentityGuard)
export class PlaygroundController {
  constructor(
    private readonly service: InferenceService,
    private readonly organizations: OrganizationsService,
  ) {}
  @Post("chat") async chat(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(chatCompletionRequestDto))
    input: ChatCompletionRequestDto,
    @Res() res: Response,
  ) {
    await this.organizations.requireMembership(
      req.identity!.id,
      org,
      "developer",
    );
    return this.service.createChatCompletion(org, input, req, res);
  }
}
