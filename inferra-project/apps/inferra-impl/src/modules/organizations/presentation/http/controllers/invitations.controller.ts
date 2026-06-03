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
import { InvitationsService } from "../../../application/services/invitations.service";
import {
  type AcceptInvitationRequestDto,
  acceptInvitationRequestDto,
  type InviteMemberRequestDto,
  inviteMemberRequestDto,
} from "../dto/invite-member.request.dto";
@Controller("api/v1")
@UseGuards(IdentityGuard)
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}
  @Get("organizations/:organization_id/invitations") list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post("organizations/:organization_id/invitations") invite(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(inviteMemberRequestDto)) input: InviteMemberRequestDto,
  ) {
    return this.service.invite(req.identity!.id, org, input);
  }
  @Post("organizations/:organization_id/invitations/:invitation_id/revoke")
  revoke(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("invitation_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.revoke(req.identity!.id, org, id);
  }
  @Post("invitations/accept") accept(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(acceptInvitationRequestDto))
    input: AcceptInvitationRequestDto,
  ) {
    return this.service.accept(
      req.identity!.id,
      req.identity!.email,
      input.token,
    );
  }
}
